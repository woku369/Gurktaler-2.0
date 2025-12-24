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
      // Synology Sync IPC
      syncRead: (networkPath: string) => Promise<{ success: boolean; data?: string; error?: string }>;
      syncWrite: (networkPath: string, content: string) => Promise<{ success: boolean; error?: string }>;
      syncTest: (networkPath: string) => Promise<{ success: boolean; accessible?: boolean; error?: string }>;
      
      // Zentrale NAS-Speicher APIs
      fileReadJson: (filePath: string) => Promise<{ success: boolean; data?: unknown; error?: string }>;
      fileWriteJson: (filePath: string, data: unknown) => Promise<{ success: boolean; error?: string }>;
      fileListDirectory: (dirPath: string) => Promise<{ 
        success: boolean; 
        files?: Array<{
          name: string;
          path: string;
          isDirectory: boolean;
          size: number;
          modified: string;
        }>; 
        error?: string 
      }>;
      fileUploadImage: (targetPath: string, dataUrl: string) => Promise<{ success: boolean; path?: string; error?: string }>;
      fileUploadDocument: (targetPath: string, buffer: Buffer) => Promise<{ success: boolean; path?: string; error?: string }>;
      fileDeleteFile: (filePath: string) => Promise<{ success: boolean; error?: string }>;
      fileMoveFile: (sourcePath: string, targetPath: string) => Promise<{ success: boolean; path?: string; error?: string }>;
      fileReadImage: (filePath: string) => Promise<{ success: boolean; dataUrl?: string; error?: string }>;
      fileCreateDirectory: (dirPath: string) => Promise<{ success: boolean; error?: string }>;
    };
  }
}
