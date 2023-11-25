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
exports.getFiles = void 0;
const path_1 = __importDefault(require("path"));
const promises_1 = require("fs/promises");
const getFiles = (sqlDirectory) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let patchList = [];
        const data = yield (0, promises_1.readdir)(sqlDirectory);
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
exports.getFiles = getFiles;
