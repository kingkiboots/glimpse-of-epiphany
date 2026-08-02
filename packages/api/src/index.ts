export { getSupabaseClient, isSupabaseConfigured } from "./client";
export {
  EXHIBIT_IMAGE_BUCKET,
  createExhibit,
  fetchExhibits,
  getExhibitImageUrl,
  subscribeToExhibits,
} from "./exhibit";
export type { CreateExhibitInput, Exhibit } from "./exhibit";
export type { ExhibitInsert, ExhibitRow } from "./types";
export type { Database, Json } from "./database.types";
