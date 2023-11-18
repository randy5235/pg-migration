#! /usr/bin/env -S node
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.migrate = void 0;
const path_1 = __importDefault(require("path"));
const pg_promise_1 = __importDefault(require("pg-promise"));
const promises_1 = require("fs/promises");
const pgp = (0, pg_promise_1.default)({});
const defaultConfig = {
    host: 'localhost',
    port: 5432,
    database: 'grocery_list',
    user: 'postgres',
    password: 'example',
    // to auto-exit on idle, without having to shut-down the pool;
    // see https://github.com/vitaly-t/pg-promise#library-de-initialization
    allowExitOnIdle: true,
    patchPath: './db/migrations/'
};
const getConfig = (path) => __awaiter(void 0, void 0, void 0, function* () {
    let file;
    try {
        file = yield (0, promises_1.readFile)(path, { encoding: 'utf8' });
    }
    catch (error) {
        console.log('Falling back to defaultConfig');
    }
    let config = file ? JSON.parse(file) : defaultConfig;
    return config;
});
const getHistorySQL = `
    SELECT filename
    FROM patch_history
    ORDER By id ASC
    `;
const getDB = (config) => __awaiter(void 0, void 0, void 0, function* () { return pgp(config); });
const sqlDir = './db/migrations/';
const getFiles = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let patchList = [];
        const data = yield (0, promises_1.readdir)(sqlDir);
        if (data.length > 0) {
            data.forEach((element, index) => {
                let name = path_1.default.parse(element).name;
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
    }
    catch (error) {
        throw error;
    }
});
const getHistory = (db) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const patchHistory = yield db.query(getHistorySQL);
        return patchHistory.map((element) => element.filename);
    }
    catch (error) {
        if (error.message.includes("does not exist")) {
            return [];
        }
        else {
            throw Error('An error has occurred');
        }
    }
});
const applyPatchAndUpdateHistory = (db, fileList) => __awaiter(void 0, void 0, void 0, function* () {
    for (let i = 0; i < fileList.length; i++) {
        try {
            const gf = new pgp.QueryFile(`${sqlDir}${fileList[i]}`);
            db.tx((db) => __awaiter(void 0, void 0, void 0, function* () {
                if (fileList[i] !== 'migration_history.sql') {
                    yield db.query('SELECT filename FROM patch_history');
                }
                yield db.query(gf);
                yield db.query(`INSERT INTO patch_history (filename) VALUES ('${fileList[i]}')`);
            })).then(() => console.log(`Successfully Applied patch ${fileList[i]}`));
        }
        catch (_a) {
            throw Error(`Error applying ${fileList[i]} patch`);
        }
    }
});
const compare = (dbHistory, sqlPatches) => {
    let neededPatches = [];
    if (dbHistory.length > sqlPatches.length) {
        throw Error(`Current patch_history: ${dbHistory} is longer than available patches ${sqlPatches}`);
    }
    else if (dbHistory.length === sqlPatches.length) {
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
        }
        else if (!dbHistory[i]) {
            neededPatches.push(sqlPatches[i]);
        }
    }
    return neededPatches;
};
function main(getDB) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const config = yield getConfig(process.argv[2]);
            console.log("CONFIG: ", config);
            const db = yield getDB(config);
            const existingPatches = yield getHistory(db);
            const getPatches = yield getFiles();
            const neededPatches = compare(existingPatches, getPatches);
            if (neededPatches.length > 0) {
                console.info("Found unapplied patches: ", neededPatches);
                yield applyPatchAndUpdateHistory(db, neededPatches);
            }
            else {
                console.info("Did not find any new SQL migrations or patches");
            }
        }
        catch (error) {
            throw error;
        }
    });
}
const migrate = () => __awaiter(void 0, void 0, void 0, function* () {
    yield main(getDB);
});
exports.migrate = migrate;
;
