import type { Database } from "./database.types";

/**
 * 생성된 Database 타입에서 뽑아 쓰는 별칭.
 * database.types.ts는 CLI가 덮어쓰므로 손으로 쓰는 타입은 전부 여기에 둔다.
 */
type PublicTables = Database["public"]["Tables"];

export type ExhibitRow = PublicTables["exhibits"]["Row"];
export type ExhibitInsert = PublicTables["exhibits"]["Insert"];
