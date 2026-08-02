type ErrorType = {
  name: string;
  message: string;
};

export const DEFAULT_ERROR_MESSAGE = "오류가 발생했습니다.";

export const ERROR_TYPES: Record<string, ErrorType> = {
  "upload-failed": {
    name: "upload-failed",
    message: `사진을 업로드 할 수 없습니다.`,
  },
  "prepare-failed": {
    name: "prepare-failed",
    message: `사진을 준비할 수 없습니다.`,
  },
};
