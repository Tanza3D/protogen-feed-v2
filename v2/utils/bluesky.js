import GetFeed from './getFeed.js'
import cfg from './config.js'
import {validateAuth} from "./jwt.js";
import {PushAnalytic} from "./analytics.js";

export default function CreateBlueskyRoutes(app) {
  app.get('/xrpc/app.bsky.feed.getFeedSkeleton', async (req, res) => {

    const feed = req.query.feed
    const cursor = req.query.cursor;
    const lastWord = feed.split('/').pop();

    if(typeof(cursor) == "undefined") {
      const user = await validateAuth(req);
      await PushAnalytic(user, lastWord);
      // undefined cursor means they've just clicked on the feed for the first time
      // we don't want to really track analytics for scrolling
      // (nor waste time getting user data!)
    }

    res.send(await GetFeed(lastWord, cursor, req.query.limit))
  })
  app.get('/.well-known/did.json', (_req, res) => {
    console.log("/.well-known/did.json")
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
    console.log("/xrpc/app.bsky.feed.describeFeedGenerator");
    res.json(
      {
        'did': cfg.serviceDid,
        'feeds': [
          { 'uri': `at://${cfg.ownerDid}/app.bsky.feed.generator/protogens` },
          { 'uri': `at://${cfg.ownerDid}/app.bsky.feed.generator/protogens-art` },
          { 'uri': `at://${cfg.ownerDid}/app.bsky.feed.generator/osusky` },
          { 'uri': `at://${cfg.ownerDid}/app.bsky.feed.generator/osufeed-test` },
        ],
      },
    )
  })
}

