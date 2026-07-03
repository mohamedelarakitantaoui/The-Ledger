/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Optional Anthropic API key for AI document generation. */
  readonly VITE_ANTHROPIC_API_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
