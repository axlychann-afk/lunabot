import fs from "fs";

const timeoutMap = {};

export const setGameTimeout = (chatId, timeout) => {
  timeoutMap[chatId] = timeout;
};

export const endGame = (chatId, tmpFile) => {
  if (timeoutMap[chatId]) {
    clearTimeout(timeoutMap[chatId]);
    delete timeoutMap[chatId];
  }

  if (tmpFile && fs.existsSync(tmpFile)) {
    fs.unlinkSync(tmpFile);
  }
};