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
exports.getHistory = void 0;
const getHistorySQL_1 = require("./getHistorySQL");
const getHistory = (db) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // await applyPatchAndUpdateHistory(db, './db/migrations/', ['migration_history.sql']);
        const patchHistory = yield db.query(getHistorySQL_1.getHistorySQL);
        if (patchHistory.length === 0) {
            return [];
        }
        return patchHistory.map((element) => element.filename);
    }
    catch (error) {
        throw Error('An error has occurred');
    }
});
exports.getHistory = getHistory;
