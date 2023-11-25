"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHistorySQL = void 0;
exports.getHistorySQL = `
    SELECT filename
    FROM patch_history
    ORDER By id ASC
    `;
