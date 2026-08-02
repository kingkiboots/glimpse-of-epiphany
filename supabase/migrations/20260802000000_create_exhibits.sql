-- 수련회 참가자가 올린 사진 + 감사 메시지 한 건 = exhibits 레코드 한 행.
-- mobile-web이 INSERT 하고, projector-web이 SELECT + Realtime으로 구독하고,
-- admin-web이 DELETE 한다.
--
-- 참가자는 anon 키로만 접근하므로 권한 통제는 전부 RLS로 한다.
-- 삭제는 하드킬이다. 소프트 삭제 플래그를 두지 않고 행을 지운다.
-- 행이 사라지면 Storage 파일도 따라 지워진다 (supabase/functions/cleanup-orphan-images).
-- 즉 이 테이블이 단일 진실 공급원이고, CDN은 그 뒤를 따라온다.

-- ---------------------------------------------------------------------------
-- 1. 테이블
-- ---------------------------------------------------------------------------
create table if not exists public.exhibits (
  id uuid primary key default gen_random_uuid(),
  -- Storage 버킷 내부 경로 (예: "9f1c....webp"). 공개 URL은 클라이언트에서 조합한다.
  -- unique: 여러 행이 같은 파일을 가리키면 한 행을 지워도 파일이 남아 상태가 꼬인다.
  image_path text not null unique,
  message text not null default '',
  -- 업로드한 기기를 구분하는 값 (localStorage에 저장된 임의 UUID).
  -- 한 사람이 반복해서 올릴 때 운영자가 기기 단위로 정리할 수 있게 한다.
  -- nullable인 이유: 값이 없다고 업로드가 실패하면 안 된다. 참가자가 사진을
  -- 올리는 것이 이 앱의 전부이고, 이 값은 운영 편의를 위한 부가 정보다.
  client_id uuid,
  created_at timestamptz not null default now(),
  constraint exhibits_image_path_length check (char_length(image_path) between 1 and 255),
  -- 입력 UI는 100자로 제한한다. DB는 그 두 배까지만 받아준다.
  constraint exhibits_message_length check (char_length(message) <= 200)
);

-- 프로젝터는 최신순 조회, 만료 작업은 오래된 것부터 삭제. 둘 다 이 인덱스를 쓴다.
create index if not exists exhibits_created_at_idx
  on public.exhibits (created_at desc);

-- ---------------------------------------------------------------------------
-- 2. 테이블 RLS
-- ---------------------------------------------------------------------------
alter table public.exhibits enable row level security;

drop policy if exists "exhibits: anyone can read" on public.exhibits;
create policy "exhibits: anyone can read"
  on public.exhibits
  for select
  to anon, authenticated
  using (true);

drop policy if exists "exhibits: anyone can insert" on public.exhibits;
create policy "exhibits: anyone can insert"
  on public.exhibits
  for insert
  to anon, authenticated
  with check (true);

-- 삭제는 로그인한 관리자만. anon에게 열어주면 URL을 아는 참가자 누구나
-- 전체 전시물을 지울 수 있다.
drop policy if exists "exhibits: admin can delete" on public.exhibits;
create policy "exhibits: admin can delete"
  on public.exhibits
  for delete
  to authenticated
  using (true);

-- update 정책은 만들지 않는다. 한 번 올린 전시물은 수정 대상이 아니다.

-- ---------------------------------------------------------------------------
-- 3. Realtime 퍼블리케이션
--    프로젝터가 INSERT(새 사진)와 DELETE(관리자 삭제 / 5분 만료)를 모두 구독한다.
--    DELETE 페이로드에는 기본키만 오는데, 큐에서 id로 빼는 데는 그거면 충분하므로
--    replica identity는 기본값(default)을 그대로 둔다.
-- ---------------------------------------------------------------------------
do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'exhibits'
  ) then
    alter publication supabase_realtime add table public.exhibits;
  end if;
end
$$;

-- ---------------------------------------------------------------------------
-- 4. Storage 버킷
--    public = true => CDN 공개 URL로 바로 서빙 (프로젝터가 빠르게 로드)
--    클라이언트에서 webp 1장(긴 변 1920px, ~300KB)으로 압축해 올린다.
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'exhibit-images',
  'exhibit-images',
  true,
  1048576, -- 1MB. 클라이언트 목표치(300KB)를 넘는 파일을 서버에서 한 번 더 거른다.
  array['image/webp']
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "exhibit images: anyone can read" on storage.objects;
create policy "exhibit images: anyone can read"
  on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'exhibit-images');

drop policy if exists "exhibit images: anyone can upload" on storage.objects;
create policy "exhibit images: anyone can upload"
  on storage.objects
  for insert
  to anon, authenticated
  with check (bucket_id = 'exhibit-images');

-- delete 정책은 만들지 않는다.
-- 파일 삭제는 Edge Function이 service_role 키로 수행하는데, service_role은
-- RLS를 우회하므로 정책이 필요 없다. anon/authenticated에게는 닫아둔다.
