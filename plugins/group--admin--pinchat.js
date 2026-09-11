import "../settings.js"; 

export default {
  command: ["pinchat", "pin-chat"],
  group: true,
  premium: false,
  limit: false,
  admin: true,
  creator: false,
  botAdmin: true,
  privates: false,
  usePrefix: true,
  disable: false,

  code: async (m, { RyuuBotz, prefix, command, text, reply, quoted }) => {

 if (!quoted) return reply("Pin chat apa? ._.");
 
    if (!text) {
      return reply(
        `Gunakan:\n` +
        `${prefix + command} 1 = 1 day\n` +
        `${prefix + command} 2 = 7 day\n` +
        `${prefix + command} 3 = 30 day\n` +
        `${prefix + command} remove`
      );
    }
    switch (text) {
    case '1': {
    await RyuuBotz.sendMessage(
    m.chat,
    {
        pin: {
            type: 1,
            time: 86400,
            key: m.quoted.fakeObj.key
             }
          }
       )
  reply(mess.success);
    }
break; 
    case '2': {
    await RyuuBotz.sendMessage(
    m.chat,
    {
        pin: {
            type: 1,
            time: 604800,
            key: m.quoted.fakeObj.key
             }
          }
       )
  reply(mess.success);
    }
break; 
    case '3': {
    await RyuuBotz.sendMessage(
    m.chat,
    {
        pin: {
            type: 1,
            time: 2592000,
            key: m.quoted.fakeObj.key
             }
          }
       )
  reply(mess.success);
    }
break; 
    case 'remove': {
    await RyuuBotz.sendMessage(
    m.chat,
    {
        pin: {
            type: 0, //0 artinya remove
            time: 123,
            key: m.quoted.fakeObj.key
             }
          }
       )
  reply(mess.success);
    }
break; 

default: {
      reply(`❌ Opsi tidak dikenal!`);
    }
  }

  }
};
