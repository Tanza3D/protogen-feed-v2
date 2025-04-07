import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'
import CreateBlueskyRoutes from './utils/bluesky.js'
import { InitAnalytics, GetData } from './utils/analytics.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const port = 3001

app.use('/static', express.static(path.join(__dirname, 'static')))

app.get('/', async (req, res) => {
  fs.readFile(path.join(__dirname, 'static/index.html'), 'utf-8', async (err, data) => {
    data = data.replace("\'{{ANALYTICSDATA}}\'", JSON.stringify((await GetData())))
    res.send(data)

  })
})

CreateBlueskyRoutes(app)
InitAnalytics()

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
