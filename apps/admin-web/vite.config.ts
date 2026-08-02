import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const dirname = path.dirname(fileURLToPath(import.meta.url));

// https://vite.dev/config/
export default defineConfig({
  // 세 앱이 같은 Supabase를 쓰므로 .env는 레포 루트에 한 벌만 둔다.
  envDir: path.resolve(dirname, "../.."),
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(dirname, "src"),
    },
  },
});
