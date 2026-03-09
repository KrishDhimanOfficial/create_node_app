import express from 'express'
import cookieParser from 'cookie-parser'
import logger from 'morgan'
import { globalErrorHandler } from './utils/helper.utils.js'
import compression from 'compression'
import cors from 'cors'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const app = express()

app.use(cors())
app.use(logger('dev'))
app.use(express.json({ limit: '10kb' }))
app.use(express.urlencoded({ extended: true }))
app.use(compression(
  {
    level: 4, // compression level
    threshold: 0, // Compress all
    memLevel: 9, // memory usuage
    filter: (req, res) => compression.filter(req, res)
  }
))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))

app.get('/', (req, res) => {
  return res.send('Hello World!')
})

// error handler
app.use(globalErrorHandler)

export default app