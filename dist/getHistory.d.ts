import pgPromise from 'pg-promise';
import { IClient } from 'pg-promise/typescript/pg-subset';
export declare const getHistory: (db: pgPromise.IDatabase<{}, IClient>) => Promise<string[]>;
