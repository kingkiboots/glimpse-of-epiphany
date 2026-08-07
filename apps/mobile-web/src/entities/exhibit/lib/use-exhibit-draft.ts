import { useContext } from "react";
import { ExhibitDraftContext } from "../model/exhibit-draft-context";
import type { ExhibitDraftContextValue } from "../model/types";

export const useExhibitDraft = (): ExhibitDraftContextValue => {
  const value = useContext(ExhibitDraftContext);

  if (!value) {
    throw new Error(
      "useExhibitDraft는 ExhibitDraftProvider 안에서만 사용할 수 있습니다.",
    );
  }

  return value;
};
