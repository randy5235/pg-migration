import pgPromise from 'pg-promise';
import { IClient } from 'pg-promise/typescript/pg-subset';
import { getHistorySQL } from './getHistorySQL';
import { applyPatchAndUpdateHistory } from './applyPatchAndUpdateHistory';
import path from 'path';

export const getHistory = async (db: pgPromise.IDatabase<{}, IClient>): Promise<string[]> => {
  try {
    // await applyPatchAndUpdateHistory(db, './db/migrations/', ['migration_history.sql']);
    const patchHistory = await db.query(getHistorySQL);
    if (patchHistory.length === 0) {
      return [];
    }
    return patchHistory.map((element: { filename: any; }) => element.filename);
  } catch (error: any) {
    throw Error('An error has occurred');
  }
}

