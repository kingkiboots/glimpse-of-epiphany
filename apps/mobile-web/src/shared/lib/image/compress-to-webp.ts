import imageCompression from "browser-image-compression";

/** 업로드 목표 용량. 150명이 동시에 올려도 버티도록 작게 유지한다. */
const MAX_SIZE_MB = 0.3;

/** 긴 변 기준 최대 해상도. FHD 빔프로젝터에 꽉 채워도 충분한 크기. */
const MAX_WIDTH_OR_HEIGHT = 1920;

const toWebpFileName = (fileName: string): string => {
  const baseName = fileName.replace(/\.[^./\\]+$/, "");

  return `${baseName || "exhibit"}.webp`;
};

/**
 * 사용자가 고른 원본 이미지를 webp로 변환하면서 압축한다.
 * 변환은 메인 스레드를 막지 않도록 web worker에서 수행된다.
 */
export const compressToWebp = async (file: File): Promise<File> => {
  const compressed = await imageCompression(file, {
    maxSizeMB: MAX_SIZE_MB,
    maxWidthOrHeight: MAX_WIDTH_OR_HEIGHT,
    fileType: "image/webp",
    useWebWorker: true,
    initialQuality: 0.8,
  });

  // 라이브러리가 원본 확장자를 그대로 유지하므로 webp로 맞춰준다.
  return new File([compressed], toWebpFileName(file.name), {
    type: "image/webp",
    lastModified: Date.now(),
  });
};
