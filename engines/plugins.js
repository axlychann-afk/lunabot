import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import { pathToFileURL } from 'url';

export const plugins = new Map();
global.plugins = plugins;

export const pluginsLoader = async (directory) => {
    const targetDir = path.resolve(directory);

    if (!fs.existsSync(targetDir)) {
        console.error(
            chalk.redBright(
                `[Loader] ❌ Direktori tidak ditemukan: ${targetDir}`
            )
        );
        return plugins;
    }

    const files = fs
        .readdirSync(targetDir)
        .filter(file => file.endsWith('.js'));

    for (const file of files) {
        const filePath = path.join(targetDir, file);

        try {
            const fileUrl = pathToFileURL(filePath).href;
            const plugin = await import(
                `${fileUrl}?update=${Date.now()}`
            );

            plugins.set(filePath, {
                file: filePath,
                ...(plugin.default || plugin)
            });

        } catch (err) {
            console.error(
                chalk.red(
                    `[Loader] ❌ Gagal memuat ${file}: ${err.message}`
                )
            );
        }
    }

    return plugins;
};

export const hotReload = async (filePath) => {
    filePath = path.resolve(filePath);

    try {
        if (!fs.existsSync(filePath)) {

            if (plugins.has(filePath)) {
                plugins.delete(filePath);

                console.log(
                    chalk.yellow(
                        `[HotReload] Plugin dihapus: ${path.basename(filePath)}`
                    )
                );
            }

            return false;
        }

        const fileUrl = pathToFileURL(filePath).href;

        const imported = await import(
            `${fileUrl}?update=${Date.now()}`
        );

        plugins.set(filePath, {
            file: filePath,
            ...(imported.default || imported)
        });

        console.log(
            chalk.green(
                `[HotReload] Reloaded: ${path.basename(filePath)}`
            )
        );

        return true;

    } catch (err) {
        console.error(
            chalk.red(
                `[HotReload] ${path.basename(filePath)}: ${err.message}`
            )
        );

        return false;
    }
};