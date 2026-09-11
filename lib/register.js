import '../settings.js';
import fs from 'fs';
import CryptoJS from "crypto-js";

/**
 * GET db
**/

/**
 * GET random user from db
 * return {string}
 **/
export const getRegisteredRandomId = () => {
const _registered = JSON.parse(
  fs.readFileSync("./database/registered.json", "utf-8")
);
  return _registered[Math.floor(Math.random() * _registered.length)].id;
};

/**
 * Add user to db
 * @param {String} userid 
 * @param {String} name 
 * @param {Number} time 
 * @param {Number} alimit 
 * @param {String} id 
 **/
export const addRegisteredUser = (userid, name, time, alimit, id) => {
const _registered = JSON.parse(
  fs.readFileSync("./database/registered.json", "utf-8")
);
  const obj = {
    id: userid,
    name: name,
    serial: id,
    time: time,
    limit: alimit,
  };
  if (_registered.some(user => user.id === userid)) return false;
  _registered.push(obj);
  fs.writeFileSync(
    "./database/registered.json",
    JSON.stringify(_registered, null, 2),
    "utf-8"
  );
  return true;
};

/**
 * Remove user from db
 * @param {String} userid 
 **/
export const removeRegisteredUser = (userid) => {
const _registered = JSON.parse(
  fs.readFileSync("./database/registered.json", "utf-8")
);
  const index = _registered.findIndex((user) => user.id === userid);
  if (index !== -1) {
    _registered.splice(index, 1);
    fs.writeFileSync(
      "./database/registered.json",
      JSON.stringify(_registered, null, 2),
      "utf-8"
    );
    return true; 
  } else {
    return false;
  }
};

/**
 * GET random serial
 * params {number} size
 * return {string}
**/
export const createSerial = (size) => {
  const random = CryptoJS.lib.WordArray.random(size).toString();
  return random.slice(0, size);
};

/**
 * cek user from db
 * params {string} userid
 * return {true/false}
**/
export const checkRegisteredUser = (userid) => {
const _registered = JSON.parse(
  fs.readFileSync("./database/registered.json", "utf-8")
);
    return _registered.some(user => user.id === userid);
    };
    
export const reduceUserLimit = (userid) => {
const _registered = JSON.parse(
  fs.readFileSync("./database/registered.json", "utf-8")
);
  const user = _registered.find(u => u.id === userid);
  if (!user) return false;
  if (user.limit <= 0) return false;

  user.limit -= 1;
  fs.writeFileSync('./database/registered.json', JSON.stringify(_registered, null, 2));
  return true;
};

export const addUserLimit = (userid, amount) => {
const _registered = JSON.parse(
  fs.readFileSync("./database/registered.json", "utf-8")
);
  const user = _registered.find(u => u.id === userid);
  if (!user) return false;

  user.limit += amount;
  fs.writeFileSync('./database/registered.json', JSON.stringify(_registered, null, 2));

  return true;
};

export const theLimit = (userid) => {
const _registered = JSON.parse(
  fs.readFileSync("./database/registered.json", "utf-8")
);
  const user = _registered.find(u => u.id === userid);
  if (!user) return true;
  return user.limit <= 0;
};

export const resetAllLimit = () => {
const _registered = JSON.parse(
  fs.readFileSync("./database/registered.json", "utf-8")
);
  _registered.forEach(user => {
    user.limit = global.limitawal.free;
  });
  fs.writeFileSync('./database/registered.json', JSON.stringify(_registered, null, 2), 'utf-8');
  console.log("Limit semua user berhasil direset 🕛✨");
};

export const checkName = (id) => {
const _registered = JSON.parse(
  fs.readFileSync("./database/registered.json", "utf-8")
);
    const user = _registered.find(user => user.id === id);
    return user ? user.name : null;
};
