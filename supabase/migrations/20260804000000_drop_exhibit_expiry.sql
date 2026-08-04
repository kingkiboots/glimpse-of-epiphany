-- 5분 자동 만료를 걷어낸다.
--
-- 전시물은 이제 운영자가 내리기 전까지 남는다. 삭제 경로는 관리자 수동 삭제
-- 하나만 남는다.
--
-- Storage 파일을 뒤따라 정리하는 cleanup-orphan-images Edge Function은 그대로
-- 필요하다. 행이 사라지는 계기가 "만료"에서 "관리자 삭제"로 바뀔 뿐,
-- 행 없는 파일을 치우는 역할은 같다.
--
-- pg_cron 확장은 남겨둔다. 대시보드 Cron으로 등록한 cleanup-orphan-images
-- 호출이 이 확장 위에서 돌고 있다.

do $$
begin
  if exists (select 1 from cron.job where jobname = 'delete-expired-exhibits') then
    perform cron.unschedule('delete-expired-exhibits');
  end if;
end
$$;

drop function if exists public.delete_expired_exhibits();
