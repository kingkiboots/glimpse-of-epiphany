-- 버킷이 jpeg도 받도록 연다.
--
-- 원래 webp만 허용했는데, 카카오톡 인앱 브라우저(iOS)에서 업로드가 413으로 막혔다.
-- 원인은 캔버스의 webp 인코딩 미지원이다. toDataURL("image/webp")는 지원하지 않는
-- 브라우저에서 오류를 내지 않고 명세대로 조용히 PNG를 돌려주는데, PNG는 무손실이라
-- quality가 먹지 않아 300KB로 줄일 방법이 없다. 그 상태로 webp 딱지만 붙어 올라가니
-- mime 검사는 통과하고 file_size_limit에서 터졌다.
--
-- 참가자에게 링크를 카카오톡으로 뿌리는 행사라 그 경로가 곧 주 경로다. jpeg를
-- 열어두면 webp를 인코딩하지 못하는 기기도 전시에 참여할 수 있다. 프로젝터는
-- 사진을 그대로 그리기만 하므로 형식이 달라도 상관없다.
--
-- 클라이언트도 같은 목록을 쓴다: packages/api의 UPLOAD_IMAGE_TYPES.

update storage.buckets
set allowed_mime_types = array['image/webp', 'image/jpeg']
where id = 'exhibit-images';
