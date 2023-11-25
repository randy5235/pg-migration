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
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyPatchAndUpdateHistory = void 0;
const _1 = require(".");
const applyPatchAndUpdateHistory = (db, sqlDirectory, fileList) => __awaiter(void 0, void 0, void 0, function* () {
    for (let i = 0; i < fileList.length; i++) {
        try {
            const gf = new _1.pgp.QueryFile(`${sqlDirectory}${fileList[i]}`);
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
exports.applyPatchAndUpdateHistory = applyPatchAndUpdateHistory;
