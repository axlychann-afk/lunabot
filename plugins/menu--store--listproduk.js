import {
    Button,
    Carousel
} from "@ryuu-reinzz/luna-lib";
import {
    getProducts
} from '../lib/store-manage.js';

export default {
    command: ["listproduk", "produk"],
    group: false,
    premium: false,
    limit: false,
    admin: false,
    creator: false,
    botAdmin: false,
    privates: false,
    usePrefix: true,
    disable: false,
    code: async (m, {
        RyuuBotz,
        reply
    }) => {
        try {
            const products = getProducts();
            if (products.length === 0) {
                return reply("🛒 Belum ada produk yang tersedia saat ini.");
            }

            const carousel = new Carousel(RyuuBotz)
                .setBody('🛍️ *DAFTAR PRODUK DIGITAL*')
                .setFooter('Geser ke samping untuk melihat produk lainnya');

            for (const p of products) {
                const productCard = await new Button(RyuuBotz)
                    .setTitle(p.title)
                    .setBody(`📝 ${p.description}\n\n*ID:* ${p.id}\n*Tipe:* ${p.path ? '⚡ Otomatis' : '👤 Manual'}`)
                    .setFooter(`Rp${p.price.toLocaleString('id-ID')}`)
                    .setImage(p.thumbnail || global.thumbnail)
                    .addReply('🛒 Beli Produk', `.buyproduk ${p.id}`)
                    .toCard();

                carousel.addCard(productCard);
            }

            await carousel.send(m.chat, {
                quoted: m
            });

        } catch (e) {
            reply(`❌ Gagal memuat list produk: ${e.message}`);
            console.error(e);
        }
    }
};