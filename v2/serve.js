import express from 'express'
import CreateBlueskyRoutes from './utils/bluesky.js'

const app = express()
const port = 3001
CreateBlueskyRoutes(app);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})