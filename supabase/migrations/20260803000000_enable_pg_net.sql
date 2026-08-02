-- Postgres에서 HTTP 요청을 보낼 수 있게 하는 확장.
--
-- 크론이 cleanup-orphan-images Edge Function을 호출하는 데 필요하다.
-- 대시보드의 Cron UI도 이 확장이 없으면 "Supabase Edge Function" 유형 자체를
-- 고를 수 없다 (내부적으로 net.http_post 를 쓰기 때문).
--
-- 크론 등록 자체는 여기 두지 않는다. 호출 URL과 인증 키가 필요한데
-- 키를 레포에 커밋할 수 없어서, 등록은 대시보드나 SQL Editor에서 1회 수행한다.
-- 자세한 절차는 supabase/README.md 를 참고할 것.

create extension if not exists pg_net;
