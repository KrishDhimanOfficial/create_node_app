import { fileURLToPath } from 'node:url'
import path from 'node:path'
import fs from 'node:fs'
import chalk from 'chalk'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)


const deleteFile = async (folderPath) => {
    try {
        const imagePath = path.join(__dirname, '..', folderPath)
        if (!fs.existsSync(imagePath)) return

        await fs.promises.rm(imagePath, { force: true })
    } catch (error) {
        console.error(chalk.red('deleteFile error:', error.message))
    }
}

export { deleteFile }