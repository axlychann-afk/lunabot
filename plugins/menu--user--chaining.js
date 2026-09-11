import "../settings.js";

export default {
  command: ["chaining"],
  group: false,
  limit: false,
  premium: true,
  admin: false,
  creator: false,
  botAdmin: false,
  privates: false,
  usePrefix: true,
  disable: false,

  code: async (m, extra) => {
    const { prefix, RyuuBotz, reply, plugins } = extra;

    // Ambil text setelah .chaining
    const input = extra.text?.trim();

    if (!input) {
      return reply(
        `Contoh:\n${prefix}chaining .cmd1 args1 ++ .cmd2 args2`
      );
    }

    // Pecah command berdasarkan ++
    const chains = input
      .split(/\s*\+\+\s*/)
      .map(x => x.trim())
      .filter(Boolean);

    if (!chains.length) {
      return reply("❌ Command chaining tidak ditemukan.");
    }

    let executed = 0;

    for (const chain of chains) {
      /*
       * Format:
       * .command args
       */
      const match = chain.match(
        new RegExp(
          `^${escapeRegex(prefix)}([^\\s]+)(?:\\s+([\\s\\S]*))?$`
        )
      );

      if (!match) {
        continue;
      }

      const command = match[1].toLowerCase();
      const extractedQuery = match[2]?.trim() || "";

      // Jangan izinkan .chaining memanggil dirinya sendiri
      if (
        command === "chaining"
      ) {
        continue;
      }

      /*
       * Cari plugin berdasarkan command / alias
       */
      let plugin = null;

      for (const [, data] of plugins) {
        if (
          !data ||
          typeof data.code !== "function" ||
          !data.command
        ) {
          continue;
        }

        const commands = Array.isArray(data.command)
          ? data.command
          : [data.command];

        if (
          commands.some(
            cmd => String(cmd).toLowerCase() === command
          )
        ) {
          plugin = data;
          break;
        }
      }

      if (!plugin) {
        await reply(`❌ Command ${prefix}${command} tidak ditemukan.`);
        continue;
      }

      /*
       * Inject text command ke extra,
       * sama seperti dispatcher utama.
       */
      extra.text = extractedQuery || "null";

      /*
       * Jalankan plugin.
       */
      try {
        if (plugin && typeof plugin.code === "function") {
          await plugin.code(m, extra);
          executed++;
        } else if (typeof plugin === "function") {
          await plugin(m, extra);
          executed++;
        }
      } catch (error) {
        console.error(
          `[CHAINING] Error pada ${prefix}${command}:`,
          error
        );

        await reply(
          `❌ Error saat menjalankan ${prefix}${command}`
        );
      }
    }

    /*
     * Tidak perlu mengirim pesan sukses.
     * Plugin masing-masing sudah menangani reply-nya sendiri.
     */
  }
};

/**
 * Escape karakter regex dari prefix.
 */
function escapeRegex(string) {
  return String(string).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}