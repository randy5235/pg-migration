
export const getHistorySQL = `
    SELECT filename
    FROM patch_history
    ORDER By id ASC
    `;
