import fetch from "node-fetch"

export default {
  command: ["git", "gitclone"],
  group: false,
  premium: false,
  limit: true,
  admin: false,
  creator: false,
  botAdmin: false,
  privates: false,
  usePrefix: true,
  disable: false,

  code: async (m, { args, RyuuBotz, command, prefix, reply }) => {

  if (!args[0]) return reply(`Where is the link?\nContoh:\n${prefix}${command} https://github.com/DGXeon/XeonMedia`)
  if (!/^https:\/\/github\.com\/[^\/]+\/[^\/]+/.test(args[0])) return reply("Link invalid!")

  const regex = /(?:https|git)(?::\/\/|@)github\.com[\/:]([^\/:]+)\/(.+)/i
  let [, user, repo] = args[0].match(regex) || []
  if (!user || !repo) return reply("Gagal parsing URL GitHub!")

  repo = repo.replace(/.git$/, "")
  const url = `https://api.github.com/repos/${user}/${repo}/zipball`

  try {
    const head = await fetch(url, { method: "HEAD" })
    const filename = head.headers.get("content-disposition").match(/attachment; filename=(.*)/)[1]
    await RyuuBotz.sendMessage(m.chat, {
      document: { url },
      fileName: filename + ".zip",
      mimetype: "application/zip"
    }, { quoted: m })
  } catch (err) {
    console.error(err)
    reply("Gagal mengunduh repo.")
  }

  }
};
