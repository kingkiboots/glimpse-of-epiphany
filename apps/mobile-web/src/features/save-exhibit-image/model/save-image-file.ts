/**
 * 만든 이미지를 사용자가 간직할 수 있게 넘긴다.
 *
 * 웹에는 사진첩에 직접 쓰는 API가 없다. iOS Safari에서 <a download>는 사진첩이 아니라
 * 파일 앱으로 가기 때문에, 공유 시트를 띄워 사용자가 "이미지 저장"을 누르게 하는 것이
 * 사진첩에 닿는 유일한 경로다. 공유를 지원하지 않는 환경(주로 데스크톱)에서는
 * 내려받기로 떨어진다.
 */

export type SaveImageResult = "shared" | "downloaded" | "cancelled";

export const saveImageFile = async (
  blob: Blob,
  fileName: string,
): Promise<SaveImageResult> => {
  const file = new File([blob], fileName, { type: blob.type });

  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file] });

      return "shared";
    } catch (cause) {
      // 사용자가 공유 시트를 닫은 것은 실패가 아니다.
      if (cause instanceof Error && cause.name === "AbortError") {
        return "cancelled";
      }

      // 그 외의 공유 실패는 내려받기로 넘어간다.
    }
  }

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = fileName;
  anchor.click();

  URL.revokeObjectURL(url);

  return "downloaded";
};
