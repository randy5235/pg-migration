import pgPromise from 'pg-promise';
import type { IClient } from 'pg-promise/typescript/pg-subset';
export declare const pgp: pgPromise.IMain<{}, IClient>;
export declare const sqlDir = "./db/migrations/";
export declare const migrate: () => Promise<void>;
