import GetFeed from './getFeed.js'
import cfg from './config.js'

export default function CreateBlueskyRoutes(app) {
  app.get('/xrpc/app.bsky.feed.getFeedSkeleton', async (req, res) => {
    const feed = req.query.feed
    const cursor = req.query.cursor;
    const lastWord = feed.split('/').pop()

    res.send(await GetFeed(lastWord, cursor))
  })
  app.get('/.well-known/did.json', (_req, res) => {
    if (!cfg.serviceDid.endsWith(cfg.hostname)) {
      return res.sendStatus(404)
    }
    res.json({
      '@context': ['https://www.w3.org/ns/did/v1'],
      id: cfg.serviceDid,
      service: [
        {
          id: '#bsky_fg',
          type: 'BskyFeedGenerator',
          serviceEndpoint: `https://${cfg.hostname}`,
        },
      ],
    })
  })
  app.get('/xrpc/app.bsky.feed.describeFeedGenerator', (req, res) => {
    res.json(
      {
        'did': cfg.serviceDid,
        'feeds': [
          { 'uri': `at://${cfg.ownerDid}/app.bsky.feed.generator/protogen` },
          { 'uri': `at://${cfg.ownerDid}/app.bsky.feed.generator/protogen-art` },
          { 'uri': `at://${cfg.ownerDid}/app.bsky.feed.generator/osusky` },
          { 'uri': `at://${cfg.ownerDid}/app.bsky.feed.generator/osufeed-test` },
        ],
      },
    )
  })
}

