/** 참가자가 작성 중인(아직 서버로 올리지 않은) 전시물 한 건. */
export type ExhibitDraft = {
  /** 갤러리에서 고른 원본 파일 */
  file: File | null;
  message: string;
};

export type ExhibitDraftContextValue = ExhibitDraft & {
  /** file로부터 만든 object URL. 파일이 없으면 null. */
  previewUrl: string | null;
  /**
   * 준비 화면에서 미리 변환해둔 webp. 아직 변환 전이면 null.
   * 항상 현재 file에 대응한다 (사진을 바꾸면 자동으로 비워진다).
   */
  compressedFile: File | null;
  setFile: (file: File | null) => void;
  setCompressedFile: (file: File) => void;
  setMessage: (message: string) => void;
  reset: () => void;
};
