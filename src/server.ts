import http from 'http'
import events from 'events'
import express from 'express'
import { DidResolver, MemoryCache } from '@atproto/identity'
import { createServer } from './lexicon'
import feedGeneration from './methods/feed-generation'
import describeGenerator from './methods/describe-generator'
import { createDb, Database } from './db'
import { FirehoseSubscription } from './subscription'
import { AppContext, Config } from './config'
import wellKnown from './well-known'
import { AppBskyGraphDefs, AtpAgent } from '@atproto/api'

export class FeedGenerator {
  public app: express.Application
  public server?: http.Server
  public db: Database
  public firehose: FirehoseSubscription
  public cfg: Config
  private agent: AtpAgent

  constructor(
    app: express.Application,
    db: Database,
    firehose: FirehoseSubscription,
    cfg: Config,
    agent: AtpAgent,
  ) {
    this.app = app
    this.db = db
    this.agent = agent
    this.firehose = firehose
    this.cfg = cfg
  }

  static create(cfg: Config) {
    console.log(cfg)
    const app = express()
    const db = createDb()
    //migrate(db).then(r => () => {});

    const didCache = new MemoryCache()
    const didResolver = new DidResolver({
      plcUrl: 'https://plc.directory',
      didCache,
    })

    const server = createServer({
      validateResponse: true,
      payload: {
        jsonLimit: 100 * 1024, // 100kb
        textLimit: 100 * 1024, // 100kb
        blobLimit: 5 * 1024 * 1024, // 5mb
      },
    })
    const ctx: AppContext = {
      db,
      didResolver,
      cfg,
    }
    feedGeneration(server, ctx)
    describeGenerator(server, ctx)
    app.use(server.xrpc.router)
    app.use(wellKnown(ctx))

    const agent = new AtpAgent({ service: cfg.bskyServiceUrl })
    const firehose = new FirehoseSubscription(db, cfg.subscriptionEndpoint, agent)



    return new FeedGenerator(app, db, firehose, cfg, agent)
  }

  async start(): Promise<null|http.Server> {
    await this.agent.login({
      identifier: this.cfg.handle,
      password: this.cfg.appPassword,
    })
    console.log('logged in')


    if(process.env.FEEDTYPE == "subscription") {
      console.log("running subscription");
      let cursor: string | undefined
      let members: AppBskyGraphDefs.ListItemView[] = []
      do {
        let res = await this.agent.api.app.bsky.graph.getList({
          list: 'at://did:plc:3hlndsgqicwh4sz5vwcg4njh/app.bsky.graph.list/3l6q3bwxe3u25',
          limit: 100,
          cursor
        })
        cursor = res.data.cursor
        members = members.concat(res.data.items)
      } while (cursor)

      for(var member of members) {
        this.db.execute("REPLACE INTO `osu-users` (did, always) VALUES (?, 1)", [member.subject.did]);
      }


      this.firehose.run(this.cfg.subscriptionReconnectDelay)
      return null;
    } else {
      console.log("running webhost");
      this.server = this.app.listen(this.cfg.port, this.cfg.listenhost)
      await events.once(this.server, 'listening')
      return this.server
    }

  }
}

export default FeedGenerator
