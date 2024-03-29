import { pgp } from '.';

export const applyPatchAndUpdateHistory = async (db: { tx: (arg0: (db: any) => Promise<void>) => Promise<any>; }, sqlDirectory: string, fileList: string[]) => {
  try {
    for (let i = 0; i < fileList.length; i++) {
      const gf = new pgp.QueryFile(`${sqlDirectory}${fileList[i]}`);
      await db.tx(
        async (db) => {
          await db.query(gf);
          await db.query(`INSERT INTO patch_history (filename) VALUES ('${fileList[i]}')`);
        });
      console.log(`Successfully Applied patch ${fileList[i]}`);
    }
  } catch (error) {
    throw error;
  }
};
