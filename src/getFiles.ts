import path from 'path';
import { readdir } from 'fs/promises';

export const getFiles = async (sqlDirectory) => {
  try {
    let patchList = [];
    const data = await readdir(sqlDirectory);
    if (data.length > 0) {

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
    }
    return patchList;
  } catch (error) {
    throw error;
  }
};
