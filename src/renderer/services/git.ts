/**
 * Git Integration Service
 * 
 * Stellt Git-Operationen für automatischen Sync zur Verfügung.
 * Nutzt Electron IPC für Kommunikation mit Git über Node.js Backend.
 */

export interface GitStatus {
  branch: string;
  ahead: number;
  behind: number;
  modified: string[];
  untracked: string[];
  staged: string[];
  hasUncommitted: boolean;
  hasRemote: boolean;
  lastCommit?: {
    hash: string;
    message: string;
    author: string;
    date: string;
  };
}

export interface GitConfig {
  autoCommit: boolean;
  autoPush: boolean;
  commitMessagePrefix: string;
  userName?: string;
  userEmail?: string;
}

interface GitResult {
  success: boolean;
  data?: GitStatus;
  error?: string;
}

/**
 * Prüft ob Git im aktuellen Verzeichnis initialisiert ist
 */
export async function isGitRepository(): Promise<boolean> {
  try {
    const result = await window.electron.invoke('git:status') as GitResult;
    return result.success;
  } catch {
    return false;
  }
}

/**
 * Holt den aktuellen Git-Status
 */
export async function getGitStatus(): Promise<GitStatus | null> {
  try {
    const result = await window.electron.invoke('git:status') as GitResult;
    if (result.success && result.data) {
      return result.data;
    }
    return null;
  } catch (error) {
    console.error('Git status failed:', error);
    return null;
  }
}

/**
 * Committed alle Änderungen
 */
export async function commitChanges(message: string): Promise<boolean> {
  try {
    const result = await window.electron.invoke('git:commit', { message }) as GitResult;
    return result.success;
  } catch (error) {
    console.error('Git commit failed:', error);
    return false;
  }
}

/**
 * Pushed Commits zum Remote
 */
export async function pushChanges(): Promise<boolean> {
  try {
    const result = await window.electron.invoke('git:push') as GitResult;
    return result.success;
  } catch (error) {
    console.error('Git push failed:', error);
    return false;
  }
}

/**
 * Pulled Änderungen vom Remote
 */
export async function pullChanges(): Promise<boolean> {
  try {
    const result = await window.electron.invoke('git:pull') as GitResult;
    return result.success;
  } catch (error) {
    console.error('Git pull failed:', error);
    return false;
  }
}

/**
 * Holt die Git-Konfiguration
 */
export function getGitConfig(): GitConfig {
  const stored = localStorage.getItem('git-config');
  if (stored) {
    return JSON.parse(stored);
  }
  
  return {
    autoCommit: true,
    autoPush: false,
    commitMessagePrefix: '[Auto]',
    userName: undefined,
    userEmail: undefined
  };
}

/**
 * Speichert die Git-Konfiguration
 */
export function saveGitConfig(config: GitConfig): void {
  localStorage.setItem('git-config', JSON.stringify(config));
}

/**
 * Fügt ein Remote-Repository hinzu oder aktualisiert die URL
 */
export async function addRemote(name: string, url: string): Promise<{ success: boolean; updated?: boolean; error?: string }> {
  try {
    const result = await window.electron.invoke('git:add-remote', { name, url }) as GitResult & { updated?: boolean };
    return {
      success: result.success,
      updated: result.updated,
      error: result.error
    };
  } catch (error) {
    console.error('Git add remote failed:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Listet alle konfigurierten Remotes auf
 */
export async function listRemotes(): Promise<Array<{ name: string; url: string; type: string }>> {
  try {
    const result = await window.electron.invoke('git:list-remotes') as GitResult & { data?: Array<{ name: string; url: string; type: string }> };
    if (result.success && result.data) {
      return result.data;
    }
    return [];
  } catch (error) {
    console.error('Git list remotes failed:', error);
    return [];
  }
}

/**
 * Auto-Commit Helper für Datenänderungen
 */
export async function autoCommit(entityType: string, action: 'created' | 'updated' | 'deleted', entityName?: string): Promise<void> {
  const config = getGitConfig();
  
  if (!config.autoCommit) {
    return;
  }
  
  const isRepo = await isGitRepository();
  if (!isRepo) {
    return;
  }
  
  const actionMap = {
    created: 'erstellt',
    updated: 'aktualisiert',
    deleted: 'gelöscht'
  };
  
  const message = entityName 
    ? `${config.commitMessagePrefix} ${entityType} "${entityName}" ${actionMap[action]}`
    : `${config.commitMessagePrefix} ${entityType} ${actionMap[action]}`;
  
  const committed = await commitChanges(message);
  
  if (committed && config.autoPush) {
    await pushChanges();
  }
}
