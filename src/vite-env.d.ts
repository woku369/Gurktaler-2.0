/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_WEBDAV_URL: string;
  readonly VITE_WEBDAV_URL_DEV: string;
  readonly VITE_WEBDAV_PATH: string;
  readonly VITE_WEBDAV_FILE: string;
  readonly VITE_PWA_URL: string;
  readonly DEV: boolean;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
