#! /usr/bin/env -S node

import path from 'path';
import pgPromise from 'pg-promise';
import { readFile, readdir, FileHandle } from 'fs/promises';
import { IClient, IConnectionParameters } from 'pg-promise/typescript/pg-subset';
import { PathLike } from 'fs';

const pgp = pgPromise({});
const defaultConfig = {
  host: 'localhost', // 'localhost' is the default;
  port: 5432, // 5432 is the default;
  database: 'grocery_list',
  user: 'postgres',
  password: 'example',

  // to auto-exit on idle, without having to shut-down the pool;
  // see https://github.com/vitaly-t/pg-promise#library-de-initialization
  allowExitOnIdle: true,
  patchPath: './db/migrations/'
};

const getConfig = async (path: PathLike | FileHandle) => {
  let file;
  try {
    file = await readFile(path, {encoding: 'utf8'});
  } catch (error) {
    console.log('Falling back to defaultConfig');
  }
  let config = file ? JSON.parse(file) : defaultConfig;
  return config;
 };

const getHistorySQL = `
    SELECT filename
    FROM patch_history
    ORDER By id ASC
    `;




const getDB = async (config: string | IConnectionParameters<IClient>) => pgp(config);

const sqlDir = './db/migrations/';

const getFiles = async () => {
  try {
    let patchList = [];
    const data = await readdir(sqlDir);
    if (data.length > 0) {

      data.forEach((element, index) => {
        let name = path.parse(element).name;
        if (name === 'migration_history') {
          data.splice(index, 1);
          patchList.unshift(element);
          return;
        }
        if (name !== new Date(name).toISOString()) {
          throw Error(`Bad file name ${element}, please use this format: \'2022-03-18T06:22:06.000Z\'`);
        }
      });
      patchList.push(...data.sort());
    }
    return patchList;
  } catch (error) {
    throw error;
  }
};

const getHistory = async (db: pgPromise.IDatabase<{}, IClient>): Promise<string[]> => {
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

const applyPatchAndUpdateHistory = async (db: { tx: (arg0: (db: any) => Promise<void>) => Promise<any>; }, fileList: string[]) => {
  for (let i = 0; i < fileList.length; i++) {
      try {
      const gf = new pgp.QueryFile(`${sqlDir}${fileList[i]}`);
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

const compare = (dbHistory: string[], sqlPatches: string[]) => {
  let neededPatches:string[] = [];
  if (dbHistory.length > sqlPatches.length) {
    throw Error(`Current patch_history: ${dbHistory} is longer than available patches ${sqlPatches}`);
  } else if (dbHistory.length === sqlPatches.length) {
    for (let i = 0; i < dbHistory.length; i++) {
      if (dbHistory[i] !== sqlPatches[i]) {
        throw Error(`Patches are missing or in wrong order ${dbHistory[i]}: ${sqlPatches[i]}`);
      }
      return neededPatches;
    }
  }
  for (let i = 0; i < sqlPatches.length; i++) {
    if (dbHistory[i] && dbHistory[i] !== sqlPatches[i]) {
      throw Error(`Patches are missing or in wrong order ${dbHistory[i]}: ${sqlPatches[i]}`);
    } else if (!dbHistory[i]) {
      neededPatches.push(sqlPatches[i]);
    }
  }
  return neededPatches;
};

async function main(getDB: { (config: string | IConnectionParameters<IClient>): Promise<pgPromise.IDatabase<{}, IClient>>; (arg0: any): any; }) {
  try {
    const config = await getConfig(process.argv[2]);
    console.log("CONFIG: ", config);
    const db = await getDB(config);
    const existingPatches = await getHistory(db);
    const getPatches = await getFiles();
    const neededPatches = compare(existingPatches, getPatches);
    
    if (neededPatches.length > 0) {
      console.info("Found unapplied patches: ", neededPatches);
      await applyPatchAndUpdateHistory(db, neededPatches);
    } else {
      console.info("Did not find any new SQL migrations or patches");
    }
  } catch (error) {
    throw error;
  }
}
export const migrate = async () => {
  await main(getDB);
};;

