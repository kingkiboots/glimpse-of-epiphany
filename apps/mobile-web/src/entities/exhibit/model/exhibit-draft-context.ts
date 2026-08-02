import { createContext } from "react";
import type { ExhibitDraftContextValue } from "./types";

export const ExhibitDraftContext =
  createContext<ExhibitDraftContextValue | null>(null);
