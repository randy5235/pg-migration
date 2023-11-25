export declare const applyPatchAndUpdateHistory: (db: {
    tx: (arg0: (db: any) => Promise<void>) => Promise<any>;
}, sqlDirectory: string, fileList: string[]) => Promise<void>;
