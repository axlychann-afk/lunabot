/* =================[ OWNER ]================= */
global.lidownernumber = null //biarkan kosong, nanti di isi di dalam RAM
global.ownernumber = "-"
global.ownername = "-"


/* ==================[ BOT ]=================== */
global.namabot = "deuabotz"
global.saluran = "https://whatsapp.com/channel/0029Vb8pI9IInlqVmWlaoO09"
global.idSaluran = "120363430756095886@newsletter"
global.nomorbot = "-"
global.packname = 'deua'
global.author = 'botz'
global.foother = 'deuabotz'
global.thumbnail = {
    mini: "https://api.ryuu-dev.my.id/random/girl",
    main: "https://api.ryuu-dev.my.id/luna.jpg"
}
global.payment = {
    qris: "https://cdn.aceimg.com/YrwTWGpt5.jpg", //url foto qris mu
    dana: {
        norek: "08131852062", //08xxxxx
        nama: "DEUA" //atas nama....
    },
    gopay: {
        norek: "08131852062", //08xxxx
        nama: "DEUA" //atas nama....
    }/*, //hapus komentar kalau pengen di isi
    ovo: {
        norek: "-",
        nama: "-"
    }*/
}
global.qrisurl = "https://cdn.aceimg.com/dLw8U0gUX.jpg" //url qris (hanya qr)
global.adreply = false
global.aicontroll = true

global.prefix = [
    '.', '!', '/', '#', '%', '&', '?', '+', '-', '=', '^', '<', '>', '|', '\\', ':',
    ',', "'", '"', '`', '(', ')', '[', ']', '{', '}', '¿', '¡'
]

global.runtime = "vps"
global.menu = "button" // tree | table | button


/* ================[ FEATURES ]================ */
global.autoregister = true
global.pref = true
global.channel_log = false
global.BarLoad = false
global.onlyGc = false
global.antiTypo = true
global.dontDisturb = false
global.reactsw = true
global.debug = false
global.devCommand = true
global.disable = {
    case: false,
    plugins: false
}

global.vercelToken = "-" //vercel.com
global.cscapi = "-" //biarin
global.fgsiapi = "-" //fgsi.dpdns.org
global.themeemoji = '🎟️'
global.ryuukey = "ryuu-apis-123456789010wkwk" //api.ryuu-dev.my.id

/* =================[ PANEL ]================== */
global.aapikey = "ptla_key"
global.capikey = "ptlc_key"
global.domain = "https://-" // tanpa tanda "/" di akhir
global.nest = 5
global.nestId = 15
global.node = 1

/* =================[ LIMIT ]================== */
global.limitawal = {
    premium: "Infinity",
    free: 30
}


/* ================[ UTILITIES ]=============== */
global.sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))
global.task = global.task || {}


/* =================[ MESSAGE ]================ */
global.mess = {
    success: 'Sukses',
    admin: 'Lu bukan *admin*',
    botAdmin: 'Gua bukan *admin*',
    creator: 'Lu bukan owner jing',
    group: 'Only in group',
    private: 'Only privat chat',
    wait: 'Wait..',
    premium: 'Lu bukan premium, mending buy nokos dulu di owner biar premium',
    notregist: '🍡 *Kamu belum terdaftar~ coba ketik ".register" dulu ya... atau ketik ".register nama, umur"~* 🍦\n\nContoh: *".Register Deua, 20"*',
    endLimit: 'Limit lu abis jelek, chat owner trus beli nokos biar di add limit',
    disable: '*Plugins disable, proses di hentikan',

    antilink: {
        owner: "😶‍🌫️",
        admin: "😶‍🌫️",
        ch: "😶‍🌫️"
    }
}

global.kosong = "\u0000".repeat(3000); //abaikan
global.botNumber = nomorbot //abaikan