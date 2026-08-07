import imageCompression from "browser-image-compression";
import { MAX_UPLOAD_BYTES, UPLOAD_IMAGE_TYPES } from "@packages/api";

/** 업로드 목표 용량. 150명이 동시에 올려도 버티도록 작게 유지한다. */
const MAX_SIZE_MB = 0.5;

/** 긴 변 기준 최대 해상도. FHD 빔프로젝터에 꽉 채워도 충분한 크기. */
const MAX_WIDTH_OR_HEIGHT = 1920;

/** 첫 시도가 버킷 한도를 넘겼을 때 다시 줄여볼 해상도. */
const FALLBACK_WIDTH_OR_HEIGHT = 1280;

const EXTENSION_BY_TYPE: Record<string, string> = {
  "image/webp": "webp",
  "image/jpeg": "jpg",
};

let webpEncodingSupport: boolean | undefined;

/**
 * 캔버스가 webp로 "인코딩"할 수 있는지 본다. webp를 화면에 그릴 수 있는 것과는 다른
 * 이야기다. 지원하지 않는 브라우저에서 toDataURL("image/webp")는 오류를 내지 않고
 * 명세에 따라 조용히 PNG를 돌려준다. PNG는 무손실이라 quality가 먹지 않아
 * 압축이 사실상 불가능해지므로, 그런 환경에서는 처음부터 jpeg로 간다.
 */
const canEncodeWebp = (): boolean => {
  if (webpEncodingSupport !== undefined) {
    return webpEncodingSupport;
  }

  try {
    const canvas = document.createElement("canvas");
    canvas.width = 1;
    canvas.height = 1;

    webpEncodingSupport = canvas
      .toDataURL("image/webp")
      .startsWith("data:image/webp");
  } catch {
    webpEncodingSupport = false;
  }

  return webpEncodingSupport;
};

const compressOnce = (file: File, fileType: string, maxWidthOrHeight: number) =>
  imageCompression(file, {
    maxSizeMB: MAX_SIZE_MB,
    maxWidthOrHeight,
    fileType,
    useWebWorker: true,
    initialQuality: 0.8,
  });

const toUploadFile = (blob: Blob, originalName: string, type: string): File => {
  const baseName = originalName.replace(/\.[^./\\]+$/, "") || "exhibit";

  return new File([blob], `${baseName}.${EXTENSION_BY_TYPE[type]}`, {
    type,
    lastModified: Date.now(),
  });
};

/**
 * 사용자가 고른 원본 이미지를 업로드용으로 압축한다.
 * 변환은 메인 스레드를 막지 않도록 web worker에서 수행된다.
 *
 * 라이브러리의 maxSizeMB는 보장이 아니라 시도다. 내부적으로 최대 10회만 줄여보고
 * 목표에 못 미쳐도 그대로 반환하므로(오류를 내지 않는다), 결과의 크기와 실제 타입을
 * 여기서 반드시 확인해야 한다. 확인 없이 올리면 Storage가 413으로 되돌려준다.
 */
export const compressForUpload = async (file: File): Promise<File> => {
  const targetType = canEncodeWebp() ? "image/webp" : "image/jpeg";

  let compressed = await compressOnce(file, targetType, MAX_WIDTH_OR_HEIGHT);

  // 요청한 타입이 나왔는지 확인한다. 캔버스가 요청을 무시하고 PNG를 돌려주는
  // 경우가 있어서, 선언한 타입이 아니라 실제로 나온 타입을 믿는다.
  let actualType = compressed.type;

  if (!UPLOAD_IMAGE_TYPES.includes(actualType) && targetType !== "image/jpeg") {
    compressed = await compressOnce(file, "image/jpeg", MAX_WIDTH_OR_HEIGHT);
    actualType = compressed.type;
  }

  if (!UPLOAD_IMAGE_TYPES.includes(actualType)) {
    throw new Error(
      `이 브라우저에서 사진을 변환할 수 없습니다 (${actualType || "알 수 없는 형식"})`,
    );
  }

  if (compressed.size > MAX_UPLOAD_BYTES) {
    compressed = await compressOnce(file, actualType, FALLBACK_WIDTH_OR_HEIGHT);
  }

  if (compressed.size > MAX_UPLOAD_BYTES) {
    throw new Error(
      `사진을 충분히 줄이지 못했습니다 (${Math.round(compressed.size / 1024)}KB)`,
    );
  }

  return toUploadFile(compressed, file.name, actualType);
};
