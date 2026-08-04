-- 전시물을 올린 지 2시간이 지나면 자동으로 지운다.
--
-- 정책이 두 번 바뀌었다. 처음에는 5분이었고(20260802000100), 한 번 걷어냈다가
-- (20260804000000) 여기서 2시간으로 되살린다.
--
-- 전시가 2시간 반이라 초반에 올린 사진은 행사가 끝나기 전에 사라진다. 프로젝터
-- 자리가 18칸뿐이라 업로드가 이어지는 한 그 사진들은 이미 밀려나 있을 시점이지만,
-- 업로드가 뜸하면 화면이 헐거워질 수 있다. 그때는 이 값을 올린다.
--
-- 자정 기준이 아니라 "올린 지 2시간" 기준으로 두는 이유는 타임존 때문이다.
-- Supabase의 pg_cron은 UTC로 돌기 때문에 한국 자정에 맞추려면 스케줄을 15시로 밀고
-- 삭제 조건도 Asia/Seoul로 끊어야 하는데, 여기서 실수하면 행사 도중에 사진이
-- 통째로 날아간다. interval은 타임존이 개입하지 않아 그 위험이 없다.
--
-- 남은 Storage 파일은 cleanup-orphan-images Edge Function이 뒤따라 정리한다.

create extension if not exists pg_cron;

create or replace function public.delete_expired_exhibits()
returns void
language sql
security definer
set search_path = public
as $$
  delete from public.exhibits
  where created_at < now() - interval '2 hours';
$$;

comment on function public.delete_expired_exhibits is
  '올린 지 2시간이 지난 전시물을 삭제한다. pg_cron이 10분마다 호출한다. '
  '남은 Storage 파일은 cleanup-orphan-images Edge Function이 정리한다.';

-- 참가자(anon)가 직접 호출할 이유가 없다. 크론(postgres)만 실행한다.
--
-- anon/authenticated에서 회수하는 것으로는 막히지 않는다. PostgreSQL은 함수를 만들 때
-- EXECUTE를 PUBLIC에 기본 부여하고 모든 롤이 그 경로로 권한을 갖기 때문에,
-- PUBLIC에서 회수해야 실제로 닫힌다. public 스키마의 함수는 PostgREST가
-- /rpc/ 로 노출하므로 이 회수가 없으면 anon이 그대로 호출할 수 있다.
revoke execute on function public.delete_expired_exhibits() from public;

-- 10분마다 실행한다. 2시간짜리 수명에 분 단위 정밀도는 의미가 없고,
-- 1분마다 돌면 대부분 지울 것이 없는 헛수고만 늘어난다.
-- (재실행해도 중복 등록되지 않게 먼저 해제)
do $$
begin
  if exists (select 1 from cron.job where jobname = 'delete-expired-exhibits') then
    perform cron.unschedule('delete-expired-exhibits');
  end if;

  perform cron.schedule(
    'delete-expired-exhibits',
    '*/10 * * * *',
    $job$ select public.delete_expired_exhibits(); $job$
  );
end
$$;
