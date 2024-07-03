/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BASE_DOMAIN: string
  // thêm các biến môi trường khác tại đây
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
