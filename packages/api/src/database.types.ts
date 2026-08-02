/**
 * ⚠️ 이 파일은 `pnpm gen:db-types`로 덮어써집니다. 직접 수정하지 마세요.
 * 파생 타입이 필요하면 `src/types.ts`에 작성하세요.
 *
 * 아직 Supabase 프로젝트를 만들기 전이라, supabase/migrations 의 DDL을 보고
 * CLI가 뽑아줄 형태와 동일하게 손으로 채워둔 상태입니다.
 * 프로젝트를 만든 뒤 위 명령을 한 번 돌리면 실제 생성 결과로 교체됩니다.
 */
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      exhibits: {
        Row: {
          client_id: string | null;
          created_at: string;
          id: string;
          image_path: string;
          message: string;
        };
        Insert: {
          client_id?: string | null;
          created_at?: string;
          id?: string;
          image_path: string;
          message?: string;
        };
        Update: {
          client_id?: string | null;
          created_at?: string;
          id?: string;
          image_path?: string;
          message?: string;
        };
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};
