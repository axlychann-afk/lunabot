/*
  Akinator relay engine — dipakai oleh /akinator/* endpoints (CORS relay).
  Memegang sesi Akinator per game di sisi server karena id.akinator.com
  tidak mengizinkan CORS dan butuh cookie; klien HTML hanya memegang token.

  Scraper asli: t.me/hazeloffc — Base url: https://id.akinator.com
*/
import crypto from 'node:crypto';
import * as cheerio from 'cheerio';

const BASE_URL = 'https://id.akinator.com';
const DEFAULT_AKITUDE = '/assets/img/akitudes_670x1096/serein_2.png';

const THEMES = {
    characters: 1,
    hewan: 14,
    animals: 14,
    objects: 2,
    benda: 2,
    objek: 2
};

// index jawaban API akinator: yes=0 no=1 idk=2 probably=3 probably not=4
const ANSWER_INDEX = {
    yes: 0,
    ya: 0,
    y: 0,
    no: 1,
    n: 1,
    tidak: 1,
    dont_know: 2,
    dontknow: 2,
    idk: 2,
    'tidak tahu': 2,
    probably: 3,
    mungkin: 3,
    probably_not: 4,
    probablynot: 4,
    'mungkin tidak': 4
};

const SESSION_TTL = 60 * 60 * 1000; // 1 jam

let gotPromise = null;
function getGot() {
    if (!gotPromise) {
        gotPromise = import('got-scraping').then(mod => mod.gotScraping);
    }
    return gotPromise;
}

/* satu instance got-scraping (cookie jar otomatis) dipakai semua game —
   pola sama seperti scraper referensi; sesi dibedakan lewat session/signature */
async function postForm(pathname, form, opts = {}) {
    const got = await getGot();
    return got({
        url: BASE_URL + pathname,
        method: 'POST',
        form,
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        throwHttpErrors: false,
        ...opts
    });
}

const grabSession = html =>
    (html.match(/localStorage\.setItem\(\s*['"]session['"]\s*,\s*['"]([^'"]+)['"]\s*\)/) || [])[1] ||
    (html.match(/name="session"[^>]*value="([^"]+)"/) || [])[1] ||
    null;

const grabSignature = html =>
    (html.match(/localStorage\.setItem\(\s*['"]signature['"]\s*,\s*['"]([^'"]+)['"]\s*\)/) || [])[1] ||
    (html.match(/name="signature"[^>]*value="([^"]+)"/) || [])[1] ||
    null;

const grabQuestion = html => {
    const $ = cheerio.load(html);
    return $('#question-label').text().trim() || null;
};

const grabAkitude = html => {
    const m = html.match(/id="akitude"[^>]*src="([^"]+)"/);
    if (m && m[1]) return m[1].startsWith('http') ? m[1] : BASE_URL + m[1];
    return BASE_URL + DEFAULT_AKITUDE;
};

const normProg = v => {
    const n = parseFloat(v);
    return Number.isFinite(n) ? Math.min(100, Math.max(0, n)) : 0;
};

const probsOf = data => {
    if (!Array.isArray(data?.trouvitudesReponses)) return null;
    return data.trouvitudesReponses.map(x => {
        const n = parseFloat(x?.reponse);
        return Number.isFinite(n) ? Math.min(100, Math.max(0, n)) : 0;
    });
};

class AkiGame {
    constructor(token) {
        this.token = token;
        this.sid = THEMES.characters;
        this.session = null;
        this.signature = null;
        this.step = 0;
        this.progression = 0;
        this.akitudeUrl = null;
        this.updatedAt = Date.now();
        this.mode = 'question'; // question | candidate | lost | won
        this.question = null;
        this.probs = [0, 0, 0, 0, 0];
        this.candidate = null;
    }

    touch() {
        this.updatedAt = Date.now();
    }

    async start(sid = THEMES.characters) {
        this.sid = sid;
        await getGot().then(g => g({ url: BASE_URL + '/', throwHttpErrors: false }));

        const res = await postForm('/game', { sid: String(sid), cm: 'false' });

        const question = grabQuestion(res.body);
        const session = grabSession(res.body);
        const signature = grabSignature(res.body);

        if (!question || !session || !signature) {
            throw new Error('Gagal memulai sesi Akinator di server.');
        }

        this.session = session;
        this.signature = signature;
        this.step = 0;
        this.progression = 0;
        this.akitudeUrl = grabAkitude(res.body);
        this.mode = 'question';
        this.question = question;
        this.probs = [0, 0, 0, 0, 0];
        this.candidate = null;
        this.touch();
        return this.publicState();
    }

    async answer(answerToken) {
        if (!this.session || !this.signature) throw new Error('Sesi tidak ditemukan, mulai ulang.');
        const idx = ANSWER_INDEX[String(answerToken || '').toLowerCase()];
        if (idx === undefined) throw new Error('Jawaban tidak valid.');

        const res = await postForm('/answer', {
            step: String(this.step),
            progression: String(this.progression),
            sid: String(this.sid),
            cm: 'false',
            answer: String(idx),
            session: this.session,
            signature: this.signature
        });

        let data;
        try {
            data = JSON.parse(res.body);
        } catch (e) {
            throw new Error('Respon Akinator tidak terbaca.');
        }

        return this.applyResult(data);
    }

    async back() {
        if (!this.session || !this.signature) throw new Error('Sesi tidak ditemukan, mulai ulang.');
        if (this.mode === 'candidate') throw new Error('Tidak bisa mundur saat tebakan ditampilkan.');

        const res = await postForm('/cancel_answer', {
            step: String(this.step),
            progression: String(this.progression),
            sid: String(this.sid),
            cm: 'false',
            session: this.session,
            signature: this.signature
        });

        let data;
        try {
            data = JSON.parse(res.body);
        } catch (e) {
            throw new Error('Respon Akinator tidak terbaca.');
        }

        if (data.completion === 'KO') {
            this.mode = 'lost';
            this.touch();
            return this.publicState();
        }

        this.mode = 'question';
        this.question = data.question;
        this.step = parseInt(data.step) || 0;
        this.progression = normProg(data.progression);
        this.probs = probsOf(data) || this.probs;
        this.candidate = null;
        this.touch();
        return this.publicState();
    }

    async exclude() {
        if (!this.session || !this.signature) throw new Error('Sesi tidak ditemukan, mulai ulang.');
        const cand = this.candidate || {};
        const candStep = cand.step || this.step;

        const res = await postForm('/exclude', {
            step: String(candStep),
            progression: String(this.progression),
            sid: String(this.sid),
            cm: 'false',
            session: this.session,
            signature: this.signature,
            step_last_proposition: String(candStep)
        }, { followRedirect: true });

        // 1) JSON
        try {
            return this.applyResult(JSON.parse(res.body));
        } catch { /* lanjut parse HTML */ }

        // 2) HTML (sesi baru dari server)
        const question = grabQuestion(res.body);
        if (question) {
            this.session = grabSession(res.body) || this.session;
            this.signature = grabSignature(res.body) || this.signature;
            this.mode = 'question';
            this.question = question;
            this.step = 0;
            this.progression = 0;
            this.probs = [0, 0, 0, 0, 0];
            this.akitudeUrl = grabAkitude(res.body);
            this.candidate = null;
            this.touch();
            return this.publicState();
        }

        this.mode = 'lost';
        this.touch();
        return this.publicState();
    }

    async confirmWin() {
        if (!this.session || !this.signature) throw new Error('Sesi tidak ditemukan.');
        const cand = this.candidate || {};
        if (!cand.id_proposition) throw new Error('Tidak ada tebakan untuk dikonfirmasi.');

        await postForm('/choice', {
            sid: String(this.sid),
            pid: String(cand.id_proposition),
            identifiant: '',
            pflag_photo: '0',
            charac_name: cand.name,
            charac_desc: cand.description,
            session: this.session,
            signature: this.signature,
            step: String(cand.step || this.step)
        }, { followRedirect: false });

        const win = { ...this.candidate };
        this.mode = 'won';
        this.candidate = null;
        this.touch();
        return this.publicState(win);
    }

    /* data JSON dari /answer atau /exclude -> update state & public state */
    applyResult(data) {
        if (!data) throw new Error('Respon Akinator kosong.');

        if (data.completion === 'KO') {
            this.mode = 'lost';
            this.candidate = null;
            this.touch();
            return this.publicState();
        }

        if (data.id_proposition || (Array.isArray(data.elements) && data.elements.length)) {
            const p = data.id_proposition ? data : data.elements[0];
            this.mode = 'candidate';
            this.candidate = {
                id_proposition: String(p.id_proposition),
                name: p.name_proposition || '???',
                description: p.description_proposition || '',
                photo: p.photo || '',
                pseudo: p.pseudo || '',
                step: data.step !== undefined ? String(data.step) : String(this.step)
            };
            this.touch();
            return this.publicState();
        }

        this.mode = 'question';
        this.question = data.question;
        this.step = parseInt(data.step) || 0;
        this.progression = normProg(data.progression);
        this.probs = probsOf(data) || this.probs;
        this.candidate = null;
        this.touch();
        return this.publicState();
    }

    publicState(win) {
        const base = {
            ok: true,
            token: this.token,
            mode: this.mode,
            progression: normProg(this.progression),
            avatar: this.akitudeUrl
        };
        if (this.mode === 'question') {
            base.step = this.step;
            base.question = this.question;
            base.probs = this.probs;
        }
        if (this.mode === 'candidate') {
            const c = this.candidate || {};
            base.candidate = {
                name: c.name,
                description: c.description,
                pseudo: c.pseudo,
                photo: c.photo
            };
        }
        if (this.mode === 'won' && win) {
            base.win = {
                name: win.name,
                description: win.description,
                pseudo: win.pseudo,
                photo: win.photo
            };
        }
        return base;
    }
}

/* ============ penyimpanan sesi (map in-memory + pembersih TTL) ============ */
const games = new Map();

export function cleanupGames(now = Date.now()) {
    for (const [token, g] of games) {
        if (now - g.updatedAt > SESSION_TTL) games.delete(token);
    }
}

export function getGame(token) {
    const g = token && games.get(token);
    if (g) {
        g.touch();
        return g;
    }
    return null;
}

export async function startGame(themeKey) {
    cleanupGames();
    const token = crypto.randomBytes(12).toString('hex');
    const game = new AkiGame(token);
    games.set(token, game);
    try {
        const sid = THEMES[String(themeKey || '').toLowerCase()] || THEMES.characters;
        const state = await game.start(sid);
        state.theme = sid;
        return state;
    } catch (err) {
        games.delete(token);
        throw err;
    }
}
