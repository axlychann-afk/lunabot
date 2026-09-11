import "../settings.js";

export default {
  command: ["simulating"],
  group: true,
  premium: false,
  limit: false,
  admin: false,
  creator: true,
  botAdmin: true,
  privates: false,
  usePrefix: true,
  disable: false,

  code: async (m, { RyuuBotz, args, reply }) => {


  const keyword = args[0]?.toLowerCase();
  if (!keyword || !['add', 'out'].includes(keyword))
    return reply(`Gunakan format:\n.simulating add\n.simulating out`);

  const fakeUser = m.sender; // Pengirim sebagai target simulasi

  if (keyword === 'add') {
    RyuuBotz.ev.emit('group-participants.update', {
  id: m.chat,
  author: m.participant,
  authorPn: null,
  participants: [
    {
      id: m.participant,
      phoneNumber: m.sender,
      admin: null
    }
  ],
  action: 'add'
});
    reply(`Simulasi pengguna masuk berhasil.`);
  } else if (keyword === 'out') {
    RyuuBotz.ev.emit('group-participants.update', {
  id: m.chat,
  author: m.participant,
  authorPn: null,
  participants: [
    {
      id: m.participant,
      phoneNumber: m.sender,
      admin: null
    }
  ],
  action: 'remove'
});
    reply(`Simulasi pengguna keluar berhasil.`);
  }

  }
};
