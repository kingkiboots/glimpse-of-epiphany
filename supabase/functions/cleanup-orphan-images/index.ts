// exhibits 테이블에 대응하는 행이 없는 Storage 파일을 지운다.
//
// 관리자가 내렸든(admin-web), 2시간이 지나 만료됐든(delete_expired_exhibits 크론),
// 업로드 도중 INSERT가 실패해 파일만 남았든, 결과는 "행이 없는 파일이 있다"로 같고
// 정리는 전부 여기서 처리한다. DB가 단일 진실 공급원이고 CDN이 뒤를 따른다.
//
// Storage 파일은 SQL로 지울 수 없다. storage.objects에서 행을 지워도 실제 파일은
// 남기 때문에, service_role 키로 Storage API를 호출하는 이 함수가 필요하다.
// service_role 키가 정당하게 쓰이는 유일한 자리다 (서버에서만 실행되므로).
//
// 배포:   main에 머지하면 .github/workflows/deploy-edge-functions.yml 이 자동으로 배포한다.
//         (대시보드에서 직접 편집하면 이 파일과 실제 배포본이 갈라지므로 하지 말 것)
// 스케줄: 대시보드 > Integrations > Cron 에서 5분마다 이 함수를 호출하도록 등록.
//         이건 자동화되지 않는 1회성 설정이다. (pg_net 확장이 켜져 있어야 한다)
//         관리자가 사진을 내리면 화면에서는 Realtime으로 즉시 사라지므로,
//         뒤따르는 파일 정리는 몇 분 늦어도 된다.

import { createClient } from "npm:@supabase/supabase-js@2";

const BUCKET = "exhibit-images";

/**
 * 방금 올라와 아직 INSERT가 끝나지 않은 파일을 고아로 오인하지 않기 위한 유예.
 * 업로드와 INSERT 사이 간격은 보통 수백 ms라 2분이면 충분히 넉넉하다.
 */
const GRACE_PERIOD_MS = 2 * 60 * 1000;

/** Storage list API의 한 번 호출당 최대 개수 */
const PAGE_SIZE = 1000;

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  { auth: { persistSession: false } },
);

/** 버킷의 모든 파일을 페이지 단위로 훑는다. */
const listAllObjects = async () => {
  const objects: { name: string; created_at: string }[] = [];

  for (let offset = 0; ; offset += PAGE_SIZE) {
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .list("", { limit: PAGE_SIZE, offset });

    if (error) {
      throw new Error(`Storage 목록 조회 실패: ${error.message}`);
    }

    if (!data || data.length === 0) {
      return objects;
    }

    for (const item of data) {
      objects.push({ name: item.name, created_at: item.created_at });
    }

    if (data.length < PAGE_SIZE) {
      return objects;
    }
  }
};

Deno.serve(async () => {
  try {
    const [objects, { data: rows, error }] = await Promise.all([
      listAllObjects(),
      supabase.from("exhibits").select("image_path"),
    ]);

    if (error) {
      throw new Error(`exhibits 조회 실패: ${error.message}`);
    }

    const referenced = new Set((rows ?? []).map((row) => row.image_path));
    const cutoff = Date.now() - GRACE_PERIOD_MS;

    const orphans = objects
      .filter((object) => !referenced.has(object.name))
      .filter((object) => new Date(object.created_at).getTime() < cutoff)
      .map((object) => object.name);

    if (orphans.length === 0) {
      return Response.json({ scanned: objects.length, deleted: 0 });
    }

    // remove()는 한 번에 1000개까지만 받는다.
    for (let i = 0; i < orphans.length; i += PAGE_SIZE) {
      const batch = orphans.slice(i, i + PAGE_SIZE);
      const { error: removeError } = await supabase.storage
        .from(BUCKET)
        .remove(batch);

      if (removeError) {
        throw new Error(`파일 삭제 실패: ${removeError.message}`);
      }
    }

    return Response.json({ scanned: objects.length, deleted: orphans.length });
  } catch (cause) {
    const message = cause instanceof Error ? cause.message : String(cause);

    console.error("cleanup-orphan-images 실패", message);

    return Response.json({ error: message }, { status: 500 });
  }
});
