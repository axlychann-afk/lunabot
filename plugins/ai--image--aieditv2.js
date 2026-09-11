import axios from 'axios'
import fs from 'fs'

const BASE_URL = 'https://prithivmlmods-qwen-image-edit-2509-loras-fast.hf.space/gradio_api'
const API_NAME = 'edit_image'
const WORKER_URL = process.env.QWEN_WORKER_URL || 'http://workers.proxy-1.ryuu-dev.my.id'

// Token Hugging Face (kuota ZeroGPU lebih besar).
// Bisa juga via env HF_TOKEN atau global.hfkey di settings.js.
const hfToken = process.env.HF_TOKEN || global.hfkey || global.hftoken || `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`

const errorMessage = (err) => {
    const data = err?.response?.data

    if (typeof data === 'string' && data) {
        return data.slice(0, 300)
    }

    return data?.message || data?.error || err?.message || 'Unknown error'
}

class QwenImageEdit {
    constructor(useToken = true) {
        this.useToken = useToken

        this.axios = axios.create({
            timeout: 120000,
            headers: {
                'Content-Type': 'application/json',
                'Origin': 'https://prithivmlmods-qwen-image-edit-2509-loras-fast.hf.space',
                'Referer': 'https://prithivmlmods-qwen-image-edit-2509-loras-fast.hf.space/',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36'
            }
        })
    }

    async workerRequest(method, target, data = null, extra = {}) {
        const res = await this.axios({
            method,
            url: WORKER_URL,
            params: { url: target },
            data,
            headers: this.useToken && hfToken ? {
                'Authorization': `Bearer ${hfToken}`
            } : {},
            ...extra
        })
        return res
    }

    async imageToBase64(input) {
        if (/^https?:\/\//i.test(input)) {
            const res = await this.workerRequest('GET', input, null, {
                responseType: 'arraybuffer',
                timeout: 60000
            })

            return `data:image/jpeg;base64,${Buffer.from(res.data).toString('base64')}`
        }

        const buffer = fs.readFileSync(input)

        return `data:image/jpeg;base64,${buffer.toString('base64')}`
    }

    // Parse hasil SSE (buffer penuh dari worker proxy) sampai event selesai
    parseSse(text) {
        let output = null

        for (const line of text.split('\n')) {
            const trimmed = line.trim()

            if (!trimmed.startsWith('data:')) continue

            const raw = trimmed.slice(5).trim()

            if (!raw || raw === '[DONE]') continue

            let evt
            try {
                evt = JSON.parse(raw)
            } catch {
                continue
            }

            // Beberapa event gradio mengirim data: null
            if (!evt) continue

            // Payload array = hasil akhir (event "complete")
            if (Array.isArray(evt)) {
                output = evt
                break
            }

            if (evt.msg === 'process_completed') {
                output = evt.output?.data || null
                break
            }

            if (evt.msg === 'error' || evt.error) {
                throw new Error(evt.error || evt.msg || 'Error dari server')
            }
        }

        return output
    }

    extractImage(output) {
        if (!Array.isArray(output) || output.length === 0) {
            throw new Error('Struktur respons tidak valid')
        }

        const first = output[0]

        if (first && typeof first === 'object' && first.image) {
            return first.image
        }

        if (first && typeof first === 'object' && first.url) {
            return first.url
        }

        if (typeof first === 'string') {
            return first
        }

        throw new Error('Struktur respons tidak valid')
    }

    async editImage({
        imageSource,
        prompt,
        lora = 'Photo-to-Anime'
    }) {
        const imageBase64 = await this.imageToBase64(imageSource)

        // Mulai job lewat REST API resmi Gradio via worker proxy
        const start = await this.workerRequest('POST', `${BASE_URL}/call/${API_NAME}`, {
            data: [
                imageBase64,
                prompt,
                lora,
                0,
                true,
                1,
                4
            ]
        })

        const eventId = start.data?.event_id

        if (!eventId) {
            throw new Error('Server tidak mengembalikan event_id')
        }

        // Ambil hasil lewat stream SSE (worker mengembalikan buffer penuh saat selesai)
        const res = await this.workerRequest(
            'GET',
            `${BASE_URL}/call/${API_NAME}/${eventId}`,
            null,
            {
                timeout: 120000,
                responseType: 'text'
            }
        )

        const output = this.parseSse(res.data)

        return this.extractImage(output)
    }
}

export { QwenImageEdit }

export default {
  command: ['aieditv2', 'image-editv2', 'imgeditv2'],
  group: false,
  premium: true,
  limit: true,
  admin: false,
  creator: false,
  botAdmin: false,
  privates: false,
  usePrefix: true,
  disable: false,

    code: async (
        m, {
            TempFile,
            RyuuBotz,
            text,
            reply,
            prefix,
            command
        }
    ) => {
        const q = m.quoted || m
        const mime = (q.msg || q).mimetype || ''

        if (!/image/i.test(mime)) {
            return reply(
                `Sistem: Lampirkan gambar.\nFormat: ${prefix + command} on/off | prompt`
            )
        }

        const args = text.split('|').map(v => v.trim())

        // "off" = tanpa token HF (kuota anonim), selain itu pakai token
        const useToken = args[0]?.toLowerCase() !== 'off'

        const promptText = args.length > 1 ?
            args[1] :
            args[0]

        if (!promptText || promptText.length < 3) {
            return reply(`Sistem: Lampirkan gambar.\nFormat: ${prefix + command} on/off | prompt`)
        }

        const loraName = args.length > 2 ?
            args[2] :
            'Photo-to-Anime'

        await RyuuBotz.sendMessage(m.chat, {
            react: {
                text: '⏳',
                key: m.key
            }
        })

        let imgPath = null
        let result = null
        let lastError = null

        try {
            imgPath = await RyuuBotz.downloadAndSaveMediaMessage(q)

            for (let attempt = 1; attempt <= 3; attempt++) {
                try {
                    const ai = new QwenImageEdit(useToken)

                    result = await ai.editImage({
                        imageSource: imgPath,
                        prompt: promptText,
                        lora: loraName
                    })

                    if (result) break
                } catch (err) {
                    lastError = new Error(errorMessage(err))

                    console.error(
                        `[Attempt ${attempt}] ${errorMessage(err)}`
                    )

                    // Beri jeda antar percobaan (misal space baru bangun)
                    if (attempt < 3) {
                        await new Promise(resolve => setTimeout(resolve, 3000))
                    }
                }
            }

            if (!result) {
                throw lastError || new Error('Unknown error')
            }

            if (result.startsWith('data:image')) {
                const base64 = result.replace(
                   /^data:image\/\w+;base64,/,
                    ''
                )

                const buffer = Buffer.from(base64, 'base64')

                await RyuuBotz.sendMessage(
                    m.chat, {
                        image: buffer,
                        caption: `Sistem: Proses selesai.\nTransport: Worker Proxy\nToken HF: ${useToken ? 'Aktif' : 'Nonaktif'}\nPrompt: ${promptText}\nLoRA: ${loraName}`
                    }, {
                        quoted: m
                    }
                )
            } else {
                await RyuuBotz.sendMessage(
                    m.chat, {
                        image: {
                            url: result
                        },
                        caption: `Sistem: Proses selesai.\nTransport: Worker Proxy\nToken HF: ${useToken ? 'Aktif' : 'Nonaktif'}\nPrompt: ${promptText}\nLoRA: ${loraName}`
                    }, {
                        quoted: m
                    }
                )
            }

            await RyuuBotz.sendMessage(m.chat, {
                react: {
                    text: '✅',
                    key: m.key
                }
            })
        } catch (err) {
            reply(
                `Sistem: Gagal setelah 3 percobaan.\nError: ${errorMessage(err)}`
            )

            await RyuuBotz.sendMessage(m.chat, {
                react: {
                    text: '❌',
                    key: m.key
                }
            })
        } finally {
            if (imgPath && fs.existsSync(imgPath)) {
                fs.unlinkSync(imgPath)
            }
        }
    }
}
