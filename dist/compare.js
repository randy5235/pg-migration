"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.compare = void 0;
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
exports.compare = compare;
