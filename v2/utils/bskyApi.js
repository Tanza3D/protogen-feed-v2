
import config from './config.js'
import Proto from '@atproto/api'
const { BskyAgent } = Proto

const agent = new BskyAgent({
  service: 'https://bsky.social'
})
await agent.login({
  identifier: config.owner,
  password: config.ownerPassword
})

export class BskyApi {
  static async GetUserData(did) {
    return (await agent.getProfile({ "actor": did }))

  }
}