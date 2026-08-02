/** 참가자가 작성 중인(아직 서버로 올리지 않은) 전시물 한 건. */
export type ExhibitDraft = {
  file: File | null;
  message: string;
};

export type ExhibitDraftContextValue = ExhibitDraft & {
  /** file로부터 만든 object URL. 파일이 없으면 null. */
  previewUrl: string | null;
  setFile: (file: File | null) => void;
  setMessage: (message: string) => void;
  reset: () => void;
};
