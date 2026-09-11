import axios from 'axios';

export default {
    command: ["resetujian", "ru"],
    group: false,
    premium: false,
    limit: false,
    admin: false,
    creator: false,
    botAdmin: false,
    privates: false,
    usePrefix: true,
    disable: false,

    code: async (m, { RyuuBotz, text, reply }) => {
        if (!text) return reply("❌ Masukkan nama siswa.");

        const keyword = text.toUpperCase();

        try {
            const searchRes = await axios.get("https://www.resetujian.mtsn2pontianak.sch.id/api.php", {
                params: {
                    action: "cari_siswa",
                    keyword: keyword
                }
            });

            const dataSiswa = searchRes.data;

            if (!Array.isArray(dataSiswa) || dataSiswa.length === 0) {
                return reply(`❌ Siswa dengan nama *${keyword}* tidak ditemukan.`);
            }

            const siswa = dataSiswa[0];
            const sid = siswa.id;
            const namaFix = siswa.nama_siswa.toUpperCase();

            const resetRes = await axios.post("https://www.resetujian.mtsn2pontianak.sch.id/api.php", 
                new URLSearchParams({
                    action: "submit_request",
                    siswa_id: sid
                })
            );

            if (resetRes.data.status === 'success') {
                reply(`✅ Permintaan reset terkirim.\n\n👤 *Nama:* ${namaFix}\n🏫 *Kelas:* ${siswa.kelas}\n🆔 *ID:* ${sid}\n\nSilahkan tunggu admin mereset.`);
            } else {
                reply(`❌ ${resetRes.data.message || "Gagal mengirim permintaan."}`);
            }

        } catch (err) {
            console.error(err);
            reply("❌ Gagal terhubung ke server MTsN 2 Pontianak.");
        }
    }
};
