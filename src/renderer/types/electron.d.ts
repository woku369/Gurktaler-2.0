export {};

declare global {
  interface Window {
    electron: {
      invoke: (channel: string, ...args: unknown[]) => Promise<unknown>;
    };
    electronAPI: {
      dbQuery: (sql: string, params?: unknown[]) => Promise<unknown>;
      dbRun: (sql: string, params?: unknown[]) => Promise<unknown>;
      exportData: () => Promise<unknown>;
      importData: (data: string) => Promise<unknown>;
      getVersion: () => Promise<string>;
    };
  }
}
