/**
 * Do not remove this watermark.
 *
 * NIXCODE - Advanced WhatsApp Interactive Message Builder
 * Built for creating buttons, carousels, native flows,
 * and AI rich response payloads using Baileys with
 * fluent chaining, flexible payload customization,
 * and scalable architecture for modern bot development.
 *
 * Runtime:
 * - Baileys: @whiskeysockets/baileys (latest)
 *
 * Created by Nixel
 * Contributors: 
 * - ~ Ahmad tumbuh kembang
 * - RyuuReinzz (Added "messageBuilder" wrapper, "extendSocketsBotz", Owner of @ryuu-reinzz/baileys)
 *
 * WhatsApp: wa.me/6282139672290
 * Channel: https://whatsapp.com/channel/0029VbCV1ck8fewpdNb2TY2k
 *
 * Owner WhatsApp: wa.me/6288246552068 RyuuReinzz
 *
 * Note:
 * This project is being sold because it has been 
 * modified and has been added to 
 * many other things that make it more valuable.
 *
 * Copyright (c) 2026 Nixel
 * Copyright (c) 2026 RyuuReinzz
 *
 * Permission is granted to use and modify this library
 * for personal or commercial projects.
 *
 * Reuploading, reselling, relicensing, or redistributing
 * this library as a standalone product is prohibited.
 *
 * Do not claim this project as your own original work.
 */

import {
    Readable
} from "stream";
import {
    proto,
    generateWAMessageFromContent,
    jidDecode,
    downloadContentFromMessage,
    prepareWAMessageMedia,
    generateMessageID
} from "@ryuu-reinzz/baileys";
import fetch from "node-fetch";
import fs from "fs";
import path from "path";
import {
    fileTypeFromBuffer
} from "file-type";
import crypto from 'crypto';
import {
    parsePhoneNumber
} from 'libphonenumber-js'
import sharp from "sharp";
import axios from "axios";
import {
    imageToWebp,
    videoToWebp,
    writeExifImg,
    writeExifVid,
    exifAvatar
} from "../lib/exif.js";
import {
    getBuffer,
    getSizeMedia
} from "../lib/myfunc.js";
import {
    fileURLToPath
} from 'url';
import {
    dirname
} from 'path';
let __filename = fileURLToPath(import.meta.url);
let __dirname = dirname(__filename);
const VERSION = '4.5';

function extractIE(text, {
    extract = true,
    hyperlink = true,
    citation = true,
    latex = true
} = {}) {
    if (!extract) {
        return {
            text,
            ie: [],
        };
    }
    let ie = [],
        result = '',
        last = 0,
        citation_index = 1,
        hyperlink_index = 0,
        latex_index = 0,
        stack = [];
    for (let i = 0; i < text.length; i++) {
        if (text[i] == '[' && text[i - 1] != '\\') {
            stack.push(i);
        } else if (text[i] == ']' && (text[i + 1] == '(' || text[i + 1] == '<')) {
            let start = stack.pop();
            if (start == null) continue;
            let open = text[i + 1],
                close = open == '(' ? ')' : '>',
                type = open == '(' ? 'link' : 'latex',
                end = i + 2,
                depth = 1;
            while (end < text.length && depth) {
                if (text[end] == open && text[end - 1] != '\\') depth++;
                else if (text[end] == close && text[end - 1] != '\\') depth--;
                end++;
            }
            if (depth) continue;
            let raw = text.slice(start + 1, i).trim(),
                url = text.slice(i + 2, end - 1).trim(),
                key,
                tag,
                data;
            if (type == 'latex') {
                if (!latex) continue;
                let [txt = '', width = null, height = null, font_height = null, padding = null] = raw.split('|');
                key = `\u004E\u0049\u0058\u0045\u004C_LATEX_${latex_index++}`;
                tag = `{{${key}}}${txt || 'image'}{{/${key}}}`;
                data = {
                    type: 'latex',
                    ie: {
                        key,
                        text: txt,
                        url,
                        width,
                        height,
                        font_height,
                        padding,
                    },
                };
            } else if (raw) {
                if (!hyperlink) continue;
                key = `\u004E\u0049\u0058\u0045\u004C_HYPERLINK_${hyperlink_index++}`;
                tag = `{{${key}}}${url}{{/${key}}}`;
                data = {
                    type: 'hyperlink',
                    ie: {
                        key,
                        text: raw,
                        url,
                    },
                };
            } else {
                if (!citation) continue;
                key = `\u004E\u0049\u0058\u0045\u004C_CITATION_${citation_index - 1}`;
                tag = `{{${key}}}${url}{{/${key}}}`;
                data = {
                    type: 'citation',
                    ie: {
                        reference_id: citation_index++,
                        key,
                        text: '',
                        url,
                    },
                };
            }
            result += text.slice(last, start) + tag;
            last = end;
            ie.push(data);
            i = end - 1;
        }
    }
    result += text.slice(last);
    return {
        text: result,
        ie,
    };
}

class BaseBuilder {
    constructor() {
        this._title = '';
        this._subtitle = '';
        this._body = '';
        this._footer = '';
        this._contextInfo = {};
        this._extraPayload = {};
    }

    setTitle(title) {
        if (typeof title !== 'string') {
            throw new TypeError('Title must be a string');
        }
        this._title = title;
        return this;
    }

    setSubtitle(subtitle) {
        if (typeof subtitle !== 'string') {
            throw new TypeError('Subtitle must be a string');
        }
        this._subtitle = subtitle;
        return this;
    }

    setBody(body) {
        if (typeof body !== 'string') {
            throw new TypeError('Body must be a string');
        }
        this._body = body;
        return this;
    }

    setFooter(footer) {
        if (typeof footer !== 'string') {
            throw new TypeError('Footer must be a string');
        }
        this._footer = footer;
        return this;
    }

    setContextInfo(obj) {
        if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) {
            throw new TypeError('ContextInfo must be a plain object');
        }

        this._contextInfo = obj;
        return this;
    }

    addPayload(obj) {
        if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) {
            throw new TypeError('Payload must be a plain object');
        }

        Object.assign(this._extraPayload, obj);

        return this;
    }

    static async resize(buffer, x, y, fit = 'cover') {
        return await sharp(buffer)
            .resize(x, y, {
                fit,
                position: 'center',
                background: {
                    r: 0,
                    g: 0,
                    b: 0,
                    alpha: 0
                },
            })
            .png()
            .toBuffer();
    }

    static async fetchBuffer(url, options = {}, config = {}) {
        try {
            let response = await fetch(url, options);
            if (!response.ok) throw Error(`HTTP ${response.status}`);
            return Buffer.from(await response.arrayBuffer());
        } catch (error) {
            if (config.silent) return Buffer.alloc(0);
            throw error;
        }
    }
}

class Button extends BaseBuilder {
    #client;

    constructor(client) {
        super();
        if (!client) {
            throw new Error('Socket is required');
        }
        this.#client = client;

        this._buttons = [];
        this._data;
        this._currentSelectionIndex = -1;
        this._currentSectionIndex = -1;
        this._params = {};
    }

    setVideo(path, options = {}) {
        if (!path) throw new Error('Url or buffer needed');
        Buffer.isBuffer(path) ? (this._data = {
            video: path,
            ...options
        }) : (this._data = {
            video: {
                url: path
            },
            ...options
        });
        return this;
    }

    setImage(path, options = {}) {
        if (!path) throw new Error('Url or buffer needed');
        Buffer.isBuffer(path) ? (this._data = {
            image: path,
            ...options
        }) : (this._data = {
            image: {
                url: path
            },
            ...options
        });
        return this;
    }

    setDocument(path, options = {}) {
        if (!path) throw new Error('Url or buffer needed');
        Buffer.isBuffer(path) ? (this._data = {
            document: path,
            ...options
        }) : (this._data = {
            document: {
                url: path
            },
            ...options
        });
        return this;
    }

    setMedia(obj) {
        if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) {
            throw new TypeError('Media must be a plain object');
        }

        this._data = obj;
        return this;
    }

    clearButtons() {
        this._buttons = [];
        return this;
    }

    setParams(obj) {
        this._params = obj;
        return this;
    }

    addButton(name, params) {
        this._buttons.push({
            name,
            buttonParamsJson: typeof params === 'string' ? params : JSON.stringify(params),
        });

        return this;
    }

    makeRow(header = '', title = '', description = '', id = '') {
        if (this._currentSelectionIndex === -1 || this._currentSectionIndex === -1) {
            throw new Error('You need to create a selection and a section first');
        }
        const buttonParams = JSON.parse(this._buttons[this._currentSelectionIndex].buttonParamsJson);
        buttonParams.sections[this._currentSectionIndex].rows.push({
            header,
            title,
            description,
            id
        });
        this._buttons[this._currentSelectionIndex].buttonParamsJson = JSON.stringify(buttonParams);
        return this;
    }

    makeSection(title = '', highlight_label = '') {
        if (this._currentSelectionIndex === -1) {
            throw new Error('You need to create a selection first');
        }
        const buttonParams = JSON.parse(this._buttons[this._currentSelectionIndex].buttonParamsJson);
        buttonParams.sections.push({
            title,
            highlight_label,
            rows: []
        });
        this._currentSectionIndex = buttonParams.sections.length - 1;
        this._buttons[this._currentSelectionIndex].buttonParamsJson = JSON.stringify(buttonParams);
        return this;
    }

    addSelection(title, options = {}) {
        this._buttons.push({
            ...options,
            name: 'single_select',
            buttonParamsJson: JSON.stringify({
                title,
                sections: []
            })
        });
        this._currentSelectionIndex = this._buttons.length - 1;
        this._currentSectionIndex = -1;
        return this;
    }

    addReply(display_text = '', id = '', options = {}) {
        this._buttons.push({
            name: 'quick_reply',
            buttonParamsJson: JSON.stringify({
                display_text,
                id,
                ...options,
            }),
        });
        return this;
    }

    addCall(display_text = '', id = '', options = {}) {
        this._buttons.push({
            name: 'cta_call',
            buttonParamsJson: JSON.stringify({
                display_text,
                id,
                ...options,
            }),
        });
        return this;
    }

    addReminder(display_text = '', id = '', options = {}) {
        this._buttons.push({
            name: 'cta_reminder',
            buttonParamsJson: JSON.stringify({
                display_text,
                id,
                ...options,
            }),
        });
        return this;
    }

    addCancelReminder(display_text = '', id = '', options = {}) {
        this._buttons.push({
            name: 'cta_cancel_reminder',
            buttonParamsJson: JSON.stringify({
                display_text,
                id,
                ...options,
            }),
        });
        return this;
    }

    addAddress(display_text = '', id = '', options = {}) {
        this._buttons.push({
            name: 'address_message',
            buttonParamsJson: JSON.stringify({
                display_text,
                id,
                ...options,
            }),
        });
        return this;
    }

    addLocation(options = {}) {
        this._buttons.push({
            name: 'send_location',
            buttonParamsJson: JSON.stringify(options),
        });
        return this;
    }

    addUrl(display_text = '', url = '', webview_interaction = false, options = {}) {
        this._buttons.push({
            ...options,
            name: 'cta_url',
            buttonParamsJson: JSON.stringify({
                display_text,
                url,
                webview_interaction,
                ...options,
            }),
        });
        return this;
    }

    addCopy(display_text = '', copy_code = '', options = {}) {
        this._buttons.push({
            name: 'cta_copy',
            buttonParamsJson: JSON.stringify({
                display_text,
                copy_code,
                ...options,
            }),
        });
        return this;
    }

    static paramsList = {
        limited_time_offer: {
            text: 'string',
            url: 'string',
            copy_code: 'string',
            expiration_time: 'number',
        },
        bottom_sheet: {
            in_thread_buttons_limit: 'number',
            divider_indices: ['number'],
            list_title: 'string',
            button_title: 'string',
        },
        tap_target_configuration: {
            title: 'string',
            description: 'string',
            canonical_url: 'string',
            domain: 'string',
            buttonIndex: 'number',
        },
    };

    async toCard() {
        return {
            body: {
                text: this._body,
            },
            footer: {
                text: this._footer,
            },
            header: {
                title: this._title,
                subtitle: this._subtitle,
                hasMediaAttachment: !!this._data,
                ...(this._data ?
                    await prepareWAMessageMedia(this._data, {
                        upload: this.#client.waUploadToServer
                    }).catch((e) => {
                        if (String(e).includes('Invalid media type')) return this._data;
                        throw e;
                    }) : {}),
            },
            nativeFlowMessage: {
                messageParamsJson: JSON.stringify(this._params),
                buttons: this._buttons,
            },
        };
    }

    async build(jid, {
        ...options
    } = {}) {
        const message = await this.toCard();

        return generateWAMessageFromContent(
            jid, {
                ...this._extraPayload,
                interactiveMessage: {
                    ...message,
                    contextInfo: this._contextInfo,
                },
            }, {
                ...options
            }
        );
    }

    async send(jid, {
        ...options
    } = {}) {
        const msg = await this.build(jid, options);

        await this.#client.relayMessage(msg.key.remoteJid, msg.message, {
            messageId: msg.key.id,
            additionalNodes: [{
                tag: 'biz',
                attrs: {},
                content: [{
                    tag: 'interactive',
                    attrs: {
                        type: 'native_flow',
                        v: '1'
                    },
                    content: [{
                        tag: 'native_flow',
                        attrs: {
                            v: '9',
                            name: 'mixed'
                        }
                    }],
                }, ],
            }, ],
            ...options,
        });
        return msg;
    }
}

class ButtonV2 extends BaseBuilder {
    #client;

    constructor(client) {
        super();
        if (!client) {
            throw new Error('Socket is required');
        }

        this.#client = client;
        this._image;
        this._data;
        this._buttons = [];
    }

    addButton(displayText = '', buttonId = crypto.randomUUID()) {
        this._buttons.push({
            buttonId,
            buttonText: {
                displayText
            },
            type: 1,
        });
        return this;
    }

    addRawButton(obj) {
        if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) {
            throw new TypeError('Buttons must be a plain object');
        }

        this._buttons.push(obj);
        return this;
    }

    setThumbnail(path) {
        if (!path) throw new Error('Url or buffer needed');
        this._image = path;
        return this;
    }

    setMedia(obj) {
        if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) {
            throw new TypeError('Media must be a plain object');
        }

        this._data = obj;
        return this;
    }

    async build(jid, {
        ...options
    } = {}) {
        let _thumbnail = this._image ? await BaseBuilder.resize(Buffer.isBuffer(this._image) ? this._image : await BaseBuilder.fetchBuffer(this._image, {}, {
            silent: true
        }), 300, 300) : null;
        const msg = generateWAMessageFromContent(
            jid, {
                ...this._extraPayload,
                buttonsMessage: {
                    contentText: this._body,
                    footerText: this._footer,
                    ...(this._data ?
                        this._data : {
                            headerType: 6,
                            locationMessage: {
                                degreesLatitude: 0,
                                degreesLongitude: 0,
                                name: this._title,
                                address: this._subtitle,
                                jpegThumbnail: _thumbnail,
                            },
                        }),
                    viewOnce: true,
                    contextInfo: this._contextInfo,
                    buttons: [...this._buttons],
                },
            }, {
                ...options
            }
        );
        return msg;
    }

    async send(jid, {
        ...options
    } = {}) {
        if (this._buttons.length < 1) throw new Error('ButtonV2 requires at least one button');
        const msg = await this.build(jid, options);

        await this.#client.relayMessage(msg.key.remoteJid, msg.message, {
            messageId: msg.key.id,
            additionalNodes: [{
                tag: 'biz',
                attrs: {},
                content: [{
                    tag: 'interactive',
                    attrs: {
                        type: 'native_flow',
                        v: '1'
                    },
                    content: [{
                        tag: 'native_flow',
                        attrs: {
                            v: '9',
                            name: 'mixed'
                        }
                    }],
                }, ],
            }, ],
            ...options,
        });
        return msg;
    }
}

class Carousel extends BaseBuilder {
    #client;

    constructor(client) {
        super();
        if (!client) {
            throw new Error('Socket is required');
        }

        this.#client = client;
        this._cards = [];
    }

    addCard(card) {
        const cards = Array.isArray(card) ? card : [card];
        const baseIndex = this._cards.length;

        for (const [index, c] of cards.entries()) {
            if (!c?.header?.hasMediaAttachment) {
                throw new Error(`Card [${baseIndex + index}] must include an image or video in header`);
            }
        }

        this._cards.push(...cards);
        return this;
    }

    build(jid, {
        ...options
    } = {}) {
        return generateWAMessageFromContent(
            jid, {
                ...this._extraPayload,
                interactiveMessage: {
                    header: {
                        hasMediaAttachment: false,
                    },
                    body: {
                        text: this._body
                    },
                    footer: {
                        text: this._footer
                    },
                    contextInfo: this._contextInfo,
                    carouselMessage: {
                        cards: this._cards,
                    },
                },
            }, {
                ...options
            }
        );
    }

    async send(jid, {
        ...options
    } = {}) {
        const msg = this.build(jid, options);

        await this.#client.relayMessage(msg.key.remoteJid, msg.message, {
            messageId: msg.key.id,
            additionalNodes: [{
                tag: 'biz',
                attrs: {},
                content: [{
                    tag: 'interactive',
                    attrs: {
                        type: 'native_flow',
                        v: '1'
                    },
                    content: [{
                        tag: 'native_flow',
                        attrs: {
                            v: '9',
                            name: 'mixed'
                        }
                    }],
                }, ],
            }, ],
            ...options,
        });
        return msg;
    }
}

class AIRich extends BaseBuilder {
    #client;

    constructor(client) {
        if (!client) {
            throw new Error('Socket is required');
        }

        super();
        this.#client = client;
        this._contextInfo = {};
        this._submessages = [];
        this._sections = [];
        this._richResponseSources = [];
        this._htmlPayloads = [];
    }

    static newLayout(name, data) {
        return {
            view_model: {
                [Array.isArray(data) ? 'primitives' : 'primitive']: data,
                __typename: `GenAI${name}LayoutViewModel`,
            },
        };
    }

    addSubmessage(submessage) {
        const items = Array.isArray(submessage) ? submessage : [submessage];

        for (const item of items) {
            if (typeof item !== 'object' || item === null || Array.isArray(item)) {
                throw new TypeError('Submessage must be a plain object or array of plain objects');
            }

            this._submessages.push(item);
        }

        return this;
    }

    addSection(section) {
        const items = Array.isArray(section) ? section : [section];

        for (const item of items) {
            if (typeof item !== 'object' || item === null || Array.isArray(item)) {
                throw new TypeError('Section must be a plain object or array of plain objects');
            }

            this._sections.push(item);
        }

        return this;
    }

    addText(text, {
        hyperlink = true,
        citation = true,
        latex = true
    } = {}) {
        if (typeof text != 'string') {
            throw new TypeError('Text must be a string');
        }

        const extractedIE = extractIE(text, {
            hyperlink,
            citation,
            latex,
        });

        const inline_entities = extractedIE.ie.map(({
            type,
            ie
        }) => {
            if (type == 'hyperlink') {
                return {
                    key: ie.key,
                    metadata: {
                        display_name: ie.text,
                        is_trusted: true,
                        url: ie.url,
                        __typename: 'GenAIInlineLinkItem',
                    },
                };
            }
            if (type == 'citation') {
                return {
                    key: ie.key,
                    metadata: {
                        reference_id: ie.reference_id,
                        reference_url: ie.url,
                        reference_title: ie.url,
                        reference_display_name: ie.url,
                        sources: [],
                        __typename: 'GenAISearchCitationItem',
                    },
                };
            }
            if (type == 'latex') {
                return {
                    key: ie.key,
                    metadata: {
                        latex_expression: ie.text,
                        latex_image: {
                            url: ie.url,
                            width: Number(ie.width) || 100,
                            height: Number(ie.height) || 100,
                        },
                        font_height: Number(ie.font_height) || 83.333333333333,
                        padding: Number(ie.padding) || 15,
                        __typename: 'GenAILatexItem',
                    },
                };
            }

            return {
                key: ie.key,
                metadata: {
                    latex_expression: ie.text,
                    latex_image: {
                        url: ie.url,
                        width,
                        height,
                    },
                    font_height: Number(ie.font_height) || 83.333333333333,
                    padding: Number(ie.padding) || 15,
                    __typename: 'GenAILatexItem',
                },
            };
        });

        this._submessages.push({
            messageType: 2,
            messageText: extractedIE.text,
        });

        this._sections.push(
            AIRich.newLayout('Single', {
                text: extractedIE.text,
                ...(inline_entities.length && {
                    inline_entities,
                }),
                __typename: 'GenAIMarkdownTextUXPrimitive',
            })
        );

        return this;
    }

    addCode(language, code) {
        if (typeof language !== 'string' || typeof code !== 'string') {
            throw new TypeError('Language and code must be a string');
        }

        const meta = AIRich.tokenizer(code, language);

        this._submessages.push({
            messageType: 5,
            codeMetadata: {
                codeLanguage: language,
                codeBlocks: meta.codeBlock,
            },
        });

        this._sections.push(
            AIRich.newLayout('Single', {
                language,
                code_blocks: meta.unified_codeBlock,
                __typename: 'GenAICodeUXPrimitive',
            })
        );

        return this;
    }

    addTable(table) {
        if (!Array.isArray(table)) {
            throw new TypeError('Table must be an array');
        }

        const meta = AIRich.toTableMetadata(table);

        this._submessages.push({
            messageType: 4,
            tableMetadata: {
                title: meta.title,
                rows: meta.rows,
            },
        });

        this._sections.push(
            AIRich.newLayout('Single', {
                rows: meta.unified_rows,
                __typename: 'GenATableUXPrimitive',
            })
        );

        return this;
    }


    addSource(sources = []) {
        if (!(Array.isArray(sources) && (sources.every((item) => typeof item === 'string') || sources.every((item) => Array.isArray(item) && item.every((v) => typeof v === 'string'))))) {
            throw new TypeError('Sources must be a string array or an array of string arrays');
        }

        if (sources.every((item) => typeof item === 'string')) {
            sources = [sources];
        }

        const source = sources.map(([profile_url, url, text]) => ({
            source_type: 'THIRD_PARTY',
            source_display_name: text ?? '',
            source_subtitle: 'AI',
            source_url: url ?? '',
            favicon: {
                url: profile_url ?? '',
                mime_type: 'image/jpeg',
                width: 16,
                height: 16,
            },
        }));

        this._sections.push(
            AIRich.newLayout('Single', {
                sources: source,
                __typename: 'GenAISearchResultPrimitive',
            })
        );

        return this;
    }

    /**
     * Sisipkan payload HTML (contoh: HTML player interaktif) ke dalam
     * AIRich response. Identik dengan primitive "FOAHtmlPrimitiveDemoDONOTUSE"
     * yang dipakai plugin ytplay/ytmp3/ytmp4/dino/akinator, sehingga pesan
     * yang dihasilkan dapat dirender sama persis oleh WhatsApp.
     *
     * Contoh:
     *   await socket.messageBuilder(m.chat)
     *       .setType("AIRich")
     *       .addHtml(htmlString)
     *       .send();
     *
     * Jika hanya addHtml() yang dipakai (tanpa addText/addCode/dll),
     * pesan dikirim dalam bentuk html-only yang 100% sama dengan
     * struktur yang dipakai plugin-plugin tersebut.
     */
    addHtml(html, options = {}) {
        if (typeof html !== 'string' || !html.trim()) {
            throw new TypeError('HTML payload must be a non-empty string');
        }

        const items = Array.isArray(html) ? html : [html];
        for (const item of items) {
            this._htmlPayloads.push({
                payload: String(item),
                trusted_sources: Array.isArray(options.trustedSources) ? options.trustedSources : [],
            });
        }

        return this;
    }

    addReels(reelsItems = []) {
        if (
            !(
                (reelsItems && typeof reelsItems === 'object' && !Array.isArray(reelsItems)) ||
                (Array.isArray(reelsItems) && reelsItems.every((item) => item && typeof item === 'object' && !Array.isArray(item)))
            )
        ) {
            throw new TypeError('Reels items must be an object or an array of objects');
        }

        if (!Array.isArray(reelsItems)) {
            reelsItems = [reelsItems];
        }

        this._submessages.push({
            messageType: 9,
            contentItemsMetadata: {
                contentType: 1,
                itemsMetadata: reelsItems.map((item) => ({
                    reelItem: {
                        title: item.username ?? '',
                        profileIconUrl: item.profileIconUrl ?? item.profile_url ?? '',
                        thumbnailUrl: item.thumbnailUrl ?? item.thumbnail ?? '',
                        videoUrl: item.videoUrl ?? item.url ?? '',
                    },
                })),
            },
        });

        reelsItems.forEach((item, idx) => {
            this._richResponseSources.push({
                provider: '\u004E\u0049\u0058\u0045\u004C',
                thumbnailCDNURL: item.thumbnailUrl ?? item.thumbnail ?? '',
                sourceProviderURL: item.videoUrl ?? item.url ?? '',
                sourceQuery: '',
                faviconCDNURL: item.profileIconUrl ?? item.profile_url ?? '',
                citationNumber: idx + 1,
                sourceTitle: item.username ?? '',
            });
        });

        this._sections.push(
            AIRich.newLayout(
                'HScroll',
                reelsItems.map((item) => ({
                    reels_url: item.videoUrl ?? item.url ?? '',
                    thumbnail_url: item.thumbnailUrl ?? item.thumbnail ?? '',
                    creator: item.username ?? item.title ?? '',
                    avatar_url: item.profileIconUrl ?? item.profile_url ?? '',
                    reels_title: item.reels_title ?? item.title ?? '',
                    likes_count: item.likes_count ?? item.like ?? 0,
                    shares_count: item.shares_count ?? item.share ?? 0,
                    view_count: item.view_count ?? item.view ?? 0,
                    reel_source: item.reel_source ?? item.source ?? 'IG',
                    is_verified: !!(item.is_verified || item.verified),
                    __typename: 'GenAIReelPrimitive',
                }))
            )
        );

        return this;
    }

    addImage(imageUrl) {
        if (!(typeof imageUrl === 'string' || (Array.isArray(imageUrl) && imageUrl.every((v) => typeof v === 'string')))) {
            throw new TypeError('imageUrl must be a string or array of strings');
        }
        const imageUrls = Array.isArray(imageUrl) ?
            imageUrl.map((url) => ({
                imagePreviewUrl: url,
                imageHighResUrl: url,
                sourceUrl: String.fromCharCode(104, 116, 116, 112, 115, 58, 47, 47, 102, 105, 111, 114, 97, 46, 110, 105, 120, 101, 108, 46, 109, 121, 46, 105, 100, 47),
            })) : [{
                imagePreviewUrl: imageUrl,
                imageHighResUrl: imageUrl,
                sourceUrl: String.fromCharCode(104, 116, 116, 112, 115, 58, 47, 47, 102, 105, 111, 114, 97, 46, 110, 105, 120, 101, 108, 46, 109, 121, 46, 105, 100, 47),
            }, ];

        this._submessages.push({
            messageType: 1,
            gridImageMetadata: {
                gridImageUrl: {
                    imagePreviewUrl: Array.isArray(imageUrl) ? imageUrl[0] : imageUrl,
                },
                imageUrls,
            },
        });

        imageUrls.forEach(({
            imagePreviewUrl
        }) => {
            this._sections.push(
                AIRich.newLayout('Single', {
                    media: {
                        url: imagePreviewUrl,
                        mime_type: 'image/png',
                    },
                    imagine_type: 'IMAGE',
                    status: {
                        status: 'READY',
                    },
                    __typename: 'GenAIImaginePrimitive',
                })
            );
        });

        return this;
    }

    addVideo(videoUrl) {
        if (!(typeof videoUrl === 'string' || (Array.isArray(videoUrl) && videoUrl.every((v) => typeof v === 'string')))) {
            throw new TypeError('videoUrl must be a string or array of strings');
        }

        const videoUrls = (Array.isArray(videoUrl) ? videoUrl : [videoUrl]).map((item) => {
            const [url, duration = 0] = item.split('|');

            return {
                videoPreviewUrl: url,
                videoHighResUrl: url,
                duration: Number(duration) || 0,
                sourceUrl: String.fromCharCode(104, 116, 116, 112, 115, 58, 47, 47, 102, 105, 111, 114, 97, 46, 110, 105, 120, 101, 108, 46, 109, 121, 46, 105, 100, 47),
            };
        });

        this._submessages.push({
            messageType: 2,
            messageText: '[ CANNOT_LOAD_VIDEO - \u0052\u0059\u0055\u0055 ]',
        });

        videoUrls.forEach(({
            videoPreviewUrl,
            duration = 0
        }) => {
            this._sections.push(
                AIRich.newLayout('Single', {
                    media: {
                        url: videoPreviewUrl,
                        mime_type: 'video/mp4',
                        duration,
                    },
                    imagine_type: 'ANIMATE',
                    status: {
                        status: 'READY',
                    },
                    __typename: 'GenAIImaginePrimitive',
                })
            );
        });

        return this;
    }

    addProduct(data = {}) {
        if (!((data && typeof data === 'object' && !Array.isArray(data)) || (Array.isArray(data) && data.every((item) => item && typeof item === 'object' && !Array.isArray(item))))) {
            throw new TypeError('Product items must be an object or an array of objects');
        }

        this._submessages.push({
            messageType: 2,
            messageText: '[ CANNOT_LOAD_PRODUCT - \u0052\u0059\u0055\u0055 ]',
        });

        const items = Array.isArray(data) ? data : [data];

        const product = items.map((item) => ({
            title: item.title,
            brand: item.brand,
            price: item.price,
            sale_price: item.sale_price,
            product_url: item.product_url ?? item.url,
            image: {
                url: item.image_url ?? item.image,
            },
            additional_images: [{
                url: item.icon_url ?? item.icon,
            }, ],
            __typename: 'GenAIProductItemCardPrimitive',
        }));

        this._sections.push(AIRich.newLayout(Array.isArray(data) ? 'HScroll' : 'Single', Array.isArray(data) ? product : product[0]));

        return this;
    }

    addPost(data = {}) {
        if (!((data && typeof data === 'object' && !Array.isArray(data)) || (Array.isArray(data) && data.every((item) => item && typeof item === 'object' && !Array.isArray(item))))) {
            throw new TypeError('Post items must be an object or an array of objects');
        }

        const posts = Array.isArray(data) ? data : [data];

        this._submessages.push({
            messageType: 2,
            messageText: '[ CANNOT_LOAD_POST - \u0052\u0059\u0055\u0055 ]',
        });

        const primitives = posts.map((p) => ({
            title: p.title ?? '',
            subtitle: p.subtitle ?? '',
            username: p.username ?? '',
            profile_picture_url: p.profile_picture_url ?? p.profile_url ?? '',
            is_verified: !!(p.is_verified || p.verified),
            thumbnail_url: p.thumbnail_url ?? p.thumbnail ?? '',
            post_caption: p.post_caption ?? p.caption ?? '',
            likes_count: p.likes_count ?? p.like ?? 0,
            comments_count: p.comments_count ?? p.comment ?? 0,
            shares_count: p.shares_count ?? p.share ?? 0,
            post_url: p.post_url ?? p.url ?? '',
            post_deeplink: p.post_deeplink ?? p.deeplink ?? '',
            source_app: p.source_app || p.source || 'INSTAGRAM',
            footer_label: p.footer_label ?? p.footer ?? '',
            footer_icon: p.footer_icon ?? p.icon ?? '',
            is_carousel: posts.length > 1,
            orientation: p.orientation ?? 'LANDSCAPE',
            post_type: p.post_type ?? 'VIDEO',
            __typename: 'GenAIPostPrimitive',
        }));

        this._sections.push(AIRich.newLayout('HScroll', primitives));

        return this;
    }

    addTip(text) {
        this._submessages.push({
            messageType: 2,
            messageText: text,
        });

        this._sections.push(
            AIRich.newLayout('Single', {
                text,
                __typename: 'GenAIMetadataTextPrimitive',
            })
        );

        return this;
    }

    addSuggest(suggestion) {
        if (!(typeof suggestion === 'string' || (Array.isArray(suggestion) && suggestion.every((v) => typeof v === 'string')))) {
            throw new TypeError('Suggestion must be a string or array of strings');
        }

        const suggest = Array.isArray(suggestion) ?
            suggestion.map((text) => ({
                prompt_text: text,
                prompt_type: 'SUGGESTED_PROMPT',
                __typename: 'GenAIFollowUpSuggestionPillPrimitive',
            })) : [{
                prompt_text: suggestion,
                prompt_type: 'SUGGESTED_PROMPT',
                __typename: 'GenAIFollowUpSuggestionPillPrimitive',
            }, ];

        this._sections.push(AIRich.newLayout('ActionRow', suggest));

        return this;
    }

    build({
        forwarded = true,
        includesUnifiedResponse = true,
        includesSubmessages = true,
        quoted,
        quotedParticipant,
        ...options
    } = {}) {
        /*
         * Mode HTML-only: persis meniru struktur pesan yang dipakai
         * plugin ytplay/ytmp3/ytmp4/dino/akinator supaya render WhatsApp
         * identik (primitive "FOAHtmlPrimitiveDemoDONOTUSE" di dalam
         * GenAISingleLayoutViewModel).
         */
        if (this._htmlPayloads.length && !this._sections.length && !this._submessages.length) {
            return {
                ...this._extraPayload,
                botForwardedMessage: {
                    message: {
                        richResponseMessage: {
                            messageType: 1,
                            unifiedResponse: {
                                data: Buffer.from(JSON.stringify({
                                    __typename: "GenAIUnifiedResponse",
                                    response_id: crypto.randomUUID(),
                                    sections: [{
                                        __typename: "GenAIUnifiedResponseSection",
                                        view_model: {
                                            __typename: "GenAISingleLayoutViewModel",
                                            primitive: {
                                                __typename: "FOAHtmlPrimitiveDemoDONOTUSE",
                                                trusted_sources: this._htmlPayloads[0].trusted_sources,
                                                payload: this._htmlPayloads[0].payload
                                            }
                                        }
                                    }]
                                })).toString("base64")
                            },
                            contextInfo: {
                                isForwarded: true,
                                forwardOrigin: 4
                            }
                        }
                    }
                }
            };
        }

        const forward = forwarded ? {
            forwardingScore: 1,
            isForwarded: true,
            forwardedAiBotMessageInfo: {
                botJid: '0@bot'
            },
            forwardOrigin: 4,
        } : {};

        const qObj = quoted ? {
            stanzaId: quoted?.key?.id || quoted?.id,
            participant: quotedParticipant || quoted?.key?.participant || quoted?.key?.remoteJid,
            quotedType: 0,
            quotedMessage: typeof quoted === 'object' && quoted !== null ? (quoted.message ?? quoted) : undefined,
        } : {};

        const htmlSections = this._htmlPayloads.map((htmlPayload) =>
            AIRich.newLayout('Single', {
                __typename: 'FOAHtmlPrimitiveDemoDONOTUSE',
                trusted_sources: htmlPayload.trusted_sources,
                payload: htmlPayload.payload,
            })
        );

        const sections = this._footer ? [
            ...this._sections,
            ...htmlSections,
            AIRich.newLayout('Single', {
                text: this._footer,
                __typename: 'GenAIMetadataTextPrimitive',
            }),
        ] : [...this._sections, ...htmlSections];

        return {
            messageContextInfo: {
                deviceListMetadata: {},
                deviceListMetadataVersion: 2,
                botMetadata: {
                    messageDisclaimerText: this._title,
                    richResponseSourcesMetadata: {
                        sources: this._richResponseSources
                    },
                },
            },
            ...this._extraPayload,
            botForwardedMessage: {
                message: {
                    richResponseMessage: {
                        messageType: 1,
                        submessages: includesSubmessages ? this._submessages : [],
                        unifiedResponse: {
                            data: includesUnifiedResponse ? Buffer.from(JSON.stringify({
                                response_id: crypto.randomUUID(),
                                sections
                            })).toString("base64") : ''
                        },
                        contextInfo: {
                            ...forward,
                            ...qObj,
                            ...this._contextInfo,
                        },
                    },
                },
            },
        };
    }

    async send(jid, {
        forwarded,
        includesUnifiedResponse,
        includesSubmessages,
        ...options
    } = {}) {            const isHtmlOnly = this._htmlPayloads.length && !this._sections.length && !this._submessages.length;
        const msg = this.build({
            forwarded,
            includesUnifiedResponse,
            includesSubmessages,
            ...options
        });

        /*
         * Mode html-only dikirim persis seperti plugin ytplay/ytmp3/ytmp4:
         * generateWAMessageFromContent dulu, lalu relay dengan messageId.
         */
        if (isHtmlOnly) {
            const waMsg = await generateWAMessageFromContent(jid, msg, {
                ...options
            });

            await this.#client.relayMessage(jid, waMsg.message, {
                messageId: waMsg.key.id,
                ...options,
            });
            return waMsg;
        }

        await this.#client.relayMessage(jid, msg, {
            ...options
        });
        return msg
    }

    static tokenizer(code, lang = 'javascript') {
        const keywordsMap = {
            javascript: new Set([
                'break',
                'case',
                'catch',
                'continue',
                'debugger',
                'delete',
                'do',
                'else',
                'finally',
                'for',
                'function',
                'if',
                'in',
                'instanceof',
                'new',
                'return',
                'switch',
                'this',
                'throw',
                'try',
                'typeof',
                'var',
                'void',
                'while',
                'with',
                'true',
                'false',
                'null',
                'undefined',
                'class',
                'const',
                'let',
                'super',
                'extends',
                'export',
                'import',
                'yield',
                'static',
                'constructor',
                'async',
                'await',
                'get',
                'set',
            ]),
        };

        const TYPE_MAP = {
            0: 'DEFAULT',
            1: 'KEYWORD',
            2: 'METHOD',
            3: 'STR',
            4: 'NUMBER',
            5: 'COMMENT',
        };

        const keywords = keywordsMap[lang] || new Set();
        const tokens = [];

        let i = 0;

        const push = (content, type) => {
            if (!content) return;
            const last = tokens[tokens.length - 1];
            if (last && last.highlightType === type) last.codeContent += content;
            else tokens.push({
                codeContent: content,
                highlightType: type
            });
        };

        while (i < code.length) {
            const c = code[i];

            if (/\s/.test(c)) {
                let s = i;
                while (i < code.length && /\s/.test(code[i])) i++;
                push(code.slice(s, i), 0);
                continue;
            }

            if (c === '/' && code[i + 1] === '/') {
                let s = i;
                i += 2;
                while (i < code.length && code[i] !== '\n') i++;
                push(code.slice(s, i), 5);
                continue;
            }

            if (c === '"' || c === "'" || c === '`') {
                let s = i;
                const q = c;
                i++;
                while (i < code.length) {
                    if (code[i] === '\\' && i + 1 < code.length) i += 2;
                    else if (code[i] === q) {
                        i++;
                        break;
                    } else i++;
                }
                push(code.slice(s, i), 3);
                continue;
            }

            if (/[0-9]/.test(c)) {
                let s = i;
                while (i < code.length && /[0-9.]/.test(code[i])) i++;
                push(code.slice(s, i), 4);
                continue;
            }

            if (/[a-zA-Z_$]/.test(c)) {
                let s = i;
                while (i < code.length && /[a-zA-Z0-9_$]/.test(code[i])) i++;
                const word = code.slice(s, i);

                let type = 0;
                if (keywords.has(word)) type = 1;
                else {
                    let j = i;
                    while (j < code.length && /\s/.test(code[j])) j++;
                    if (code[j] === '(') type = 2;
                }

                push(word, type);
                continue;
            }

            push(c, 0);
            i++;
        }

        return {
            codeBlock: tokens,
            unified_codeBlock: tokens.map((t) => ({
                content: t.codeContent,
                type: TYPE_MAP[t.highlightType],
            })),
        };
    }

    static toTableMetadata(arr) {
        if (!Array.isArray(arr) || !arr.every((row) => Array.isArray(row) && row.every((cell) => typeof cell === 'string'))) {
            throw new TypeError('Table must be a nested array of strings');
        }

        const [header, ...rows] = arr;
        const maxLen = Math.max(header.length, ...rows.map((r) => r.length));
        const normalize = (r) => [...r, ...Array(maxLen - r.length).fill('')];

        const unified_rows = [{
                is_header: true,
                cells: normalize(header),
                markdown_cells: normalize(header).map(cell => ({
                    text: cell
                }))
            },
            ...rows.map((r) => {
                const normalizedRow = normalize(r);
                return {
                    is_header: false,
                    cells: normalizedRow,
                    markdown_cells: normalizedRow.map(cell => ({
                        text: cell
                    }))
                };
            }),
        ];

        const rowsMeta = unified_rows.map((r) => ({
            items: r.cells,
            ...(r.is_header ? {
                isHeading: true
            } : {}),
        }));

        return {
            title: '',
            rows: rowsMeta,
            unified_rows,
        };
    }
}

export {
    VERSION,
    Button,
    ButtonV2,
    Carousel,
    AIRich
};
export default function extendSocketBotz(socket, store, smsg) {
    let sendMessage = socket.sendMessage;
    Object.assign(socket, {
        messageBuilder: function(jid, options = {}) {
            let currentInstancePromise = null;

            const handler = {
                get(target, propKey) {
                    if (propKey === 'then') return undefined;
                    if (propKey === 'setType') {
                        return function(type) {
                            currentInstancePromise = Promise.resolve().then(async () => {
                                if (type === 'Button') return new Button(socket);
                                if (type === 'ButtonV2') return new ButtonV2(socket);
                                if (type === 'Carousel') return new Carousel(socket);
                                if (type === 'AIRich') return new AIRich(socket);
                                if (type === 'html' || type === 'HTML') return new AIRich(socket);
                                if (type === 'tutorial') {
                                    const aiRich = new AIRich(socket);
                                    const fullText = await Buffer.from((await axios.get("https://raw.githubusercontent.com/reinzz556/haruka/refs/heads/main/readme.md", { responseType: "arraybuffer" })).data).toString()
                                    const codeBlockRegex = /```(\w*)\n([\s\S]*?)\n```/g;

                                    let lastIndex = 0;
                                    let match;

                                    while ((match = codeBlockRegex.exec(fullText)) !== null) {
                                        const textBefore = fullText.substring(lastIndex, match.index).trim();
                                        if (textBefore) {
                                            aiRich.addText(textBefore);
                                        }

                                        const language = match[1] || 'text';
                                        const codeContent = match[2];

                                        aiRich.addCode(language, codeContent);

                                        lastIndex = codeBlockRegex.lastIndex;
                                    }

                                    const remainingText = fullText.substring(lastIndex).trim();
                                    if (remainingText) {
                                        aiRich.addText(remainingText);
                                    }

        
                                    return aiRich;
                                }
                                throw new Error(`Type ${type} tidak dikenali. Jika belum tau cara penggunaannya, silahkan execute kode ini:\n\`\`\`js\nreturn await socket.messageBuilder(m.chat).setType("tutorial").send()\n\`\`\``);
                            });
                            return proxy;
                        };
                    }

                    if (propKey === 'send') {
                        return async function() {
                            if (!currentInstancePromise) {
                                throw new Error(`Kamu harus menentukan .setType() terlebih dahulu. Jika belum tau cara penggunaannya, silahkan execute kode ini:\n\`\`\`js\nreturn await socket.messageBuilder(m.chat).setType("tutorial").send()\n\`\`\``);
                            }
                            const instance = await currentInstancePromise;
                            return await instance.send(jid, options);
                        };
                    }                    return function(...args) {
                        if (!currentInstancePromise) {
                            throw new Error(`Kamu harus memanggil .setType() sebelum memanggil .${propKey}()\nJika belum tau cara penggunaannya, silahkan execute kode ini:\n\`\`\`js\nreturn await socket.messageBuilder(m.chat).setType("tutorial").send()\n\`\`\``);
                        }

                        currentInstancePromise = currentInstancePromise.then(async (instance) => {
                            if (typeof instance[propKey] !== 'function') {
                                const available = Object.getOwnPropertyNames(Object.getPrototypeOf(instance))
                                    .concat(Object.getPrototypeOf(Object.getPrototypeOf(instance))
                                        ? Object.getOwnPropertyNames(Object.getPrototypeOf(Object.getPrototypeOf(instance)))
                                        : [])
                                    .filter((n) => n !== 'constructor')
                                    .sort()
                                    .join(', ');
                                throw new TypeError(
                                    `Method .${propKey}() tidak ada di builder ini.\n` +
                                    `Method valid: ${available}\n` +
                                    `Jika .${propKey}() baru ditambahkan ke lib/socket.js tapi bot belum di-restart, ` +
                                    `restart bot dulu (plugin di-hot-reload, lib/socket.js TIDAK).`
                                );
                            }
                            const result = await instance[propKey](...args);
                            return (result && typeof result === 'object') ? result : instance;
                        });

                        return proxy;
                    };
                }
            };

            const proxy = new Proxy({}, handler);
            return proxy;
        },
        sendMessage: async (jid, content, options = {}) => {
            let {
                text,
                contextInfo = {}
            } = content;
            let {
                title,
                description,
                thumbnail,
                sourceUrl,
                largerThumbnail = false,
                favicon = false
            } = contextInfo?.previewThumbnail || {};
            let buffer;
            let favBuffer;
            try {
                if (!contextInfo?.previewThumbnail) return await sendMessage(jid, content, options);

                if (Buffer.isBuffer(thumbnail)) {
                    buffer = thumbnail;
                } else if (thumbnail.url) {
                    let response = await fetch(thumbnail.url);
                    if (!response.ok) throw new Error(`Gagal fetch thumbnail: ${response.statusText}`);
                    let arrayBuffer = await response.arrayBuffer();
                    buffer = Buffer.from(arrayBuffer);
                }
                if (Buffer.isBuffer(favicon)) {
                    favBuffer = favicon;
                } else if (favicon?.url) {
                    let response = await fetch(favicon.url);
                    if (!response.ok) throw new Error(`Gagal fetch favicon: ${response.statusText}`);
                    let arrayBuffer = await response.arrayBuffer();
                    favBuffer = Buffer.from(arrayBuffer);
                } else {
                    favicon = false
                }
                let miniPreview = (await sharp(buffer).resize(90, 90, {
                    fit: "cover",
                    position: "centre"
                }).jpeg({
                    quality: 80
                }).toBuffer()).toString("base64");

                let miniFavicon = favicon ? await sharp(favBuffer)
                    .resize(48, 48, {
                        fit: "cover",
                        position: "centre"
                    })
                    .jpeg({
                        quality: 80
                    })
                    .toBuffer() : undefined;
                let Thumbnail = await prepareWAMessageMedia({
                    image: buffer
                }, {
                    upload: socket.waUploadToServer,
                    mediaTypeOverride: "thumbnail-link"
                });
                let Favicon = favicon ? await prepareWAMessageMedia({
                    image: miniFavicon
                }, {
                    upload: socket.waUploadToServer,
                    mediaTypeOverride: "thumbnail-link"
                }) : undefined;
                let message = {
                    extendedTextMessage: {
                        text: sourceUrl + "\n\n" + text,
                        matchedText: sourceUrl,
                        description: description,
                        title: title,
                        previewType: 'NONE',
                        jpegThumbnail: miniPreview,
                        thumbnailDirectPath: largerThumbnail ? Thumbnail?.imageMessage?.directPath : undefined,
                        thumbnailSha256: largerThumbnail ? Thumbnail?.imageMessage?.fileSha256 : undefined,
                        thumbnailEncSha256: largerThumbnail ? Thumbnail?.imageMessage?.fileEncSha256 : undefined,
                        mediaKey: largerThumbnail ? Thumbnail?.imageMessage?.mediaKey : undefined,
                        mediaKeyTimestamp: Math.floor(Date.now() / 1000).toString(),
                        thumbnailHeight: largerThumbnail ? Thumbnail?.imageMessage?.height : undefined,
                        thumbnailWidth: largerThumbnail ? Thumbnail?.imageMessage?.width : undefined,
                        type: "thumbnail",
                        faviconMMSMetadata: {
                            thumbnailDirectPath: Favicon?.imageMessage?.directPath,
                            thumbnailSha256: Favicon?.imageMessage?.fileSha256,
                            thumbnailEncSha256: Favicon?.imageMessage?.fileEncSha256,
                            mediaKey: Favicon?.imageMessage?.mediaKey,
                            mediaKeyTimestamp: Math.floor(Date.now() / 1000).toString(),
                            thumbnailHeight: Favicon?.imageMessage?.height,
                            thumbnailWidth: Favicon?.imageMessage?.width
                        },
                        inviteLinkGroupTypeV2: 'DEFAULT',
                        contextInfo: {
                            ...contextInfo,
                            ...(options.quoted ? {
                                stanzaId: options.quoted.key.id,
                                participant: options.quoted.key.participant || options.quoted.key.remoteJid,
                                quotedMessage: options.quoted.message,
                                remoteJid: options.quoted.key.remoteJid
                            } : {})
                        }
                    }
                };


                await socket.relayMessage(jid, message, {});

                return message;
            } catch (err) {
                console.log(err)
            }
        },

        sendRichResponse: async (jid, data = {}, options = {}) => {
            let {
                randomUUID
            } = await import('crypto');
            let submessages = [];
            let sections = [];
            let sources = [];
            if (data.text) {
                submessages.push({
                    messageType: 2,
                    messageText: data.text
                });
                sections.push({
                    view_model: {
                        primitive: {
                            text: data.text,
                            __typename: "GenAIMarkdownTextUXPrimitive"
                        },
                        __typename: "GenAISingleLayoutViewModel"
                    }
                });
            }
            if (data.table) {
                let tableRows = [{
                        items: data.table.headers,
                        isHeading: true
                    },
                    ...data.table.rows.map(row => ({
                        items: row.map(String)
                    }))
                ];
                submessages.push({
                    messageType: 4,
                    tableMetadata: {
                        title: data.table.title || "Datos",
                        rows: tableRows
                    }
                });
            }
            if (data.code) {
                let tokenizer = (codeStr) => {
                    let tokens = [];
                    let i = 0;
                    let len = codeStr.length;
                    let keywords = ['break', 'case', 'catch', 'continue', 'debugger', 'default', 'delete', 'do', 'else', 'finally', 'for', 'function', 'if', 'in', 'instanceof', 'new', 'return', 'switch', 'this', 'throw', 'try', 'typeof', 'var', 'void', 'while', 'with', 'true', 'false', 'null', 'undefined', 'NaN', 'Infinity', 'class', 'let', 'let', 'super', 'extends', 'export', 'import', 'yield', 'static', 'constructor', 'of', 'async', 'await', 'get', 'set', 'implements', 'interface', 'package', 'private', 'protected', 'public', 'enum', 'throws', 'transient'];
                    while (i < len) {
                        if (/\s/.test(codeStr[i])) {
                            let start = i;
                            while (i < len && /\s/.test(codeStr[i])) i++;
                            tokens.push({
                                content: codeStr.slice(start, i),
                                type: 'DEFAULT'
                            });
                            continue;
                        }
                        if (codeStr[i] === '"' || codeStr[i] === "'") {
                            let start = i;
                            let quote = codeStr[i];
                            i++;
                            while (i < len && codeStr[i] !== quote) {
                                if (codeStr[i] === '\\') i++;
                                i++;
                            }
                            i++;
                            tokens.push({
                                content: codeStr.slice(start, i),
                                type: 'STR'
                            });
                            continue;
                        }
                        if (/[0-9]/.test(codeStr[i])) {
                            let start = i;
                            while (i < len && /[0-9.]/.test(codeStr[i])) i++;
                            tokens.push({
                                content: codeStr.slice(start, i),
                                type: 'NUMBER'
                            });
                            continue;
                        }
                        if (/[a-zA-Z_$]/.test(codeStr[i])) {
                            let start = i;
                            while (i < len && /[a-zA-Z0-9_$]/.test(codeStr[i])) i++;
                            let word = codeStr.slice(start, i);
                            if (keywords.includes(word)) {
                                tokens.push({
                                    content: word,
                                    type: 'KEYWORD'
                                });
                            } else {
                                let j = i;
                                while (j < len && /\s/.test(codeStr[j])) j++;
                                if (j < len && codeStr[j] === '(') {
                                    tokens.push({
                                        content: word,
                                        type: 'METHOD'
                                    });
                                } else {
                                    tokens.push({
                                        content: word,
                                        type: 'DEFAULT'
                                    });
                                }
                            }
                            continue;
                        }
                        tokens.push({
                            content: codeStr[i],
                            type: 'DEFAULT'
                        });
                        i++;
                    }
                    let merged = [];
                    for (let t of tokens) {
                        if (merged.length && merged[merged.length - 1].type === 'DEFAULT' && t.type === 'DEFAULT') {
                            merged[merged.length - 1].content += t.content;
                        } else {
                            merged.push(t);
                        }
                    }
                    return merged;
                };
                let rawTokens = tokenizer(data.code.code);
                let typeToHighlight = {
                    'DEFAULT': 0,
                    'KEYWORD': 1,
                    'METHOD': 2,
                    'STR': 3,
                    'NUMBER': 5
                };
                let protoBlocks = rawTokens.map(t => ({
                    codeContent: t.content,
                    highlightType: typeToHighlight[t.type] || 0
                }));
                submessages.push({
                    messageType: 5,
                    codeMetadata: {
                        codeLanguage: data.code.language || "javascript",
                        codeBlocks: protoBlocks
                    }
                });
                sections.push({
                    view_model: {
                        primitive: {
                            language: data.code.language || "javascript",
                            code_blocks: rawTokens,
                            __typename: "GenAICodeUXPrimitive"
                        },
                        __typename: "GenAISingleLayoutViewModel"
                    }
                });
            }
            if (data.reels && data.reels.length > 0) {

                let uploadedReels = [];

                for (let item of data.reels) {

                    let videoMedia = await prepareWAMessageMedia({
                        video: {
                            url: item.videoUrl
                        },
                        mimetype: "video/mp4",
                        fileName: Date.now() + "reel.mp4"
                    }, {
                        upload: socket.waUploadToServer
                    });

                    let thumbMedia = await prepareWAMessageMedia({
                        image: {
                            url: item.thumbnailUrl
                        },
                        mimetype: "image/jpeg",
                        fileName: Date.now() + "thumbnail.jpg"
                    }, {
                        upload: socket.waUploadToServer
                    });

                    let profileMedia = await prepareWAMessageMedia({
                        image: {
                            url: item.profileIconUrl
                        },
                        mimetype: "image/jpeg",
                        fileName: Date.now() + "profile.jpg"
                    }, {
                        upload: socket.waUploadToServer
                    });

                    uploadedReels.push({
                        title: item.title || "Reel",
                        description: item.description || "Video",

                        profileIconUrl: profileMedia.imageMessage?.url ||
                            item.profileIconUrl,

                        thumbnailUrl: thumbMedia.imageMessage?.url ||
                            item.thumbnailUrl,

                        videoUrl: videoMedia.videoMessage?.url ||
                            item.videoUrl
                    });
                }

                submessages.push({
                    messageType: 9,

                    contentItemsMetadata: {
                        contentType: 1,

                        itemsMetadata: uploadedReels.map(item => ({
                            reelItem: {
                                title: item.title,
                                profileIconUrl: item.profileIconUrl,
                                thumbnailUrl: item.thumbnailUrl,
                                videoUrl: item.videoUrl
                            }
                        }))
                    }
                });

                sections.push({
                    view_model: {
                        primitives: uploadedReels.map(item => ({
                            reels_url: item.videoUrl,
                            thumbnail_url: item.thumbnailUrl,
                            creator: item.title,
                            avatar_url: item.profileIconUrl,
                            reels_title: item.description,
                            likes_count: 0,
                            shares_count: 0,
                            view_count: 0,
                            reel_source: "IG",
                            is_verified: false,
                            __typename: "GenAIReelPrimitive"
                        })),

                        __typename: "GenAIHScrollLayoutViewModel"
                    }
                });

                uploadedReels.forEach((item, idx) => {
                    sources.push({
                        provider: "UNKNOWN",
                        thumbnailCDNURL: item.thumbnailUrl,
                        sourceProviderURL: item.videoUrl,
                        sourceQuery: "",
                        faviconCDNURL: item.profileIconUrl,
                        citationNumber: idx + 1,
                        sourceTitle: item.title
                    });
                });
            }
            let unifiedResponseData = {
                response_id: randomUUID(),
                sections: sections
            };
            let content = {
                messageContextInfo: {
                    deviceListMetadata: {},
                    deviceListMetadataVersion: 2,
                    botMetadata: {
                        pluginMetadata: {},
                        richResponseSourcesMetadata: {
                            sources
                        }
                    }
                },
                botForwardedMessage: {
                    message: {
                        richResponseMessage: {
                            messageType: 1,
                            submessages: submessages,
                            unifiedResponse: {
                                data: JSON.stringify(unifiedResponseData)
                            },
                            contextInfo: {
                                forwardingScore: 1,
                                isForwarded: true,
                                forwardedAiBotMessageInfo: {
                                    botJid: "867051314767696@bot"
                                },
                                forwardOrigin: 4,
                                mentionedJid: data.mentionedJid || []
                            }
                        }
                    }
                }
            };
            await socket.relayMessage(jid, content, {
                messageId: `HK_RICH_${Date.now()}`
            });
            return content;
        },

        sendFile: async (
            jid,
            path,
            filename = "",
            caption = "",
            quoted,
            ptt = false,
            options = {},
        ) => {
            let type = await socket.getFile(path, true);
            let {
                res,
                data: file,
                filename: pathFile
            } = type;
            if ((res && res.status !== 200) || file.length <= 65536) {
                try {
                    throw {
                        json: JSON.parse(file.toString()),
                    };
                } catch (e) {
                    if (e.json) throw e.json;
                }
            }
            let fileSize = fs.statSync(pathFile).size / 1024 / 1024;
            if (fileSize >= 1800) throw new Error(" The file size is too large\n\n");
            let opt = {};
            if (quoted) opt.quoted = quoted;
            if (!type) options.asDocument = true;
            let mtype = "",
                mimetype = options.mimetype || type.mime,
                convert;
            if (/webp/.test(type.mime) || (/image/.test(type.mime) && options.asSticker)) mtype = 'sticker';
            else if (/image/.test(type.mime) || (/webp/.test(type.mime) && options.asImage)) mtype = 'image';
            else if (/video/.test(type.mime)) mtype = 'video';
            else if (/audio/.test(type.mime)) {
                convert = await (ptt ? toPTT : toAudio)(file, type.ext);
                file = convert.data;
                pathFile = convert.filename;
                mtype = 'audio';
                mimetype = 'audio/ogg; codecs=opus';
            } else mtype = 'document';
            if (options.asDocument) mtype = "document";
            delete options.asSticker;
            delete options.asLocation;
            delete options.asVideo;
            delete options.asDocument;
            delete options.asImage;
            let message = {
                ...options,
                caption,
                ptt,
                [mtype]: {
                    url: pathFile,
                },
                mimetype,
                fileName: filename || pathFile.split("/").pop(),
            };
            /**
             * @type {import('@ryuu-reinzz/baileys').proto.WebMessageInfo}
             */
            let m;
            try {
                m = await socket.sendMessage(jid, message, {
                    ...opt,
                    ...options,
                });
            } catch (e) {
                console.error(e);
                m = null;
            } finally {
                if (!m)
                    m = await socket.sendMessage(
                        jid, {
                            ...message,
                            [mtype]: file,
                        }, {
                            ...opt,
                            ...options,
                        },
                    );
                file = null;
                return m;
            }
        },
        sendTextWithMentions: async (jid, text, quoted, options = {}) =>
            socket.sendMessage(
                jid, {
                    text: text,
                    contextInfo: {
                        mentionedJid: [...text.matchAll(/@(\d{0,16})/g)].map(
                            (v) => v[1] + "@s.whatsapp.net",
                        ),
                    },
                    ...options,
                }, {
                    quoted,
                },
            ),

        decodeJid: (jid) => {
            if (!jid) return jid;
            if (/:\d+@/gi.test(jid)) {
                let decode = jidDecode(jid) || {};
                return (
                    (decode.user && decode.server && decode.user + "@" + decode.server) ||
                    jid
                );
            } else return jid;
        },

        getName: (jid, withoutContact = false) => {
            let id = socket.decodeJid(jid);
            withoutContact = socket.withoutContact || withoutContact;
            let v;
            if (id.endsWith("@g.us"))
                return new Promise(async (resolve) => {
                    v = store.contacts[id] || {};
                    if (!(v.name || v.subject)) v = socket.groupMetadata(id) || {};
                    resolve(
                        v.name ||
                        v.subject ||
                        parsePhoneNumber('+' + id.replace('@s.whatsapp.net', '')).number.international,
                    );
                });
            else
                v =
                id === "0@s.whatsapp.net" ? {
                    id,
                    name: "WhatsApp",
                } :
                id === socket.decodeJid(socket.user.id) ?
                socket.user :
                store.contacts[id] || {};
            return (
                (withoutContact ? "" : v.name) ||
                v.subject ||
                v.verifiedName ||
                parsePhoneNumber('+' + jid.replace('@s.whatsapp.net', '')).number.international
            );
        },

        parseMention: (text = "") => {
            return [...text.matchAll(/@([0-9]{5,16}|0)/g)].map(
                (v) => v[1] + "@s.whatsapp.net",
            );
        },
        setStatus: (status) => {
            socket.query({
                tag: "iq",
                attrs: {
                    to: "@s.whatsapp.net",
                    type: "set",
                    xmlns: "status",
                },
                content: [{
                    tag: "status",
                    attrs: {},
                    content: Buffer.from(status, "utf-8"),
                }, ],
            });
            return status;
        },

        sendImage: async (jid, path, caption = "", quoted = "", options) => {
            let buffer = Buffer.isBuffer(path) ?
                path :
                /^data:.*?\/.*?;base64,/i.test(path) ?
                Buffer.from(path.split`,` [1], "base64") :
                /^https?:\/\//.test(path) ?
                await getBuffer(path) :
                fs.existsSync(path) ?
                fs.readFileSync(path) :
                Buffer.alloc(0);
            return await socket.sendMessage(
                jid, {
                    image: buffer,
                    caption: caption,
                    ...options,
                }, {
                    quoted,
                },
            );
        },

        sendImageAsSticker: async (jid, path, quoted, options = {}) => {
            let buff = Buffer.isBuffer(path) ?
                path :
                /^data:.*?\/.*?;base64,/i.test(path) ?
                Buffer.from(path.split`,` [1], "base64") :
                /^https?:\/\//.test(path) ?
                await getBuffer(path) :
                fs.existsSync(path) ?
                fs.readFileSync(path) :
                Buffer.alloc(0);
            let buffer;
            if (options && (options.packname || options.author)) {
                buffer = await writeExifImg(buff, options);
            } else {
                buffer = await imageToWebp(buff);
            }
            await socket.sendMessage(
                jid, {
                    sticker: {
                        url: buffer,
                    },
                    ...options,
                }, {
                    quoted,
                },
            ).then((response) => {
                fs.unlinkSync(buffer);
                return response;
            });
        },

        sendVideoAsSticker: async (jid, path, quoted, options = {}) => {
            let buff = Buffer.isBuffer(path) ?
                path :
                /^data:.*?\/.*?;base64,/i.test(path) ?
                Buffer.from(path.split`,` [1], "base64") :
                /^https?:\/\//.test(path) ?
                await getBuffer(path) :
                fs.existsSync(path) ?
                fs.readFileSync(path) :
                Buffer.alloc(0);
            let buffer;
            if (options && (options.packname || options.author)) {
                buffer = await writeExifVid(buff, options);
            } else {
                buffer = await videoToWebp(buff);
            }
            await socket.sendMessage(
                jid, {
                    sticker: {
                        url: buffer,
                    },
                    ...options,
                }, {
                    quoted,
                },
            );
            return buffer;
        },

        sendImageAsStickerAvatar: async (
            jid,
            path,
            quoted,
            options = {},
        ) => {
            let buff = Buffer.isBuffer(path) ?
                path :
                /^data:.*?\/.*?;base64,/i.test(path) ?
                Buffer.from(path.split`,` [1], "base64") :
                /^https?:\/\//.test(path) ?
                await getBuffer(path) :
                fs.existsSync(path) ?
                fs.readFileSync(path) :
                Buffer.alloc(0);
            let buffer;
            if (options && (options.packname || options.author)) {
                buffer = await exifAvatar(buff, options);
            } else {
                buffer = await imageToWebpAvatar(buff);
            }
            await socket.sendMessage(
                jid, {
                    sticker: {
                        url: buffer,
                    },
                    ...options,
                }, {
                    quoted,
                },
            ).then((response) => {
                fs.unlinkSync(buffer);
                return response;
            });
        },

        sendVideoAsStickerAvatar: async (
            jid,
            path,
            quoted,
            options = {},
        ) => {
            let buff = Buffer.isBuffer(path) ?
                path :
                /^data:.*?\/.*?;base64,/i.test(path) ?
                Buffer.from(path.split`,` [1], "base64") :
                /^https?:\/\//.test(path) ?
                await getBuffer(path) :
                fs.existsSync(path) ?
                fs.readFileSync(path) :
                Buffer.alloc(0);
            let buffer;
            if (options && (options.packname || options.author)) {
                buffer = await exifAvatar(buff, options);
            } else {
                buffer = await videoToWebpAvatar(buff);
            }
            await socket.sendMessage(
                jid, {
                    sticker: {
                        url: buffer,
                    },
                    ...options,
                }, {
                    quoted,
                },
            );
            return buffer;
        },

        copyNForward: async (
            jid,
            message,
            forceForward = false,
            options = {},
        ) => {
            let vtype;
            if (options.readViewOnce) {
                message.message =
                    message.message &&
                    message.message.ephemeralMessage &&
                    message.message.ephemeralMessage.message ?
                    message.message.ephemeralMessage.message :
                    message.message || undefined;
                vtype = Object.keys(message.message.viewOnceMessage.message)[0];
                delete(message.message && message.message.ignore ?
                    message.message.ignore :
                    message.message || undefined);
                delete message.message.viewOnceMessage.message[vtype].viewOnce;
                message.message = {
                    ...message.message.viewOnceMessage.message,
                };
            }
            let mtype = Object.keys(message.message)[0];
            let content = await generateForwardMessageContent(message, forceForward);
            let ctype = Object.keys(content)[0];
            let context = {};
            if (mtype != "conversation") context = message.message[mtype].contextInfo;
            content[ctype].contextInfo = {
                ...context,
                ...content[ctype].contextInfo,
            };
            let waMessage = await generateWAMessageFromContent(
                jid,
                content,
                options ? {
                    ...content[ctype],
                    ...options,
                    ...(options.contextInfo ? {
                        contextInfo: {
                            ...content[ctype].contextInfo,
                            ...options.contextInfo,
                        },
                    } : {}),
                } : {},
            );
            await socket.relayMessage(jid, waMessage.message, {
                messageId: waMessage.key.id,
            });
            return waMessage;
        },

        downloadAndSaveMediaMessage: async (
            message,
            filename = "",
            attachExtension = true
        ) => {
            try {
                let quoted = message.msg ? message.msg : message;
                let mime = (message.msg || message).mimetype || "";
                let messageType = message.mtype ?
                    message.mtype.replace(/Message/gi, "") :
                    mime.split("/")[0];

                let stream = await downloadContentFromMessage(quoted, messageType);
                let buffer = Buffer.from([]);
                for await (let chunk of stream) buffer = Buffer.concat([buffer, chunk]);

                let type = await fileTypeFromBuffer(buffer);

                if (!filename) {
                    let tmpDir = "./database/tmp";
                    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, {
                        recursive: true
                    });

                    let timestamp = Date.now();
                    filename = path.join(tmpDir, `tmp_${timestamp}`);
                }

                let trueFileName;
                if (type?.ext === "ogg" || type?.ext === "opus") {
                    trueFileName = attachExtension ? `${filename}.mp3` : filename;
                } else if (type?.ext) {
                    trueFileName = attachExtension ? `${filename}.${type.ext}` : filename;
                } else {
                    trueFileName = attachExtension ? `${filename}.bin` : filename;
                }

                await fs.writeFileSync(trueFileName, buffer);
                return trueFileName;
            } catch (e) {
                console.error("Gagal download media:", e);
                return null;
            }
        },

        downloadMediaMessage: async (message) => {
            let mime = (message.msg || message).mimetype || "";
            let messageType = message.mtype ?
                message.mtype.replace(/Message/gi, "") :
                mime.split("/")[0];
            let stream = await downloadContentFromMessage(message, messageType);
            let buffer = Buffer.from([]);
            for await (let chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
            }
            return buffer;
        },

        getFile: async (PATH, save) => {
            let res;
            let filename;
            let data = Buffer.isBuffer(PATH) ?
                PATH :
                /^data:.*?\/.*?;base64,/i.test(PATH) ?
                Buffer.from(PATH.split`,` [1], "base64") :
                /^https?:\/\//.test(PATH) ?
                await (res = await getBuffer(PATH)) :
                fs.existsSync(PATH) ?
                ((filename = PATH), fs.readFileSync(PATH)) :
                typeof PATH === "string" ?
                PATH :
                Buffer.alloc(0);
            let type = (await fileTypeFromBuffer(data))
            if (data && save) fs.promises.writeFile(filename, data);
            return {
                res,
                filename,
                size: await getSizeMedia(data),
                ...type,
                data,
            };
        },

        sendText: (jid, text, quoted = "", options) =>
            socket.sendMessage(
                jid, {
                    text: text,
                    ...options,
                }, {
                    quoted,
                },
            ),

        serializeM: (m) => smsg(socket, m, store),

        sendFileUrl: async (jid, url, caption, quoted, options = {}) => {
            let mime = "";
            let res = await axios.head(url);
            mime = res.headers["content-type"];
            if (mime.split("/")[1] === "gif") {
                return socket.sendMessage(
                    jid, {
                        video: await getBuffer(url),
                        caption: caption,
                        gifPlayback: true,
                        ...options,
                    }, {
                        quoted: quoted,
                        ...options,
                    },
                );
            }
            if (mime === "application/pdf") {
                return socket.sendMessage(
                    jid, {
                        document: await getBuffer(url),
                        mimetype: "application/pdf",
                        caption: caption,
                        ...options,
                    }, {
                        quoted: quoted,
                        ...options,
                    },
                );
            }
            if (mime.split("/")[0] === "image") {
                return socket.sendMessage(
                    jid, {
                        image: await getBuffer(url),
                        caption: caption,
                        ...options,
                    }, {
                        quoted: quoted,
                        ...options,
                    },
                );
            }
            if (mime.split("/")[0] === "video") {
                return socket.sendMessage(
                    jid, {
                        video: await getBuffer(url),
                        caption: caption,
                        mimetype: "video/mp4",
                        ...options,
                    }, {
                        quoted: quoted,
                        ...options,
                    },
                );
            }
            if (mime.split("/")[0] === "audio") {
                return socket.sendMessage(
                    jid, {
                        audio: await getBuffer(url),
                        caption: caption,
                        mimetype: "audio/mpeg",
                        ...options,
                    }, {
                        quoted: quoted,
                        ...options,
                    },
                );
            }
        },
    });
};