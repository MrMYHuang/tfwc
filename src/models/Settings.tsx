export interface Settings {
    version: number;
    dbUpdateDate: string;
    alertUpdateOfflineData: boolean;
    hasAppLog: boolean;
    theme: number;
    uiFontSize: number;
    isInitialized: boolean;
}

export const defaultSettings = {
    version: 1,
    dbUpdateDate: new Date().toISOString(),
    alertUpdateOfflineData: true,
    hasAppLog: true,
    theme: 2,
    uiFontSize: 24,
    isInitialized: false,
} as Settings;
