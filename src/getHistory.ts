import pgPromise from 'pg-promise';
import { IClient } from 'pg-promise/typescript/pg-subset';
import { getHistorySQL } from './getHistorySQL';

export const getHistory = async (db: pgPromise.IDatabase<{}, IClient>): Promise<string[]> => {
  try {
    const patchHistory = await db.query(getHistorySQL);
    return patchHistory.map((element: { filename: any; }) => element.filename);
  } catch (error: any) {
    if (error.message.includes("does not exist")) {
      return [];
    } else {
      throw Error('An error has occurred');
    }
  }
};
