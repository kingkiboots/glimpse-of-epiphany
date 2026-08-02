-- 수련회 참가자가 올린 사진 + 감사 메시지 한 건 = exhibits 레코드 한 행.
-- mobile-web이 INSERT 하고, projector-web이 SELECT + Realtime으로 구독한다.
-- 백엔드 서버 없이 anon 키로만 접근하므로 모든 권한 통제는 RLS로 한다.

-- ---------------------------------------------------------------------------
-- 1. 테이블
-- ---------------------------------------------------------------------------
create table if not exists public.exhibits (
  id uuid primary key default gen_random_uuid(),
  -- Storage 버킷 내부 경로 (예: "9f1c....webp"). 공개 URL은 클라이언트에서 조합한다.
  image_path text not null,
  message text not null default '',
  -- 부적절한 게시물을 삭제하지 않고 화면에서만 내리기 위한 플래그 (운영자가 대시보드에서 조작)
  is_hidden boolean not null default false,
  created_at timestamptz not null default now(),
  constraint exhibits_image_path_length check (char_length(image_path) between 1 and 255),
  constraint exhibits_message_length check (char_length(message) <= 500)
);

-- 프로젝터는 "숨김이 아닌 것을 최신순으로"만 조회한다.
create index if not exists exhibits_visible_created_at_idx
  on public.exhibits (created_at desc)
  where is_hidden = false;

-- ---------------------------------------------------------------------------
-- 2. 테이블 RLS
-- ---------------------------------------------------------------------------
alter table public.exhibits enable row level security;

drop policy if exists "exhibits: anyone can read visible" on public.exhibits;
create policy "exhibits: anyone can read visible"
  on public.exhibits
  for select
  to anon, authenticated
  using (is_hidden = false);

-- 참가자는 생성만 가능하다. 숨김 상태로 만들어 올리는 것은 막는다.
drop policy if exists "exhibits: anyone can insert" on public.exhibits;
create policy "exhibits: anyone can insert"
  on public.exhibits
  for insert
  to anon, authenticated
  with check (is_hidden = false);

-- update / delete 정책은 만들지 않는다 => anon은 수정·삭제 불가.

-- ---------------------------------------------------------------------------
-- 3. Realtime 퍼블리케이션
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
-- anon에게 delete를 열어주면 참가자 누구나 전체 이미지를 지울 수 있다.
-- 그 대신 레코드 생성이 실패한 이미지는 고아 파일로 남는데,
-- 실패는 드물고 파일당 300KB 수준이라 운영 후 대시보드에서 일괄 정리하는 편이 안전하다.
