import fs from "fs-extra";
import path from "path";

export default class ChatMemory {
  constructor() {
    this.dataDir = path.join(process.cwd(), "database", "session");
    this.maxHistory = 20;
    fs.ensureDirSync(this.dataDir);
  }

  getChatFilePath(chatId) {
    const safeChatId = chatId.replace(/[^a-zA-Z0-9@._-]/g, "_");
    return path.join(this.dataDir, `${safeChatId}.json`);
  }

  async loadHistory(chatId) {
    try {
      const filePath = this.getChatFilePath(chatId);
      if (await fs.pathExists(filePath)) {
        const data = await fs.readJson(filePath);
        return Array.isArray(data) ? data : [];
      }
      return [];
    } catch (err) {
      console.error("[MEMORY] load error:", err);
      return [];
    }
  }

  async saveHistory(chatId, history) {
    try {
      const trimmed = history.slice(-this.maxHistory);
      const filePath = this.getChatFilePath(chatId);
      await fs.writeJson(filePath, trimmed, { spaces: 2 });
    } catch (err) {
      console.error("[MEMORY] save error:", err);
    }
  }

  async appendMessage(chatId, message) {
    try {
      const history = await this.loadHistory(chatId);
      history.push({
        ...message,
        timestamp: message.timestamp || new Date().toISOString(),
      });
      await this.saveHistory(chatId, history);
      return history;
    } catch (err) {
      console.error("[MEMORY] append error:", err);
      return [];
    }
  }

  async clearHistory(chatId) {
    const filePath = this.getChatFilePath(chatId);
    if (await fs.pathExists(filePath)) {
      await fs.remove(filePath);
      return true;
    }
    return false;
  }
}