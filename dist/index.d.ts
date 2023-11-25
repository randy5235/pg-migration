#! /usr/bin/env -S node
import pgPromise from 'pg-promise';
import { IClient } from 'pg-promise/typescript/pg-subset';
export declare const pgp: pgPromise.IMain<{}, IClient>;
export declare const sqlDir = "./db/migrations/";
export declare const migrate: () => Promise<void>;
