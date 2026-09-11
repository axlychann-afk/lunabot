import "../settings.js"; 
import fs from "fs";
import moment from 'moment-timezone';
import {
  delay,
  jidNormalizedUser,
  makeWASocket,
  generateForwardMessageContent,
  prepareWAMessageMedia,
  generateWAMessageFromContent,
  generateMessageID,
  jidDecode,
  proto,
} from "@ryuu-reinzz/baileys";


const time2 = moment().tz("Asia/Jakarta").format("HH:mm:ss");
let timewisher;

if (time2 < "05:00:00") {
  timewisher = "🌃 Selamat Pagi";
} else if (time2 < "11:00:00") {
  timewisher = "☀️ Selamat Pagi";
} else if (time2 < "15:00:00") {
  timewisher = "🌞 Selamat Siang";
} else if (time2 < "18:00:00") {
  timewisher = "🌇 Selamat Sore";
} else if (time2 < "19:00:00") {
  timewisher = "🌆 Selamat Malam";
} else {
  timewisher = "🌙 Selamat Malam";
}

export const handleIncomingMessage = (sock, id) => {};

export const saveUsers = () => {
const userDBPath = `${process.cwd()}/database/user.json`;
const users = JSON.parse(fs.readFileSync(userDBPath, "utf-8"));
  fs.writeFileSync(userDBPath, JSON.stringify(users, null, 4), "utf-8");
};

export function createUserDatabase(userid) {
const userDBPath = `${process.cwd()}/database/user.json`;
const users = JSON.parse(fs.readFileSync(userDBPath, "utf-8"));
  const registeredRaw = fs.readFileSync('./database/registered.json');
  const registered = JSON.parse(registeredRaw);
  const found = registered.find(u => u.id === userid);
  if (!found) return false;
  const serial = found.serial;
  if (!serial) return false;
  let userDB = [];
  if (fs.existsSync(userDBPath)) {
    const raw = fs.readFileSync(userDBPath);
    userDB = JSON.parse(raw);
  }
  const newData = {
    userid: userid,
    serial: serial,
    money: 1000,
    level: 1,
    experience: 0
  };
  userDB.push(newData);
  fs.writeFileSync(userDBPath, JSON.stringify(userDB, null, 2));
  return newData;
}

export function deleteUserDatabase(userid) {
  const userDBPath = `${process.cwd()}/database/user.json`;

  if (!fs.existsSync(userDBPath)) return false;

  let userDB = JSON.parse(fs.readFileSync(userDBPath, "utf-8"));

  const newUserDB = userDB.filter(u => u.userid !== userid);

  if (newUserDB.length === userDB.length) return false;

  fs.writeFileSync(userDBPath, JSON.stringify(newUserDB, null, 2));
  return true;
}

export const clearUserDatabase = () => {
const userDBPath = `${process.cwd()}/database/user.json`;
const users = JSON.parse(fs.readFileSync(userDBPath, "utf-8"));
  const empty = [];
  fs.writeFileSync(userDBPath, JSON.stringify(empty, null, 2));
  return true;
};

export const addExperience = (userid, reply) => {
  const userDBPath = `${process.cwd()}/database/user.json`;
  const users = JSON.parse(fs.readFileSync(userDBPath, "utf-8"));

  const getExpGain = (level, baseExp = 2, factor = 0.2) => {
    const multiplier = 1 + (level - 1) * factor;
    return baseExp / multiplier;
  };

  let user = users.find(u => u.userid === userid);
  if (!user) {
    return reply("User tidak ditemukan.");
  }

  const gain = getExpGain(user.level);

  user.experience += gain;

  if (user.experience >= 100) {
    user.experience -= 100;
    user.level += 1;

    reply(
      `🎉 LEVEL UP! 🎉\n` +
      `Selamat! Level kamu naik menjadi ${user.level} ✨\n` +
      `(Pengalaman bertambah +${gain.toFixed(2)}%)`
    );
  }
  fs.writeFileSync(userDBPath, JSON.stringify(users, null, 2));
  return true;
};

export const addMoney = (userid, amount) => {
const userDBPath = `${process.cwd()}/database/user.json`;
const users = JSON.parse(fs.readFileSync(userDBPath, "utf-8"));
  let user = users.find(u => u.userid === userid);
  if (!user) {
    return false
  }
  user.money += amount;
  fs.writeFileSync(userDBPath, JSON.stringify(users, null, 2));
  return true;
};

export const delMoney = (userid, amount) => {
  const userDBPath = `${process.cwd()}/database/user.json`;
  const users = JSON.parse(fs.readFileSync(userDBPath, "utf-8"));

  let user = users.find(u => u.userid === userid);
  if (!user) {
    return false;
  }

  user.money -= amount;
  if (user.money < 0) user.money = 0;

  fs.writeFileSync(userDBPath, JSON.stringify(users, null, 2));
  return true;
};

export function setClaimedTrue(userid) {
const userDBPath = `${process.cwd()}/database/user.json`;
const users = JSON.parse(fs.readFileSync(userDBPath, "utf-8"));

  let ud = users.find(x => x.userid === userid);
  if (!ud) return false;

  ud.claimed = true;

  fs.writeFileSync(userDBPath, JSON.stringify(users, null, 2));
  return true;
}

export const checkUserRegistered = (userid) => {
  const _users = JSON.parse(
    fs.readFileSync("./database/user.json", "utf-8")
  );
  return _users.some(user => user.userid === userid);
};
