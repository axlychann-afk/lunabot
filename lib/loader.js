import { color } from './color.js';
import fs from 'fs';;

export async function uncache(module = '.') {
  return new Promise((resolve, reject) => {
    try {
      delete import.meta.resolve(module); 
      resolve();
    } catch (e) {
      reject(e);
    }
  });
}

export async function nocache(module, cb = () => {}) {
  console.log(color('Module', 'blue'), color(`'${module} is up to date!'`, 'cyan'));
  fs.watchFile(module, async () => {
    await uncache(module);
    cb(module);
  });
}
