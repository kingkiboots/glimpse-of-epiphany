export { getSupabaseClient, isSupabaseConfigured } from "./client";
export {
  getCurrentSession,
  signInAdmin,
  signOutAdmin,
  subscribeToAuthState,
} from "./auth";
export type { Session } from "./auth";
export {
  EXHIBIT_IMAGE_BUCKET,
  EXHIBIT_TTL_MINUTES,
  createExhibit,
  deleteExhibit,
  fetchExhibits,
  getExhibitImageUrl,
  subscribeToExhibits,
} from "./exhibit";
export type {
  CreateExhibitInput,
  Exhibit,
  ExhibitSubscriptionHandlers,
} from "./exhibit";
export type { ExhibitInsert, ExhibitRow } from "./types";
export type { Database, Json } from "./database.types";
