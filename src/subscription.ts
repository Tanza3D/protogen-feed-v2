import { isCommit, OutputSchema as RepoEvent } from './lexicon/types/com/atproto/sync/subscribeRepos'
import { FirehoseSubscriptionBase, getOpsByType } from './util/subscription'
import { FurryHelper } from './furryhelper'
import { ProtogenProcessor } from './subscriptionProcessers/protogenProcessor'
import { OsuProcessor } from './subscriptionProcessers/osuProcessor'
import colours from './colours'
var cache = require('memory-cache');
export class FirehoseSubscription extends FirehoseSubscriptionBase {

  async getUserData(author : string) {
    var cachedata = cache.get('user'+author);
    if(cachedata !== null) return cachedata;
    const data = await this.agent.api.app.bsky.actor.getProfile({ actor: author })
    cache.put('user'+author, data, 900);
    return data;
  }
  async asyncProcess(evt) {
    try {
      const ops = await getOpsByType(evt)
      ProtogenProcessor(ops, this, (txt) => {
        console.log("["+colours.FgLightBlue+"ProtogenFeed\x1b[0m]", txt);
      });
      OsuProcessor(ops, this, (txt) => {
        console.log("    [\x1b[35mosu!Feed\x1b[0m]", txt);
      });
    } catch(e) {
      console.log(e);
    }
  }
  async handleEvent(evt: RepoEvent) {
    this.asyncProcess(evt); // ... look, we don't need to wait.
  }
}
