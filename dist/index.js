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
exports.migrate = exports.sqlDir = exports.pgp = void 0;
const pg_promise_1 = __importDefault(require("pg-promise"));
const promises_1 = require("fs/promises");
const getFiles_1 = require("./getFiles");
const getHistory_1 = require("./getHistory");
const applyPatchAndUpdateHistory_1 = require("./applyPatchAndUpdateHistory");
const compare_1 = require("./compare");
exports.pgp = (0, pg_promise_1.default)({});
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
const getDB = (config) => __awaiter(void 0, void 0, void 0, function* () { return (0, exports.pgp)(config); });
exports.sqlDir = './db/migrations/';
function main(getDB) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const config = yield getConfig(process.argv[2]);
            console.log("CONFIG: ", config);
            const db = yield getDB(config);
            console.log("Here1:");
            // await applyPatchAndUpdateHistory(db, sqlDir, ['migration_history.sql']);
            const existingPatches = yield (0, getHistory_1.getHistory)(db);
            const getPatches = yield (0, getFiles_1.getFiles)(exports.sqlDir);
            const neededPatches = (0, compare_1.compare)(existingPatches, getPatches);
            if (neededPatches.length > 0) {
                console.info("Found unapplied patches: ", neededPatches);
                yield (0, applyPatchAndUpdateHistory_1.applyPatchAndUpdateHistory)(db, exports.sqlDir, neededPatches);
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
