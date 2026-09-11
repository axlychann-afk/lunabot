import axios from "axios";

export default {
  command: ["ai", "gemini"],
  group: false,
  limit: true,
  premium: false,
  admin: false,
  creator: false,
  botAdmin: false,
  privates: false,
  usePrefix: true,

  code: async (m, { RyuuBotz, reply, text, prefix, command }) => {
    if (!text) {
      return reply(
        `💬 Masukkan prompt ya, sayang\nContoh:\n*${prefix + command} kapan red magic 11 rilis?*`
      );
    }

    await RyuuBotz.sendMessage(m.chat, {
      react: {
        text: "⏳",
        key: m.key
      }
    });

    try {
      const { data } = await axios.post(
        "https://api.ryuu-dev.my.id/ai/chat/gemini",
        {
          prompt: `Kamu adalah Ryuu AI dari Ryuu Corporation.
Tugasmu adalah menjawab menggunakan format Ryuu Rich Message secara penuh, lengkap, dan berurutan.

JANGAN menggunakan markdown biasa di luar block [TEXT].
JANGAN PERNAH menyisipkan tag lain (seperti [TABLE] atau [CODE]) di DALAM block [TEXT]. 

Aturan Alur Output (PENTING):
Jika kamu sedang menulis teks di dalam [TEXT] lalu ingin menampilkan Tabel, kamu harus MENUTUP block [TEXT] terlebih dahulu dengan [/TEXT], lalu buka block [TABLE], dan setelah selesai buka block [TEXT] baru lagi untuk melanjutkan tulisanmu.

Contoh Alur Urutan:
[TEXT]...teks sebelum tabel...[/TEXT]
[TABLE]...data tabel...[/TABLE]
[TEXT]...teks setelah tabel...[/TEXT]

Daftar Tag Resmi yang tersedia:

[TITLE]
Judul Utama Pesan
[/TITLE]

[TIP]
Teks tip atau informasi metadata singkat
[/TIP]

[TEXT]
Isi teks penjelasan biasa.
Mendukung markdown standar:
# Heading 1
## Heading 2
### Heading 3
**Bold**
*Italic*
_Italic_
\`Inline Code\`
--- (Horizontal Rule)

Fitur Khusus dalam TEXT:
- Hyperlink biasa: [Nama Link](URL)
- Auto Citation: [](URL)
- Format LaTeX Image: [Identifier|?Width|?Height|?Font_Height|?Padding] <URL Gambar>
[/TEXT]

[PRODUCT]
title=Nama Produk
brand=Ryuu
price=Rp 1000
sale_price=Rp 0
url=https://example.com
icon=https://example.com/icon.png
image=https://example.com/image.png
---
title=Produk Kedua (Gunakan separator --- jika ingin membuat Horizontal Scroll / multi produk)
brand=Ryuu
...
[/PRODUCT]

[CODE language]
kode skrip di sini
[/CODE]

[TABLE]
Header1|Header2|Header3
Value1|Value2|Value3
[/TABLE]

[IMAGE]
URL_Gambar_Disini
[/IMAGE]

[VIDEO]
URL_Video|Durasi (Contoh: https://example.com/video.mp4|10)
[/VIDEO]

[SOURCE]
Thumbnail_URL|Target_URL|Judul_Sumber
[/SOURCE]

[REELS]
username=Nama User
profile_url=URL Foto Profil
thumbnail=URL Cover Video
url=URL Video
title=Judul Reels
like=12000
share=500
view=999999
source=IG
verified=true
[/REELS]

[POST]
profile_url=URL Foto Profil
username=Nama User
title=Judul Postingan
subtitle=Sub Judul
caption=Isi Caption
verified=true
url=URL Postingan
thumbnail=URL Gambar Postingan
source=INSTAGRAM
footer=Nama Kaki Postingan
deeplink=URL Deeplink Aplikasi
icon=URL Icon Kustom
orientation=LANDSCAPE
post_type=PHOTO
comment=10
share=5
like=100
[/POST]

Aturan Mutlak:
1. Jangan mengeluarkan tag kustom buatan sendiri selain daftar di atas.
2. Jangan pernah menggunakan \`\`\`codeblock\`\`\` bawaan markdown di luar block [CODE].
3. Jangan menghasilkan format JSON mentah.
4. Output harus murni berisi struktur Ryuu Rich Message tanpa teks penjelasan sistem tambahan.
5. Jika membuat data list bervariasi (PRODUCT/REELS/POST), pisahkan per item dengan tiga strip (---) dan pastikan isinya berbeda/kreatif (jangan di-loop sama persis).
6. Saat ini kamu berbicara dengan user bernama ${m.pushName}.`,
          text: text,
          messages: [],
          model: "gemini-3.1-flash-lite-preview"
        },
        {
          headers: {
            "x-ryuu-apikey": global.ryuukey
          }
        }
      );

      const answer = data?.result?.response;
      if (!answer) throw new Error("Jawaban tidak ditemukan dari API");

      function parseAIRich(content, builder) {
        builder.setType("AIRich");
        builder.setFooter("© " + (global.ownername || "Fiora Sylvie"));
        builder.addSuggest(["Ryuu", "Haruka", "Gemini"]);

        const getAttr = (str) => {
          const obj = {};
          for (const line of str.split("\n")) {
            const idx = line.indexOf("=");
            if (idx === -1) continue;
            const key = line.slice(0, idx).trim();
            const value = line.slice(idx + 1).trim();
            
            if (value === "true") obj[key] = true;
            else if (value === "false") obj[key] = false;
            else if (!isNaN(value) && value.trim() !== "") obj[key] = Number(value);
            else obj[key] = value;
          }
          return obj;
        };

        const masterRegex = /\[(TITLE|TIP|TEXT|CODE\s+[^\]]+|TABLE|IMAGE|VIDEO|SOURCE|REELS|POST|PRODUCT)\]([\s\S]*?)\[\/\1\]/gi;
        let match;

        while ((match = masterRegex.exec(content)) !== null) {
          const fullTag = match[1].trim();
          const body = match[2].trim();
          const tagBase = fullTag.split(/\s+/)[0].toUpperCase();

          switch (tagBase) {
            case "TITLE":
              builder.setTitle(body);
              break;

            case "TIP":
              builder.addTip(body);
              break;

            case "TEXT":
              builder.addText(body);
              break;

            case "CODE": {
              const langMatch = fullTag.match(/CODE\s+(.+)/i);
              const lang = langMatch ? langMatch[1].trim() : "javascript";
              builder.addCode(lang, body);
              break;
            }

            case "TABLE": {
              const lines = body.split("\n").filter(Boolean);
              if (lines.length) {
                const tableData = lines.map((row) => row.split("|").map((v) => v.trim()));
                builder.addTable(tableData);
              }
              break;
            }

            case "IMAGE": {
              const lines = body.split("\n").map((v) => v.trim()).filter(Boolean);
              if (lines.length === 1) builder.addImage(lines[0]);
              else if (lines.length > 1) builder.addImage(lines);
              break;
            }

            case "VIDEO": {
              const lines = body.split("\n").map((v) => v.trim()).filter(Boolean);
              if (lines.length === 1) builder.addVideo(lines[0]);
              else if (lines.length > 1) builder.addVideo(lines);
              break;
            }

            case "PRODUCT": {
              const items = body.split("---").map((v) => v.trim()).filter(Boolean);
              if (items.length === 1) {
                const attr = getAttr(items[0]);
                builder.addProduct({
                  title: attr.title,
                  brand: attr.brand,
                  price: attr.price,
                  sale_price: attr.sale_price,
                  product_url: attr.url || attr.product_url,
                  icon_url: attr.icon || attr.icon_url,
                  image_url: attr.image || attr.image_url
                });
              } else if (items.length > 1) {
                const productsArray = items.map((item) => {
                  const attr = getAttr(item);
                  return {
                    title: attr.title,
                    brand: attr.brand,
                    price: attr.price,
                    sale_price: attr.sale_price,
                    url: attr.url || attr.product_url,
                    icon: attr.icon || attr.icon_url,
                    image: attr.image || attr.image_url
                  };
                });
                builder.addProduct(productsArray);
              }
              break;
            }

            case "SOURCE": {
              const lines = body.split("\n").filter(Boolean);
              const result = lines.map((line) => {
                const [thumbnail, url, title] = line.split("|");
                return [thumbnail?.trim(), url?.trim(), title?.trim()];
              });
              builder.addSource(result);
              break;
            }

            case "REELS": {
              const items = body.split("---").map((v) => v.trim()).filter(Boolean);
              const reelsArray = items.map((item) => getAttr(item));
              builder.addReels(reelsArray);
              break;
            }

            case "POST": {
              const items = body.split("---").map((v) => v.trim()).filter(Boolean);
              const postArray = items.map((item) => getAttr(item));
              builder.addPost(postArray);
              break;
            }
          }
        }

        return builder;
      }

      const builder = await RyuuBotz.messageBuilder(m.chat, { quoted: m });
      parseAIRich(answer, builder);
      await builder.send();

      await RyuuBotz.sendMessage(m.chat, {
        react: {
          text: "✅",
          key: m.key
        }
      });
    } catch (err) {
      console.error(err);
      await RyuuBotz.sendMessage(m.chat, {
        react: {
          text: "❌",
          key: m.key
        }
      });
      reply(`❌ Gagal mengambil jawaban AI.\n*Error:* ${err.message}`);
    }
  }
};
