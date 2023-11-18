import { pgp } from '.';

export const applyPatchAndUpdateHistory = async (db: { tx: (arg0: (db: any) => Promise<void>) => Promise<any>; }, sqlDirectory:string , fileList: string[]) => {
  for (let i = 0; i < fileList.length; i++) {
    try {
      const gf = new pgp.QueryFile(`${sqlDirectory}${fileList[i]}`);
      db.tx(async (db) => {
        if (fileList[i] !== 'migration_history.sql') {
          await db.query('SELECT filename FROM patch_history');
        }
        await db.query(gf);
        await db.query(`INSERT INTO patch_history (filename) VALUES ('${fileList[i]}')`);
      }).then(() => console.log(`Successfully Applied patch ${fileList[i]}`));
    } catch {
      throw Error(`Error applying ${fileList[i]} patch`);
    }
  }
};
