-- 전시물은 올라간 지 5분이 지나면 자동으로 사라진다.
--
-- 행 삭제는 순수 SQL 크론으로 처리한다. Edge Function에 맡기지 않는 이유는
-- 함수가 배포되지 않았거나 실패해도 "5분간만 전시된다"는 참가자와의 약속이
-- 깨지지 않아야 하기 때문이다. 함수가 죽으면 파일 정리만 밀리고,
-- 화면에서 사라지는 것은 보장된다.
--
-- pg_cron의 최소 주기는 1분이라 실제 삭제 시점은 5~6분 사이가 된다.

create extension if not exists pg_cron;

-- ---------------------------------------------------------------------------
-- 만료된 전시물 삭제
-- ---------------------------------------------------------------------------
create or replace function public.delete_expired_exhibits()
returns void
language sql
security definer
set search_path = public
as $$
  delete from public.exhibits
  where created_at < now() - interval '5 minutes';
$$;

comment on function public.delete_expired_exhibits is
  '5분이 지난 전시물을 삭제한다. pg_cron이 1분마다 호출한다. '
  '남은 Storage 파일은 cleanup-orphan-images Edge Function이 정리한다.';

-- 참가자(anon)가 직접 호출할 이유가 없다. 크론(postgres)만 실행한다.
revoke execute on function public.delete_expired_exhibits() from anon, authenticated;

-- ---------------------------------------------------------------------------
-- 1분마다 실행되도록 등록 (재실행해도 중복 등록되지 않게 먼저 해제)
-- ---------------------------------------------------------------------------
do $$
begin
  if exists (select 1 from cron.job where jobname = 'delete-expired-exhibits') then
    perform cron.unschedule('delete-expired-exhibits');
  end if;

  perform cron.schedule(
    'delete-expired-exhibits',
    '* * * * *',
    $job$ select public.delete_expired_exhibits(); $job$
  );
end
$$;
