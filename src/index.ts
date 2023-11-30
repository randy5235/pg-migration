#! /usr/bin/env -S node

import pgPromise from 'pg-promise';
import { readFile, FileHandle } from 'fs/promises';
import { IClient, IConnectionParameters } from 'pg-promise/typescript/pg-subset';
import { PathLike } from 'fs';
import { getFiles } from './getFiles';
import { getHistory } from './getHistory';
import { applyPatchAndUpdateHistory } from './applyPatchAndUpdateHistory';
import { compare } from './compare';

export const pgp = pgPromise({});
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
    file = await readFile(path, { encoding: 'utf8' });
  } catch (error) {
    console.log('Falling back to defaultConfig');
  }
  let config = file ? JSON.parse(file) : defaultConfig;
  return config;
};

const getDB = async (config: string | IConnectionParameters<IClient>) => pgp(config);

export const sqlDir = './db/migrations/';

async function main(getDB: { (config: string | IConnectionParameters<IClient>): Promise<pgPromise.IDatabase<{}, IClient>>; (arg0: any): any; }) {
  try {
    const config = await getConfig(process.argv[2]);
    console.log("CONFIG: ", config);
    const db = await getDB(config);
    console.log("Here1:");
    await applyPatchAndUpdateHistory(db, sqlDir, ['migration_history.sql']);
    const existingPatches = await getHistory(db);
    const getPatches = await getFiles(sqlDir);
    const neededPatches = compare(existingPatches, getPatches);

    if (neededPatches.length > 0) {
      console.info("Found unapplied patches: ", neededPatches);
      await applyPatchAndUpdateHistory(db, sqlDir, neededPatches);
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

