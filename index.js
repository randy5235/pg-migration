'use strict';

const path = require('path');
const pgp = require('pg-promise')();

const { QueryFile } = require('pg-promise');
const { readdir } = require('fs/promises');

const config = {
    host: 'localhost', // 'localhost' is the default;
    port: 5432, // 5432 is the default;
    database: 'grocery_list',
    user: 'postgres',
    password: 'example',

    // to auto-exit on idle, without having to shut-down the pool;
    // see https://github.com/vitaly-t/pg-promise#library-de-initialization
    allowExitOnIdle: true
};

const getHistorySQL = `
    SELECT filename
    FROM patch_history
    ORDER By id ASC
    `;

const db = pgp(config);


const sqlDir = './db/';

const getFiles = async () => {
    try {
        let patchList = [];
        const data = await readdir(sqlDir);
        data.forEach((element, index) => {
            let name = path.parse(element).name;
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
        return patchList;
    } catch (error) {
        throw error;
    }
};

const getHistory = async (db) => {
    try {
        const patchHistory = await db.query(getHistorySQL);
        return patchHistory.map(element => element.filename);
    } catch (error) {
        if (error.message.includes("does not exist")) {
            return [];
        }
    }
};

const applyPatchAndUpdateHistory = async (fileList) => {
    try {
        for (let i = 0; i < fileList.length; i++) {
            const gf = new QueryFile(`${sqlDir}${fileList[i]}`);
            db.tx(async db => {
                if (fileList[i] !== 'migration_history.sql') {
                    await db.query('SELECT filename FROM patch_history');
                }
                await db.query(gf);
                await db.query(`INSERT INTO patch_history (filename) VALUES ('${fileList[i]}')`);
            }).then(() => console.log(`Successfully Applied patch ${fileList[i]}`));
        }
    } catch (error) {
        throw Error(`Error applying ${fileList[i]} patch`);
    }
};

const compare = (dbHistory, sqlPatches) => {
    if (dbHistory.length > sqlPatches.length) {
        throw Error(`Current patch_history: ${dbHistory} is longer than available patches ${sqlPatches}`);
    } else if (dbHistory.length === sqlPatches.length) {
        for (let i = 0; i < dbHistory.length; i++) {
            if (dbHistory[i] !== sqlPatches[i]) {
                throw Error(`Patches are missing or in wrong order ${dbHistory[i]}: ${sqlPatches[i]}`);
            }
            return [];
        }
    } else {
        let neededPatches = [];
        for (let i = 0; i < sqlPatches.length; i++) {
            if (dbHistory[i] && dbHistory[i] !== sqlPatches[i]) {
                throw Error(`Patches are missing or in wrong order ${dbHistory[i]}: ${sqlPatches[i]}`);
            } else if (!dbHistory[i]) {
                neededPatches.push(sqlPatches[i]);
            }
        }
        return neededPatches;
    }
};

async function main() {
    const existingPatches = await getHistory(db);
    const getPatches = await getFiles();
    const neededPatches = compare(existingPatches, getPatches);

    if (neededPatches.length > 0) {
        console.info("Found unapplied patches: ", neededPatches);
        await applyPatchAndUpdateHistory(neededPatches);
    } else {
        console.info("Did not find any new SQL migrations or patches");
    }
}

main();
