export { getSupabaseClient } from "./src/client";
export {
  getCurrentSession,
  signInAdmin,
  signOutAdmin,
  subscribeToAuthState,
} from "./src/auth";
export type { Session } from "./src/auth";
export {
  EXHIBIT_IMAGE_BUCKET,
  EXHIBIT_TTL_HOURS,
  MAX_UPLOAD_BYTES,
  UPLOAD_IMAGE_TYPES,
  createExhibit,
  deleteExhibit,
  fetchExhibits,
  getExhibitImageUrl,
  subscribeToExhibits,
} from "./src/exhibit";
export type {
  CreateExhibitInput,
  Exhibit,
  ExhibitSubscriptionHandlers,
} from "./src/exhibit";
export type { ExhibitInsert, ExhibitRow } from "./src/types";
export type { Database, Json } from "./src/database.types";
