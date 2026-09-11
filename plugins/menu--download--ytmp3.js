import axios from 'axios';

/*
 * WebSocket Audio Player — pesan HTML interaktif dengan UI yang
 * SAMA PERSIS (byte-per-byte) dengan mode default plugin ytplay
 * (plugins/menu--search--ytplay.js).
 *
 * Dipakai oleh:
 *  - plugins/menu--search--ytplay.js   -> mode default
 *  - plugins/menu--download--ytmp3.js  -> flag --auto-play
 *
 * Seluruh isi htmlPayload & cara relay pesan disalin verbatim dari
 * default-case ytplay agar hasil pesan di WhatsApp selalu identik.
 */
async function sendWebsocketAudioPlayerHtml({
    m,
    RyuuBotz,
    link,
    title = "",
    channel = "",
    duration = "",
    imageUrl = null,
    apiData = null
}) {
    let downloadData = apiData;

    if (!downloadData) {
        const downloadUrl =
            `https://api.ryuu-dev.my.id/downloader/youtube?url=${encodeURIComponent(link)}&format=mp3`;

        const {
            data: fetchedData
        } = await axios.get(downloadUrl, {
            timeout: 120000,
            headers: {
                "x-ryuu-apikey": global.ryuukey
            }
        });

        downloadData = fetchedData;
    }

                    if (
                        !downloadData.success ||
                        !downloadData.result ||
                        !downloadData.result.status
                    ) {
                        throw new Error(
                            "Gagal mendapatkan audio dari API."
                        );
                    }

                    const resData =
                        downloadData.result.result;

                    const mp3Url = resData.link;

                    if (!mp3Url) {
                        throw new Error(
                            "Link audio tidak ditemukan."
                        );
                    }

                    /*
                     * Escape nilai yang disisipkan ke dalam string JS
                     * di dalam template HTML.
                     */
                    const escapeHtmlJs = (value) =>
                        String(value ?? "")
                            .replace(/\\/g, "\\\\")
                            .replace(/"/g, '\\"');

                    /*
                     * Download thumbnail sebagai Buffer
                     */
                    let thumbnailBuffer;

                    try {
                        const thumbnailRes = await axios.get(
                            resData.thumbnail || imageUrl, {
                                responseType: 'arraybuffer',
                                timeout: 120000
                            }
                        );

                        thumbnailBuffer =
                            Buffer.from(thumbnailRes.data);

                    } catch (err) {
                        console.error(
                            "❌ Gagal download thumbnail:",
                            err
                        );
                        thumbnailBuffer = null;
                    }

                    /*
                     * Convert thumbnail ke Base64
                     */
                    let thumbnailb64 = "";

                    if (thumbnailBuffer) {
                        thumbnailb64 =
                            "data:image/jpeg;base64," +
                            thumbnailBuffer.toString("base64");
                    }

                    const backgroundb64 = thumbnailb64;

                    /*
                     * URL audio TIDAK lagi di-Base64.
                     * Client membuka WebSocket ke Cloudflare Worker:
                     *   wss://audio.ryuu-dev.my.id/wss/audio?url=<ENCODED_AUDIO_URL>
                     * lalu menerima binary chunks sampai selesai.
                     */
                    const wsUrl =
                        `wss://audio.ryuu-dev.my.id/wss/audio?url=${encodeURIComponent(mp3Url)}`;

                    const config = {
                        title: resData.title ||
                            title ||
                            "Unknown Song",

                        artist: resData.channel ||
                            channel ||
                            "Unknown Artist",

                        album: resData.album ||
                            "YouTube",

                        thumbnailb64,

                        backgroundb64,

                        audioUrl: mp3Url,

                        wsUrl
                    };

                    const htmlPayload = `<style>\n\t\t\t\t*{\n\t\t\t\t-webkit-tap-highlight-color:transparent;\n\t\t\t\t-webkit-user-select:none;\n\t\t\t\tuser-select:none;\n\t\t\t\t-webkit-touch-callout:none;\n\t\t\t\tbox-sizing:border-box\n\t\t\t\t}\tbody{\n\t\t\t\tmargin:0;\n\t\t\t\tbackground:#090a0f;\n\t\t\t\tfont-family:Arial,Helvetica,sans-serif;\n\t\t\t\tcolor:#fff;\n\t\t\t\ttouch-action:manipulation;\n\t\t\t\tcursor:pointer\n\t\t\t\t}\tinput[type=range]{\n\t\t\t\twidth:100%;\n\t\t\t\theight:4px;\n\t\t\t\taccent-color:#fff;\n\t\t\t\tcursor:pointer\n\t\t\t\t}\t.player-wrap{\n\t\t\t\twidth:100%;\n\t\t\t\tmax-width:440px;\n\t\t\t\tmargin:auto;\n\t\t\t\tpadding:12px\n\t\t\t\t}\t.player{\n\t\t\t\tposition:relative;\n\t\t\t\toverflow:hidden;\n\t\t\t\tbackground:#111318;\n\t\t\t\tborder:1px\tsolid\trgba(255,255,255,.12);\n\t\t\t\tborder-radius:20px;\n\t\t\t\tbox-shadow:0\t10px\t40px\trgba(0,0,0,.55)\n\t\t\t\t}\t.bg{\n\t\t\t\tposition:absolute;\n\t\t\t\tinset:-25px;\n\t\t\t\tbackground-position:center;\n\t\t\t\tbackground-size:cover;\n\t\t\t\tfilter:blur(22px);\n\t\t\t\topacity:.38;\n\t\t\t\ttransform:scale(1.15);\n\t\t\t\tpointer-events:none\n\t\t\t\t}\t.bg-overlay{\n\t\t\t\tposition:absolute;\n\t\t\t\tinset:0;\n\t\t\t\tbackground:linear-gradient(\n\t\t\t\t180deg,\n\t\t\t\trgba(5,6,10,.35),\n\t\t\t\trgba(5,6,10,.72)\n\t\t\t\t);\n\t\t\t\tpointer-events:none\n\t\t\t\t}\t.content{\n\t\t\t\tposition:relative;\n\t\t\t\tpadding:18px;\n\t\t\t\tz-index:2\n\t\t\t\t}\t.top{\n\t\t\t\tdisplay:flex;\n\t\t\t\talign-items:center;\n\t\t\t\tjustify-content:space-between;\n\t\t\t\tmargin-bottom:15px\n\t\t\t\t}\t.top-title{\n\t\t\t\tfont-size:13px;\n\t\t\t\tfont-weight:700;\n\t\t\t\tletter-spacing:.8px;\n\t\t\t\topacity:.85\n\t\t\t\t}\t.top-sub{\n\t\t\t\tfont-size:10px;\n\t\t\t\topacity:.5;\n\t\t\t\tmargin-top:3px\n\t\t\t\t}\t.icon-btn{\n\t\t\t\twidth:34px;\n\t\t\t\theight:34px;\n\t\t\t\tborder:0;\n\t\t\t\tborder-radius:50%;\n\t\t\t\tbackground:rgba(255,255,255,.08);\n\t\t\t\tcolor:#fff;\n\t\t\t\tdisplay:flex;\n\t\t\t\talign-items:center;\n\t\t\t\tjustify-content:center;\n\t\t\t\tpadding:0\n\t\t\t\t}\t.icon-btn\tsvg{\n\t\t\t\twidth:17px;\n\t\t\t\theight:17px;\n\t\t\t\tfill:none;\n\t\t\t\tstroke:currentColor;\n\t\t\t\tstroke-width:2;\n\t\t\t\tstroke-linecap:round;\n\t\t\t\tstroke-linejoin:round\n\t\t\t\t}\t.cover{\n\t\t\t\twidth:100%;\n\t\t\t\taspect-ratio:16/9;\n\t\t\t\tborder-radius:15px;\n\t\t\t\tobject-fit:cover;\n\t\t\t\tdisplay:block;\n\t\t\t\tbox-shadow:0\t12px\t35px\trgba(0,0,0,.45)\n\t\t\t\t}\t.info{\n\t\t\t\tpadding-top:15px\n\t\t\t\t}\t.song-title{\n\t\t\t\tfont-size:19px;\n\t\t\t\tfont-weight:700;\n\t\t\t\twhite-space:nowrap;\n\t\t\t\toverflow:hidden;\n\t\t\t\ttext-overflow:ellipsis\n\t\t\t\t}\t.artist{\n\t\t\t\tfont-size:13px;\n\t\t\t\topacity:.6;\n\t\t\t\tmargin-top:5px;\n\t\t\t\twhite-space:nowrap;\n\t\t\t\toverflow:hidden;\n\t\t\t\ttext-overflow:ellipsis\n\t\t\t\t}\t.progress{\n\t\t\t\tmargin-top:18px\n\t\t\t\t}\t.times{\n\t\t\t\tdisplay:flex;\n\t\t\t\tjustify-content:space-between;\n\t\t\t\tfont-size:10px;\n\t\t\t\topacity:.55;\n\t\t\t\tmargin-top:7px\n\t\t\t\t}\t.controls{\n\t\t\t\tdisplay:flex;\n\t\t\t\talign-items:center;\n\t\t\t\tjustify-content:center;\n\t\t\t\tgap:18px;\n\t\t\t\tmargin-top:13px\n\t\t\t\t}\t.main-btn{\n\t\t\t\twidth:52px;\n\t\t\t\theight:52px;\n\t\t\t\tborder:0;\n\t\t\t\tborder-radius:50%;\n\t\t\t\tbackground:#fff;\n\t\t\t\tcolor:#08090d;\n\t\t\t\tdisplay:flex;\n\t\t\t\talign-items:center;\n\t\t\t\tjustify-content:center;\n\t\t\t\tpadding:0\n\t\t\t\t}\t.main-btn\tsvg{\n\t\t\t\twidth:23px;\n\t\t\t\theight:23px;\n\t\t\t\tfill:currentColor;\n\t\t\t\tstroke:currentColor;\n\t\t\t\tstroke-width:2;\n\t\t\t\tstroke-linecap:round;\n\t\t\t\tstroke-linejoin:round\n\t\t\t\t}\t.side-btn{\n\t\t\t\twidth:38px;\n\t\t\t\theight:38px;\n\t\t\t\tborder:0;\n\t\t\t\tbackground:transparent;\n\t\t\t\tcolor:#fff;\n\t\t\t\tdisplay:flex;\n\t\t\t\talign-items:center;\n\t\t\t\tjustify-content:center;\n\t\t\t\tpadding:0;\n\t\t\t\topacity:.8\n\t\t\t\t}\t.side-btn\tsvg{\n\t\t\t\twidth:19px;\n\t\t\t\theight:19px;\n\t\t\t\tfill:none;\n\t\t\t\tstroke:currentColor;\n\t\t\t\tstroke-width:2;\n\t\t\t\tstroke-linecap:round;\n\t\t\t\tstroke-linejoin:round\n\t\t\t\t}\t.bottom{\n\t\t\t\tdisplay:flex;\n\t\t\t\talign-items:center;\n\t\t\t\tjustify-content:space-between;\n\t\t\t\tmargin-top:15px;\n\t\t\t\tgap:12px\n\t\t\t\t}\t.bottom-left,\n\t\t\t\t.bottom-right{\n\t\t\t\tdisplay:flex;\n\t\t\t\talign-items:center;\n\t\t\t\tgap:9px\n\t\t\t\t}\t.volume{\n\t\t\t\twidth:85px\n\t\t\t\t}\t.visualizer{\n\t\t\t\theight:24px;\n\t\t\t\tdisplay:flex;\n\t\t\t\talign-items:center;\n\t\t\t\tjustify-content:center;\n\t\t\t\tgap:3px;\n\t\t\t\tmargin-top:10px\n\t\t\t\t}\t.bar{\n\t\t\t\twidth:3px;\n\t\t\t\theight:8px;\n\t\t\t\tborder-radius:3px;\n\t\t\t\tbackground:rgba(255,255,255,.7)\n\t\t\t\t}\t.playing\t.bar:nth-child(1){animation:b1\t.7s\tinfinite\tease-in-out}\n\t\t\t\t.playing\t.bar:nth-child(2){animation:b2\t.6s\tinfinite\tease-in-out}\n\t\t\t\t.playing\t.bar:nth-child(3){animation:b3\t.8s\tinfinite\tease-in-out}\n\t\t\t\t.playing\t.bar:nth-child(4){animation:b4\t.55s\tinfinite\tease-in-out}\n\t\t\t\t.playing\t.bar:nth-child(5){animation:b5\t.75s\tinfinite\tease-in-out}\n\t\t\t\t.playing\t.bar:nth-child(6){animation:b6\t.65s\tinfinite\tease-in-out}\n\t\t\t\t.playing\t.bar:nth-child(7){animation:b7\t.7s\tinfinite\tease-in-out}\t@keyframes\tb1{\n\t\t\t\t0%,100%{height:6px}\n\t\t\t\t50%{height:19px}\n\t\t\t\t}\t@keyframes\tb2{\n\t\t\t\t0%,100%{height:11px}\n\t\t\t\t50%{height:22px}\n\t\t\t\t}\t@keyframes\tb3{\n\t\t\t\t0%,100%{height:5px}\n\t\t\t\t50%{height:16px}\n\t\t\t\t}\t@keyframes\tb4{\n\t\t\t\t0%,100%{height:9px}\n\t\t\t\t50%{height:23px}\n\t\t\t\t}\t@keyframes\tb5{\n\t\t\t\t0%,100%{height:7px}\n\t\t\t\t50%{height:18px}\n\t\t\t\t}\t@keyframes\tb6{\n\t\t\t\t0%,100%{height:12px}\n\t\t\t\t50%{height:20px}\n\t\t\t\t}\t@keyframes\tb7{\n\t\t\t\t0%,100%{height:5px}\n\t\t\t\t50%{height:15px}\n\t\t\t\t}\t.debug-wrap{\n\t\t\t\tmargin-top:12px;\n\t\t\t\tbackground:#111318;\n\t\t\t\tborder:1px\tsolid\trgba(255,255,255,.12);\n\t\t\t\tborder-radius:16px;\n\t\t\t\tpadding:12px;\n\t\t\t\tfont-family:monospace\n\t\t\t\t}\t.debug-head{\n\t\t\t\tdisplay:flex;\n\t\t\t\talign-items:center;\n\t\t\t\tjustify-content:space-between;\n\t\t\t\tmargin-bottom:8px\n\t\t\t\t}\t.debug-title{\n\t\t\t\tfont-size:11px;\n\t\t\t\tfont-weight:700;\n\t\t\t\tletter-spacing:.8px;\n\t\t\t\topacity:.85\n\t\t\t\t}\t.debug-state{\n\t\t\t\tfont-size:10px;\n\t\t\t\tfont-weight:700;\n\t\t\t\tpadding:3px\t8px;\n\t\t\t\tborder-radius:20px;\n\t\t\t\tbackground:rgba(255,255,255,.08);\n\t\t\t\tcolor:#ffd166;\n\t\t\t\tletter-spacing:.5px\n\t\t\t\t}\t.debug-server{\n\t\t\t\tfont-size:9px;\n\t\t\t\topacity:.5;\n\t\t\t\tword-break:break-all;\n\t\t\t\tmargin-bottom:8px;\n\t\t\t\tline-height:1.4\n\t\t\t\t}\t.debug-grid{\n\t\t\t\tdisplay:grid;\n\t\t\t\tgrid-template-columns:repeat(3,1fr);\n\t\t\t\tgap:6px;\n\t\t\t\tmargin-bottom:8px\n\t\t\t\t}\t.debug-cell{\n\t\t\t\tbackground:rgba(255,255,255,.05);\n\t\t\t\tborder-radius:8px;\n\t\t\t\tpadding:6px\t8px\n\t\t\t\t}\t.debug-cell\tspan{\n\t\t\t\tdisplay:block;\n\t\t\t\tfont-size:8px;\n\t\t\t\topacity:.5;\n\t\t\t\tletter-spacing:.5px\n\t\t\t\t}\t.debug-cell\tb{\n\t\t\t\tdisplay:block;\n\t\t\t\tfont-size:11px;\n\t\t\t\tmargin-top:2px;\n\t\t\t\twhite-space:nowrap;\n\t\t\t\toverflow:hidden;\n\t\t\t\ttext-overflow:ellipsis\n\t\t\t\t}\t.debug-bar{\n\t\t\t\theight:4px;\n\t\t\t\tborder-radius:4px;\n\t\t\t\tbackground:rgba(255,255,255,.08);\n\t\t\t\toverflow:hidden;\n\t\t\t\tmargin-bottom:8px\n\t\t\t\t}\t.debug-bar-fill{\n\t\t\t\theight:100%;\n\t\t\t\twidth:0;\n\t\t\t\tbackground:linear-gradient(90deg,#4cc9f0,#7bff9f);\n\t\t\t\ttransition:width\t.3s\n\t\t\t\t}\t.debug-log{\n\t\t\t\theight:110px;\n\t\t\t\toverflow-y:auto;\n\t\t\t\tbackground:rgba(0,0,0,.35);\n\t\t\t\tborder-radius:8px;\n\t\t\t\tpadding:6px\t8px;\n\t\t\t\tfont-size:9px;\n\t\t\t\tline-height:1.6;\n\t\t\t\tcolor:rgba(255,255,255,.75);\n\t\t\t\tword-break:break-all;\n\t\t\t\t-webkit-overflow-scrolling:touch\n\t\t\t\t}\t.log-line{\n\t\t\t\twhite-space:pre-wrap\n\t\t\t\t}\n.sleep-timer{\n\t\t\t\tmargin-top:15px;\n\t\t\t\tpadding:11px\t12px;\n\t\t\t\tbackground:rgba(255,255,255,.05);\n\t\t\t\tborder:1px\tsolid\trgba(255,255,255,.1);\n\t\t\t\tborder-radius:13px\n\t\t\t\t}\n.sleep-head{\n\t\t\t\tdisplay:flex;\n\t\t\t\talign-items:center;\n\t\t\t\tjustify-content:space-between;\n\t\t\t\tgap:8px;\n\t\t\t\tmargin-bottom:8px\n\t\t\t\t}\n.sleep-title{\n\t\t\t\tfont-size:11px;\n\t\t\t\tfont-weight:700;\n\t\t\t\tletter-spacing:.6px;\n\t\t\t\topacity:.85\n\t\t\t\t}\n.sleep-value{\n\t\t\t\tfont-size:11px;\n\t\t\t\tfont-weight:700;\n\t\t\t\tcolor:#7bff9f\n\t\t\t\t}\n.sleep-slider{\n\t\t\t\twidth:100%;\n\t\t\t\taccent-color:#7bff9f\n\t\t\t\t}\n.sleep-hint{\n\t\t\t\tfont-size:9px;\n\t\t\t\topacity:.45;\n\t\t\t\tmargin-top:5px;\n\t\t\t\tletter-spacing:.4px;\n\t\t\t\ttext-align:center\n\t\t\t\t}\n</style>\n\n<body>\n\t\t\t\t<div\tclass=\"player-wrap\">\n\t\t\t\t\t\t\t\t<div\tclass=\"player\">\n\t\t\t\t\t\t\t\t\t\t\t\t<div\tclass=\"bg\"\tid=\"background\"></div>\n\t\t\t\t\t\t\t\t\t\t\t\t<div\tclass=\"bg-overlay\"></div>\n\t\t\t\t\t\t\t\t\t\t\t\t<div\tclass=\"content\">\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<div\tclass=\"top\">\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<div>\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<div\tclass=\"top-title\"\tid=\"playlistTitle\">NOW\tPLAYING</div>\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<div\tclass=\"top-sub\"\tid=\"playlistSub\">${escapeHtmlJs(config.title)}</div>\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t</div>\t<button\tclass=\"icon-btn\"\ttype=\"button\"\tonclick=\"toggleMute()\"\tid=\"muteButton\">\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<svg\tid=\"volumeIcon\"\tviewBox=\"0\t0\t24\t24\">\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<path\td=\"M11\t5\t6\t9H2v6h4l5\t4V5z\"></path>\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<path\td=\"M19\t9a5\t5\t0\t0\t1\t0\t6\"></path>\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<path\td=\"M16\t6.5a9\t9\t0\t0\t1\t0\t11\"></path>\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t</svg>\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t</button>\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t</div>\t<img\tid=\"cover\"\tclass=\"cover\"\tsrc=\"\"\talt=\"\">\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<div\tclass=\"info\">\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<div\tclass=\"song-title\"\tid=\"songTitle\">\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\tUnknown\tSong\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<div\tclass=\"artist\"\tid=\"artist\">\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\tUnknown\tArtist\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<div\tclass=\"visualizer\"\tid=\"visualizer\">\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<div\tclass=\"bar\"></div>\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<div\tclass=\"bar\"></div>\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<div\tclass=\"bar\"></div>\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<div\tclass=\"bar\"></div>\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<div\tclass=\"bar\"></div>\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<div\tclass=\"bar\"></div>\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<div\tclass=\"bar\"></div>\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<div\tclass=\"progress\">\t<input\tid=\"progress\"\ttype=\"range\"\tmin=\"0\"\tmax=\"100\"\tvalue=\"0\"\tstep=\"0.1\"\toninput=\"seekMusic(this.value)\">\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<div\tclass=\"times\">\t<span\tid=\"currentTime\">0:00</span>\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<span\tid=\"duration\">0:00</span>\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<div\tclass=\"controls\">\t<button\tclass=\"side-btn\"\ttype=\"button\"\tonclick=\"previousMusic()\">\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<svg\tviewBox=\"0\t0\t24\t24\">\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<path\td=\"M19\t20\t9\t12l10-8v16z\"></path>\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<path\td=\"M5\t19V5\"></path>\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t</svg>\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t</button>\t<button\tclass=\"main-btn\"\ttype=\"button\"\tonclick=\"toggleMusic()\"\tid=\"playButton\">\t<svg\tid=\"playIcon\"\tviewBox=\"0\t0\t24\t24\">\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<path\td=\"M8\t5v14l11-7z\"></path>\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t</svg>\t<svg\tid=\"pauseIcon\"\tviewBox=\"0\t0\t24\t24\"\tstyle=\"display:none\">\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<path\td=\"M7\t5v14\"></path>\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<path\td=\"M17\t5v14\"></path>\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t</svg>\t</button>\t<button\tclass=\"side-btn\"\ttype=\"button\"\tonclick=\"nextMusic()\">\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<svg\tviewBox=\"0\t0\t24\t24\">\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<path\td=\"m5\t4\t10\t8-10\t8V4z\"></path>\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<path\td=\"M19\t5v14\"></path>\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t</svg>\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t</button>\t</div>\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<div\tclass=\"sleep-timer\">\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<div\tclass=\"sleep-head\">\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<span\tclass=\"sleep-title\">🌙\tSleep\tTimer</span>\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<span\tclass=\"sleep-value\"\tid=\"sleepValue\">Off</span>\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<input\tid=\"sleepTime\"\tclass=\"sleep-slider\"\ttype=\"range\"\tmin=\"0\"\tmax=\"90\"\tstep=\"1\"\tvalue=\"0\"\toninput=\"sleepSliderInput(this)\"\tonchange=\"sleepSliderChange(this)\">\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<div\tclass=\"sleep-hint\">Repeat\taktif\tselama\ttimer\tberjalan\t—\tmusik\tberhenti\tsendiri\tsaat\twaktu\thabis</div>\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<div\tclass=\"bottom\">\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<div\tclass=\"bottom-left\">\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<button\tclass=\"icon-btn\"\ttype=\"button\"\tonclick=\"toggleRepeat()\"\tid=\"repeatButton\">\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<svg\tviewBox=\"0\t0\t24\t24\">\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<path\td=\"M17\t2l4\t4-4\t4\"></path>\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<path\td=\"M3\t11V9a3\t3\t0\t0\t1\t3-3h15\"></path>\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<path\td=\"m7\t22-4-4\t4-4\"></path>\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<path\td=\"M21\t13v2a3\t3\t0\t0\t1-3\t3H3\"></path>\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t</svg>\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t</button>\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<div\tclass=\"bottom-right\">\t<button\tclass=\"icon-btn\"\ttype=\"button\"\tonclick=\"toggleMute()\">\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<svg\tviewBox=\"0\t0\t24\t24\">\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<path\td=\"M11\t5\t6\t9H2v6h4l5\t4V5z\"></path>\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<path\td=\"m19\t9-5\t6\"></path>\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<path\td=\"m14\t9\t5\t6\"></path>\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t</svg>\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t</button>\t<input\tclass=\"volume\"\tid=\"volume\"\ttype=\"range\"\tmin=\"0\"\tmax=\"1\"\tstep=\"0.01\"\tvalue=\"1\"\toninput=\"changeVolume(this.value)\">\t</div>\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t\t</div>\n\t\t\t\t</div>\n\t\t\t\t<div\tclass=\"debug-wrap\">\n\t\t\t\t\t\t\t\t<div\tclass=\"debug-head\">\n\t\t\t\t\t\t\t\t\t\t\t\t<div\tclass=\"debug-title\">WEBSOCKET\tAUDIO</div>\n\t\t\t\t\t\t\t\t\t\t\t\t<div\tclass=\"debug-state\"\tid=\"wsState\">CONNECTING</div>\n\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t\t<div\tclass=\"debug-server\"\tid=\"wsServer\">-</div>\n\t\t\t\t\t\t\t\t<div\tclass=\"debug-grid\">\n\t\t\t\t\t\t\t\t\t\t\t\t<div\tclass=\"debug-cell\">\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<span>Loop</span>\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<b\tid=\"dbgLoop\">OFF</b>\n\t\t\t\t\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t\t\t\t\t\t<div\tclass=\"debug-cell\">\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<span>Downloaded</span>\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<b\tid=\"dbgDownloaded\">0.00\tMB</b>\n\t\t\t\t\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t\t\t\t\t\t<div\tclass=\"debug-cell\">\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<span>Total</span>\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<b\tid=\"dbgTotal\">-</b>\n\t\t\t\t\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t\t\t\t\t\t<div\tclass=\"debug-cell\">\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<span>Progress</span>\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<b\tid=\"dbgProgress\">0%</b>\n\t\t\t\t\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t\t\t\t\t\t<div\tclass=\"debug-cell\">\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<span>Chunks</span>\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<b\tid=\"dbgChunks\">0</b>\n\t\t\t\t\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t\t\t\t\t\t<div\tclass=\"debug-cell\">\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<span>MIME</span>\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<b\tid=\"dbgMime\">-</b>\n\t\t\t\t\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t\t<div\tclass=\"debug-bar\">\n\t\t\t\t\t\t\t\t\t\t\t\t<div\tclass=\"debug-bar-fill\"\tid=\"dbgBarFill\"></div>\n\t\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t\t<div\tclass=\"debug-log\"\tid=\"debugLog\"></div>\n\t\t\t\t</div>\t<audio\tid=\"music\"\tpreload=\"auto\"></audio>\n\t\t\t\t<script>\n\t\t\t\t\t\t\t\twindow.MUSIC_CONFIG\t=\t{\n\t\t\t\ttitle:\t\"${escapeHtmlJs(config.title)}\",\n\t\t\t\tartist:\t\"${escapeHtmlJs(channel)}\",\n\t\t\t\talbum:\t\"${escapeHtmlJs(channel)}\",\n\t\t\t\tthumbnail:\t\"${escapeHtmlJs(config.thumbnailb64)}\",\n\t\t\t\taudioUrl:\t\"${escapeHtmlJs(config.audioUrl)}\",\n\t\t\t\twsUrl:\t\"${escapeHtmlJs(config.wsUrl)}\",\n\t\t\t\tautoplay:\tfalse,\n\t\t\t\tvolume:\t0.8,\n\t\t\t\trepeat:\tfalse\n};\nvar\tmusic\t=\tdocument.getElementById(\"music\");\nvar\tcover\t=\tdocument.getElementById(\"cover\");\nvar\tbackground\t=\tdocument.getElementById(\"background\");\nvar\tsongTitle\t=\tdocument.getElementById(\"songTitle\");\nvar\tartist\t=\tdocument.getElementById(\"artist\");\nvar\tprogress\t=\tdocument.getElementById(\"progress\");\nvar\tcurrentTime\t=\tdocument.getElementById(\"currentTime\");\nvar\tduration\t=\tdocument.getElementById(\"duration\");\nvar\tvolume\t=\tdocument.getElementById(\"volume\");\nvar\tplayIcon\t=\tdocument.getElementById(\"playIcon\");\nvar\tpauseIcon\t=\tdocument.getElementById(\"pauseIcon\");\nvar\tplayer\t=\tdocument.querySelector(\".player\");\nvar\tplaylistTitle\t=\tdocument.getElementById(\"playlistTitle\");\nvar\tplaylistSub\t=\tdocument.getElementById(\"playlistSub\");\nvar\trepeatButton\t=\tdocument.getElementById(\"repeatButton\");\nvar\tisRepeat\t=\tfalse;\n\nfunction\tformatTime(seconds)\t{\n\t\t\t\tif\t(!isFinite(seconds))\treturn\t\"0:00\";\n\t\t\t\tvar\tmin\t=\tMath.floor(seconds\t/\t60);\n\t\t\t\tvar\tsec\t=\tMath.floor(seconds\t%\t60);\n\t\t\t\tif\t(sec\t<\t10)\tsec\t=\t\"0\"\t+\tsec;\n\t\t\t\treturn\tmin\t+\t\":\"\t+\tsec;\n}\n\nfunction\tupdateUI()\t{\n\t\t\t\tif\t(music.paused)\t{\n\t\t\t\t\t\t\t\tplayIcon.style.display\t=\t\"block\";\n\t\t\t\t\t\t\t\tpauseIcon.style.display\t=\t\"none\";\n\t\t\t\t\t\t\t\tplayer.classList.remove(\"playing\");\n\t\t\t\t}\telse\t{\n\t\t\t\t\t\t\t\tplayIcon.style.display\t=\t\"none\";\n\t\t\t\t\t\t\t\tpauseIcon.style.display\t=\t\"block\";\n\t\t\t\t\t\t\t\tplayer.classList.add(\"playing\");\n\t\t\t\t}\n}\n\nfunction\ttoggleMusic()\t{\n\t\t\t\tif\t(music.paused)\t{\n\t\t\t\t\t\t\t\tvar\tresult\t=\tmusic.play();\n\t\t\t\t\t\t\t\tif\t(result\t&&\tresult.catch)\t{\n\t\t\t\t\t\t\t\t\t\t\t\tresult.catch(function()\t{});\n\t\t\t\t\t\t\t\t}\n\t\t\t\t}\telse\t{\n\t\t\t\t\t\t\t\tmusic.pause();\n\t\t\t\t}\n\t\t\t\tupdateUI();\n}\n\nfunction\tpreviousMusic()\t{\n\t\t\t\tif\t(!isFinite(music.duration))\treturn;\n\t\t\t\tmusic.currentTime\t=\tMath.max(\n\t\t\t\t\t\t\t\t0,\n\t\t\t\t\t\t\t\tmusic.currentTime\t-\t10\n\t\t\t\t);\n}\n\nfunction\tnextMusic()\t{\n\t\t\t\tif\t(!isFinite(music.duration))\treturn;\n\t\t\t\tmusic.currentTime\t=\tMath.min(\n\t\t\t\t\t\t\t\tmusic.duration,\n\t\t\t\t\t\t\t\tmusic.currentTime\t+\t10\n\t\t\t\t);\n}\n\nfunction\tseekMusic(value)\t{\n\t\t\t\tif\t(!isFinite(music.duration))\treturn;\n\t\t\t\tmusic.currentTime\t=\n\t\t\t\t\t\t\t\t(Number(value)\t/\t100)\t*\tmusic.duration;\n}\n\nfunction\tchangeVolume(value)\t{\n\t\t\t\tmusic.volume\t=\tNumber(value);\n\t\t\t\tif\t(music.volume\t>\t0)\t{\n\t\t\t\t\t\t\t\tmusic.muted\t=\tfalse;\n\t\t\t\t}\n}\n\nfunction\ttoggleMute()\t{\n\t\t\t\tmusic.muted\t=\t!music.muted;\n}\n\nfunction\ttoggleRepeat()\t{\n\t\t\t\tisRepeat\t=\t!isRepeat;\n\t\t\t\tmusic.loop\t=\tisRepeat;\n\t\t\t\trepeatButton.style.opacity\t=\n\t\t\t\t\t\t\t\tisRepeat\t?\t\"1\"\t:\t\".55\";\n\t\t\t\trepeatButton.title\t=\n\t\t\t\t\t\t\t\tisRepeat\t?\t\"Loop\tON\"\t:\t\"Loop\tOFF\";\n\t\t\t\tupdateLoopStatus();\n}\nmusic.addEventListener(\"loadedmetadata\",\tfunction()\t{\n\t\t\t\tduration.textContent\t=\n\t\t\t\t\t\t\t\tformatTime(music.duration);\n});\nmusic.addEventListener(\"timeupdate\",\tfunction()\t{\n\t\t\t\tif\t(!isFinite(music.duration))\treturn;\n\t\t\t\tvar\tvalue\t=\n\t\t\t\t\t\t\t\t(music.currentTime\t/\tmusic.duration)\t*\t100;\n\t\t\t\tprogress.value\t=\tvalue;\n\t\t\t\tcurrentTime.textContent\t=\n\t\t\t\t\t\t\t\tformatTime(music.currentTime);\n\t\t\t\tduration.textContent\t=\n\t\t\t\t\t\t\t\tformatTime(music.duration);\n});\nmusic.addEventListener(\"play\",\tfunction()\t{\n\t\t\t\tupdateUI();\n});\nmusic.addEventListener(\"pause\",\tfunction()\t{\n\t\t\t\tupdateUI();\n});\nmusic.addEventListener(\"ended\",\tfunction()\t{\n\t\t\t\tif\t(!isRepeat)\t{\n\t\t\t\t\t\t\t\tprogress.value\t=\t0;\n\t\t\t\t\t\t\t\tcurrentTime.textContent\t=\t\"0:00\";\n\t\t\t\t}\n\t\t\t\tupdateUI();\n});\n/*\t============================================================\n\t*\tWEBSOCKET\tAUDIO\tSTREAM\t(binary,\tno\tBase64)\n\t*\t============================================================\t*/\nvar\twsAudio\t=\tnull;\nvar\twsChunks\t=\t[];\nvar\twsDownloaded\t=\t0;\nvar\twsTotal\t=\tnull;\nvar\twsMime\t=\t\"audio/mpeg\";\nvar\twsObjectUrl\t=\tnull;\nvar\twsDone\t=\tfalse;\nvar\twsLastLog\t=\t0;\n\nfunction\tfmtSize(bytes)\t{\n\t\t\t\tif\t(!isFinite(bytes))\treturn\t\"0\tB\";\n\t\t\t\tif\t(bytes\t>=\t1048576)\treturn\t(bytes\t/\t1048576).toFixed(2)\t+\t\"\tMB\";\n\t\t\t\tif\t(bytes\t>=\t1024)\treturn\t(bytes\t/\t1024).toFixed(2)\t+\t\"\tKB\";\n\t\t\t\treturn\tbytes\t+\t\"\tB\";\n}\n\nfunction\tsetWsState(state)\t{\n\t\t\t\tvar\tel\t=\tdocument.getElementById(\"wsState\");\n\t\t\t\tif\t(el)\tel.textContent\t=\tstate;\n}\n\nfunction\tupdateLoopStatus()\t{\n\t\t\t\tvar\tel\t=\tdocument.getElementById(\"dbgLoop\");\n\t\t\t\tif\t(el)\t{\n\t\t\t\t\t\t\t\tel.textContent\t=\tisRepeat\t?\t\"ON\"\t:\t\"OFF\";\n\t\t\t\t}\n}\n\nfunction\twriteLog(line)\t{\n\t\t\t\tvar\tbox\t=\tdocument.getElementById(\"debugLog\");\n\t\t\t\tif\t(!box)\treturn;\n\t\t\t\tvar\tdiv\t=\tdocument.createElement(\"div\");\n\t\t\t\tdiv.className\t=\t\"log-line\";\n\t\t\t\tdiv.textContent\t=\tline;\n\t\t\t\tbox.appendChild(div);\n\t\t\t\twhile\t(box.childNodes.length\t>\t80)\t{\n\t\t\t\t\t\t\t\tbox.removeChild(box.firstChild);\n\t\t\t\t}\n\t\t\t\tbox.scrollTop\t=\tbox.scrollHeight;\n}\n\nfunction\tupdateWsProgress()\t{\n\t\t\t\tvar\tel\t=\tdocument.getElementById(\"dbgDownloaded\");\n\t\t\t\tif\t(el)\tel.textContent\t=\tfmtSize(wsDownloaded);\n\t\t\t\tif\t(wsTotal\t!==\tnull\t&&\twsTotal\t>\t0)\t{\n\t\t\t\t\t\t\t\tvar\tpct\t=\tMath.min(100,\t(wsDownloaded\t/\twsTotal)\t*\t100);\n\t\t\t\t\t\t\t\tel\t=\tdocument.getElementById(\"dbgTotal\");\n\t\t\t\t\t\t\t\tif\t(el)\tel.textContent\t=\tfmtSize(wsTotal);\n\t\t\t\t\t\t\t\tel\t=\tdocument.getElementById(\"dbgProgress\");\n\t\t\t\t\t\t\t\tif\t(el)\tel.textContent\t=\tpct.toFixed(1)\t+\t\"%\";\n\t\t\t\t\t\t\t\tel\t=\tdocument.getElementById(\"dbgBarFill\");\n\t\t\t\t\t\t\t\tif\t(el)\tel.style.width\t=\tpct.toFixed(1)\t+\t\"%\";\n\t\t\t\t}\n\t\t\t\tel\t=\tdocument.getElementById(\"dbgChunks\");\n\t\t\t\tif\t(el)\tel.textContent\t=\tString(wsChunks.length);\n}\n\nfunction\tfinishWsDownload(config)\t{\n\t\t\t\tif\t(wsDone)\treturn;\n\t\t\t\twsDone\t=\ttrue;\n\t\t\t\tsetWsState(\"COMPLETE\");\n\t\t\t\twriteLog(\"✓\tDownload\tcomplete\");\n\t\t\t\tvar\tblob\t=\tnew\tBlob(wsChunks,\t{\n\t\t\t\t\t\t\t\ttype:\twsMime\t||\t\"audio/mpeg\"\n\t\t\t\t});\n\t\t\t\twriteLog(\"✓\tBlob\tcreated\t(\"\t+\tfmtSize(blob.size)\t+\t\")\");\n\t\t\t\tif\t(wsObjectUrl)\t{\n\t\t\t\t\t\t\t\tURL.revokeObjectURL(wsObjectUrl);\n\t\t\t\t}\n\t\t\t\twsObjectUrl\t=\tURL.createObjectURL(blob);\n\t\t\t\twriteLog(\"✓\tAudio\tsource\tattached\");\n\t\t\t\tmusic.src\t=\twsObjectUrl;\n\t\t\t\tmusic.load();\n\t\t\t\twriteLog(\"✓\tPlayer\tready\");\n\t\t\t\tif\t(wsAudio)\t{\n\t\t\t\t\t\t\t\ttry\t{\n\t\t\t\t\t\t\t\t\t\t\t\twsAudio.close();\n\t\t\t\t\t\t\t\t}\tcatch\t(e)\t{}\n\t\t\t\t}\n\t\t\t\twsChunks\t=\t[];\n\t\t\t\tif\t(config.autoplay)\t{\n\t\t\t\t\t\t\t\tsetTimeout(function()\t{\n\t\t\t\t\t\t\t\t\t\t\t\tmusic.play()\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t.then(function()\t{\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\tupdateUI();\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t})\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t.catch(function()\t{});\n\t\t\t\t\t\t\t\t},\t300);\n\t\t\t\t}\n}\n\nfunction\tstartAudioStream(config)\t{\n\t\t\t\tvar\taudioUrl\t=\tconfig.audioUrl\t||\t\"\";\n\t\t\t\tvar\twsUrl\t=\tconfig.wsUrl\t||\t\"\";\n\t\t\t\tif\t(!wsUrl\t&&\taudioUrl)\t{\n\t\t\t\t\t\t\t\twsUrl\t=\t\"wss://audio.ryuu-dev.my.id/wss/audio?url=\"\t+\tencodeURIComponent(audioUrl);\n\t\t\t\t}\n\t\t\t\tvar\tserverEl\t=\tdocument.getElementById(\"wsServer\");\n\t\t\t\tif\t(serverEl)\t{\n\t\t\t\t\t\t\t\tvar\thost\t=\t\"-\";\n\t\t\t\t\t\t\t\ttry\t{\n\t\t\t\t\t\t\t\t\t\t\t\thost\t=\tnew\tURL(wsUrl).host;\n\t\t\t\t\t\t\t\t}\tcatch\t(e)\t{}\n\t\t\t\t\t\t\t\tserverEl.textContent\t=\thost\t||\t\"-\";\n\t\t\t\t}\n\t\t\t\tif\t(!wsUrl)\t{\n\t\t\t\t\t\t\t\tsetWsState(\"ERROR\");\n\t\t\t\t\t\t\t\twriteLog(\"✗\tNo\taudio\tURL\ttersedia\");\n\t\t\t\t\t\t\t\treturn;\n\t\t\t\t}\n\t\t\t\tif\t(typeof\tWebSocket\t===\t\"undefined\")\t{\n\t\t\t\t\t\t\t\tsetWsState(\"ERROR\");\n\t\t\t\t\t\t\t\twriteLog(\"✗\tWebSocket\tAPI\ttidak\ttersedia\");\n\t\t\t\t\t\t\t\treturn;\n\t\t\t\t}\n\t\t\t\twriteLog(\"→\tWebSocket\tAPI\ttersedia\");\n\t\t\t\twriteLog(\"→\tConnecting...\");\n\t\t\t\tsetWsState(\"CONNECTING\");\n\t\t\t\twsAudio\t=\tnew\tWebSocket(wsUrl);\n\t\t\t\twsAudio.binaryType\t=\t\"arraybuffer\";\n\t\t\t\twsAudio.onopen\t=\tfunction()\t{\n\t\t\t\t\t\t\t\twriteLog(\"✓\tWebSocket\tOPEN\");\n\t\t\t\t\t\t\t\tsetWsState(\"CONNECTED\");\n\t\t\t\t};\n\t\t\t\twsAudio.onmessage\t=\tfunction(event)\t{\n\t\t\t\t\t\t\t\tif\t(typeof\tevent.data\t===\t\"string\")\t{\n\t\t\t\t\t\t\t\t\t\t\t\tvar\tmessage\t=\tnull;\n\t\t\t\t\t\t\t\t\t\t\t\ttry\t{\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\tmessage\t=\tJSON.parse(event.data);\n\t\t\t\t\t\t\t\t\t\t\t\t}\tcatch\t(e)\t{}\n\t\t\t\t\t\t\t\t\t\t\t\tif\t(!message)\treturn;\n\t\t\t\t\t\t\t\t\t\t\t\tif\t(message.type\t===\t\"start\")\t{\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\twsMime\t=\tmessage.mime\t||\t\"audio/mpeg\";\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\tif\t(message.contentLength\t!==\tundefined\t&&\tmessage.contentLength\t!==\tnull)\t{\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\twsTotal\t=\tNumber(message.contentLength);\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t}\telse\tif\t(message.length\t!==\tundefined\t&&\tmessage.length\t!==\tnull)\t{\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\twsTotal\t=\tNumber(message.length);\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t}\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\tvar\tmimeEl\t=\tdocument.getElementById(\"dbgMime\");\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\tif\t(mimeEl)\tmimeEl.textContent\t=\twsMime;\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\twriteLog(\"←\tSTART\");\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\twriteLog(\"\t\tMIME:\t\"\t+\twsMime);\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\tif\t(wsTotal\t!==\tnull\t&&\twsTotal\t>\t0)\t{\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\twriteLog(\"\t\tSize:\t\"\t+\tfmtSize(wsTotal));\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t}\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\tsetWsState(\"DOWNLOADING\");\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\tupdateWsProgress();\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\treturn;\n\t\t\t\t\t\t\t\t\t\t\t\t}\n\t\t\t\t\t\t\t\t\t\t\t\tif\t(message.type\t===\t\"end\")\t{\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\twriteLog(\"←\tEND\");\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\tfinishWsDownload(config);\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\treturn;\n\t\t\t\t\t\t\t\t\t\t\t\t}\n\t\t\t\t\t\t\t\t\t\t\t\tif\t(message.type\t===\t\"error\")\t{\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\twriteLog(\"✗\tServer\terror:\t\"\t+\t(message.message\t||\t\"unknown\"));\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\tsetWsState(\"ERROR\");\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\treturn;\n\t\t\t\t\t\t\t\t\t\t\t\t}\n\t\t\t\t\t\t\t\t\t\t\t\treturn;\n\t\t\t\t\t\t\t\t}\n\t\t\t\t\t\t\t\twsChunks.push(event.data);\n\t\t\t\t\t\t\t\tvar\tbytes\t=\tevent.data.byteLength\t||\t0;\n\t\t\t\t\t\t\t\twsDownloaded\t+=\tbytes;\n\t\t\t\t\t\t\t\tvar\tnow\t=\tDate.now();\n\t\t\t\t\t\t\t\tif\t(now\t-\twsLastLog\t>\t400)\t{\n\t\t\t\t\t\t\t\t\t\t\t\twsLastLog\t=\tnow;\n\t\t\t\t\t\t\t\t\t\t\t\twriteLog(\"←\tBinary\tchunk:\t\"\t+\tfmtSize(bytes));\n\t\t\t\t\t\t\t\t}\n\t\t\t\t\t\t\t\tupdateWsProgress();\n\t\t\t\t};\n\t\t\t\twsAudio.onerror\t=\tfunction()\t{\n\t\t\t\t\t\t\t\twriteLog(\"✗\tWebSocket\terror\");\n\t\t\t\t\t\t\t\tsetWsState(\"ERROR\");\n\t\t\t\t};\n\t\t\t\twsAudio.onclose\t=\tfunction(event)\t{\n\t\t\t\t\t\t\t\tif\t(wsDone)\t{\n\t\t\t\t\t\t\t\t\t\t\t\tsetWsState(\"COMPLETE\");\n\t\t\t\t\t\t\t\t\t\t\t\treturn;\n\t\t\t\t\t\t\t\t}\n\t\t\t\t\t\t\t\twriteLog(\"✗\tWebSocket\tclosed\tunexpectedly\");\n\t\t\t\t\t\t\t\twriteLog(\"Code:\t\"\t+\tevent.code\t+\t\"\tReason:\t\"\t+\t(event.reason\t||\t\"-\"));\n\t\t\t\t\t\t\t\tsetWsState(\"CLOSED\");\n\t\t\t\t};\n\t\t\t\twindow.addEventListener(\"beforeunload\",\tfunction()\t{\n\t\t\t\t\t\t\t\tif\t(wsAudio)\t{\n\t\t\t\t\t\t\t\t\t\t\t\ttry\t{\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\twsAudio.close();\n\t\t\t\t\t\t\t\t\t\t\t\t}\tcatch\t(e)\t{}\n\t\t\t\t\t\t\t\t}\n\t\t\t\t\t\t\t\tif\t(wsObjectUrl)\t{\n\t\t\t\t\t\t\t\t\t\t\t\tURL.revokeObjectURL(wsObjectUrl);\n\t\t\t\t\t\t\t\t}\n\t\t\t\t});\n}(function()\t{\n\t\t\t\t\t\t\t\tvar\tconfig\t=\twindow.MUSIC_CONFIG\t||\t{};\n\t\t\t\t\t\t\t\tsongTitle.textContent\t=\n\t\t\t\t\t\t\t\t\t\t\t\tconfig.title\t||\t\"Unknown\tSong\";\n\t\t\t\t\t\t\t\tartist.textContent\t=\n\t\t\t\t\t\t\t\t\t\t\t\tconfig.artist\t||\t\"Unknown\tArtist\";\n\t\t\t\t\t\t\t\tplaylistTitle.textContent\t=\n\t\t\t\t\t\t\t\t\t\t\t\tconfig.playlistTitle\t||\t\"NOW\tPLAYING\";\n\t\t\t\t\t\t\t\tplaylistSub.textContent\t=\n\t\t\t\t\t\t\t\t\t\t\t\tconfig.playlistSub\t||\t\"${escapeHtmlJs(config.title)}\";\tif(config.thumbnail){\tcover.src\t=\tconfig.thumbnail;\t}\tif(config.background){\tbackground.style.backgroundImage\t=\n\t\t\t\t\t\t\t\t\"url('\"\t+\tconfig.background\t+\t\"')\";\n\t\t\t\t}\telse\tif\t(config.thumbnail)\t{\n\t\t\t\t\t\t\t\tbackground.style.backgroundImage\t=\n\t\t\t\t\t\t\t\t\t\t\t\t\"url('\"\t+\tconfig.thumbnail\t+\t\"')\";\n\t\t\t\t}\n\t\t\t\tvar\tvol\t=\n\t\t\t\t\t\t\t\ttypeof\tconfig.volume\t===\t\"number\"\t?\n\t\t\t\t\t\t\t\tconfig.volume\t:\n\t\t\t\t\t\t\t\t1;\tmusic.volume\t=\tvol;\tvolume.value\t=\tvol;\tmusic.loop\t=\tisRepeat;\tupdateLoopStatus();\tstartAudioStream(config);\n})();\t\n\n/*\t============================================================\n\t*\tSLEEP\tTIMER\t(0\t-\t90\tmenit,\tauto\tstop)\n\t*\t============================================================\t*/\nvar\tsleepEnd\t=\t0;\nvar\tsleepTimer\t=\tnull;\nvar\tsleepPrevRepeat\t=\tfalse;\n\nfunction\tsleepFormat(ms)\t{\n\tvar\ts\t=\tMath.max(0,\tMath.ceil(ms\t/\t1000));\n\tvar\tm\t=\tMath.floor(s\t/\t60);\n\tvar\tsec\t=\ts\t%\t60;\n\tif\t(sec\t<\t10)\tsec\t=\t\"0\"\t+\tsec;\n\treturn\tm\t+\t\":\"\t+\tsec;\n}\n\nfunction\tsleepApplyRepeat(on)\t{\n\tisRepeat\t=\ton;\n\tmusic.loop\t=\ton;\n\tif\t(repeatButton)\t{\n\t\trepeatButton.style.opacity\t=\ton\t?\t\"1\"\t:\t\".55\";\n\t\trepeatButton.title\t=\ton\t?\t\"Loop ON\"\t:\t\"Loop OFF\";\n\t}\n\tupdateLoopStatus();\n}\n\nfunction\tsleepRefreshLabel()\t{\n\tvar\tel\t=\tdocument.getElementById(\"sleepValue\");\n\tif\t(!el)\treturn;\n\tif\t(!sleepEnd)\t{\n\t\tel.textContent\t=\t\"Off\";\n\t\treturn;\n\t}\n\tel.textContent\t=\tsleepFormat(sleepEnd\t-\tDate.now());\n}\n\nfunction\tsleepStop()\t{\n\tif\t(sleepTimer)\t{\n\t\tclearInterval(sleepTimer);\n\t\tsleepTimer\t=\tnull;\n\t}\n\tsleepEnd\t=\t0;\n\tvar\tel\t=\tdocument.getElementById(\"sleepTime\");\n\tif\t(el)\tel.value\t=\t0;\n\tsleepApplyRepeat(sleepPrevRepeat);\n\tsleepRefreshLabel();\n}\n\nfunction\tsleepTick()\t{\n\tif\t(!sleepEnd)\treturn;\n\tif\t(sleepEnd\t<=\tDate.now())\t{\n\t\tmusic.pause();\n\t\tupdateUI();\n\t\tsleepStop();\n\t\treturn;\n\t}\n\tsleepRefreshLabel();\n}\n\nfunction\tsleepSet(minutes)\t{\n\tvar\tm\t=\tMath.round(Number(minutes));\n\tif\t(!m\t||\tm\t<=\t0)\t{\n\t\tsleepStop();\n\t\treturn;\n\t}\n\tif\t(m\t>\t90)\tm\t=\t90;\n\tif\t(!sleepEnd)\tsleepPrevRepeat\t=\tisRepeat;\n\tif\t(!isRepeat)\tsleepApplyRepeat(true);\n\tif\t(sleepTimer)\tclearInterval(sleepTimer);\n\tsleepEnd\t=\tDate.now()\t+\tm\t*\t60000;\n\tsleepTimer\t=\tsetInterval(sleepTick,\t500);\n\tsleepRefreshLabel();\n}\n\nfunction\tsleepSliderInput(el)\t{\n\tvar\tm\t=\tMath.round(Number(el.value));\n\tvar\tout\t=\tdocument.getElementById(\"sleepValue\");\n\tif\t(out)\tout.textContent\t=\tm\t>\t0\t?\t(m\t+\t\" min\")\t:\t\"Off\";\n}\n\nfunction\tsleepSliderChange(el)\t{\n\tvar\tm\t=\tMath.round(Number(el.value));\n\tif\t(m\t>\t0)\tsleepSet(m);\n\telse\tsleepStop();\n\tsleepRefreshLabel();\n}\n</script>`;

                    /*
                     * Kirim HTML player via AIRich messageBuilder.
                     * Teks bot disisipkan via addTip (section metadata teks
                     * di bawah player) — memakai API AIRich yang sudah ada.
                     */
                    await RyuuBotz.messageBuilder(m.chat)
                        .setType("AIRich")
                        .addHtml(htmlPayload)
                        .addTip(`${global.namabot} audio/video player interavtive`)
                        .send();
/* debug
                    const htmlbuffer = Buffer.from(htmlPayload, "utf8");

                    await RyuuBotz.sendMessage(m.chat, {
                        document: htmlbuffer,
                        mimetype: "text/plain",
                        fileName: "output.txt"
                    });*/

                    await RyuuBotz.sendMessage(m.chat, {
                        react: {
                            text: '✅',
                            key: m.key
                        }
                    });
}

export default {
    command: ["ytmp3"],
    group: false,
    premium: false,
    limit: true,
    admin: false,
    creator: false,
    botAdmin: false,
    privates: false,
    usePrefix: true,
    disable: false,
    code: async (m, {
        text,
        prefix,
        command,
        RyuuBotz,
        reply
    }) => {

        /*
         * Flag opsional --auto-play
         * Jika dipakai, plugin mengirim pesan HTML interaktif
         * (WebSocket Audio Player) — SAMA PERSIS dengan mode default
         * plugin ytplay — bukan lagi audio lampiran biasa.
         */
        const autoPlay =
            /(?:^|\s)--auto-play(?:\s|$)/i.test(text || "");

        const url = (text || "")
            .replace(/(?:^|\s)--auto-play(?=\s|$)/gi, '')
            .trim();

        if (!url) {
            return reply(`⚠️ *Format Salah!*\n\nContoh:\n*${prefix + command} https://youtu.be/xxxxx*\n*${prefix + command} https://youtu.be/xxxxx --auto-play*`);
        }
        if (!url.includes('youtu')) {
            return reply('⚠️ Link tidak valid! Masukkan link YouTube yang benar.');
        }

        await RyuuBotz.sendMessage(m.chat, {
            react: {
                text: '⏳',
                key: m.key
            }
        });

        if (m.mtype === "templateButtonReplyMessage") {
            await m.quoted.delete()
        } else if (m.quoted && (m.quoted.mtype === 'interactiveMessage' || m.quoted.mtype === 'templateButtonReplyMessage')) {
            try {
                await RyuuBotz.sendMessage(m.chat, {
                    delete: m.quoted.fakeObj.key
                });
            } catch (err) {
                console.error("❌ Gagal menghapus pesan quoted:", err);
            }
        };

        try {
            const apiUrl = `https://api.ryuu-dev.my.id/downloader/youtube?url=${encodeURIComponent(url)}&format=mp3`;

            const {
                data
            } = await axios.get(apiUrl, {
                timeout: 120000,
                headers: {
                    "x-ryuu-apikey": global.ryuukey
                }
            });

            if (!data.success || !data.result || !data.result.status) {
                throw new Error('Gagal mendapatkan respon dari API.');
            }

            const resData = data.result.result;
            const mp3Url = resData.link;

            if (!mp3Url) throw new Error('Link audio tidak ditemukan.');

            /*
             * MODE --auto-play
             * Pesan HTML interaktif + WebSocket audio (sama persis ytplay).
             */
            if (autoPlay) {
                await sendWebsocketAudioPlayerHtml({
                    m,
                    RyuuBotz,
                    link: url,
                    title: resData.title || "",
                    channel: resData.channel || "",
                    duration: resData.duration || "",
                    imageUrl: resData.thumbnail || null,
                    apiData: data
                });

                return;
            }

            const audioRes = await axios.get(mp3Url, {
                responseType: 'arraybuffer'
            });

            const audioBuffer = Buffer.from(audioRes.data);
            const title = resData.title || 'YouTube Audio';
            const thumbnail = resData.thumbnail || global.thumbnail.main;
            const duration = resData.duration || 'Unknown';
            const channel = resData.channel || 'Unknown';

            await RyuuBotz.sendMessage(m.chat, {
                text: " ",
                contextInfo: {
                    previewThumbnail: {
                        title: title,
                        description: "Duration: " + duration + " | Channel: " + channel,
                        thumbnail: {
                            url: thumbnail
                        },
                        sourceUrl: url,
                        largerThumbnail: true
                    }
                }
            }, {
                quoted: m
            });

            await RyuuBotz.sendMessage(m.chat, {
                audio: audioBuffer,
                mimetype: "audio/mpeg"
            }, {
                quoted: m
            });

            await RyuuBotz.sendMessage(m.chat, {
                react: {
                    text: '✅',
                    key: m.key
                }
            });

        } catch (err) {
            console.error('YTMP3 Error:', err);
            await RyuuBotz.sendMessage(m.chat, {
                react: {
                    text: '❌',
                    key: m.key
                }
            });
            reply(`❌ Gagal mengambil audio.\n\n${err.message}`);
        }
    }
};
