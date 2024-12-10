import express from 'express'
import CreateBlueskyRoutes from './utils/bluesky'

const app = express()
const port = 3000
CreateBlueskyRoutes(app);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})