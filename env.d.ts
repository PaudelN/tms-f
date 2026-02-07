/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  // Add more env variables as needed
  // readonly VITE_OTHER_VAR: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
