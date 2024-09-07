import { isCommit, OutputSchema as RepoEvent } from './lexicon/types/com/atproto/sync/subscribeRepos'
import { FirehoseSubscriptionBase, getOpsByType } from './util/subscription'
import { FurryHelper } from './furryhelper'

export class FirehoseSubscription extends FirehoseSubscriptionBase {
  async handleEvent(evt: RepoEvent) {
    if (!isCommit(evt)) return
    const ops = await getOpsByType(evt)

    // This logs the text of every post off the firehose.
    // Just for fun :)
    // Delete before actually using
    for (const post of ops.posts.creates) {
      //console.log(post.record.text)
    }

    const postsToDelete = ops.posts.deletes.map((del) => del.uri)
    const postsToCreateWithFilter = await Promise.all(
      ops.posts.creates.map(async (create) => {

        var endTime = new Date()
        var startTime = new Date(create.record.createdAt)
        var difference = endTime.getTime() - startTime.getTime() // This will give difference in milliseconds
        var resultInMinutes = Math.round(difference / 60000)
        var resultInSeconds = Math.round(difference / 1000) // Convert to seconds

        if (resultInSeconds > 60) {
          console.log('running ' + resultInSeconds + ' seconds behind (' + resultInMinutes + ' mins)')
        }

        var add = false
        var reprocess_user = false

        var [user] = await this.db.execute('SELECT * FROM users WHERE did = ?', [create.author])
        // @ts-ignore
        if (user.length < 1) {
          var isfurry = FurryHelper.isFurry(create.record.text)
          var extra = false;
          if(FurryHelper.isProtogen(create.record.text)) extra = true;
          if (isfurry.length > 0 || extra) {
            reprocess_user = true
            console.log('new furry ' + create.author + ' on matching ' + isfurry.join(', '))
          }
        } else {
          if (user[0]['protogen'] == 1) {
            add = true
            reprocess_user = false;
          }
        }

        if (reprocess_user == true) {
          var isfurryx: boolean = (FurryHelper.isFurry(create.record.text).length > 0)
          const profile = await this.agent.api.app.bsky.actor.getProfile({ actor: create.author })

          var protogen = false
          if (FurryHelper.isProtogen(profile.data.displayName)) protogen = true
          if (FurryHelper.isProtogenStrict(profile.data.description)) protogen = true
          if (FurryHelper.isProtogenTag(profile.data.handle)) protogen = true
          if (FurryHelper.isProtogen(profile.data.handle)) protogen = true

          if (protogen) add = true

          if (protogen) console.log('that\'s a new protogen :D')

          var data = {
            'user': create.author,
            'furry': isfurryx,
            'protogen': protogen,
          }

          await this.db.execute('INSERT INTO `users` (`did`, `furry`, `protogen`)\n' +
            'VALUES (?, ?, ?);', [data.user, data.furry ? 1 : 0, data.protogen ? 1 : 0])
        }

        var textprotogen = FurryHelper.isProtogen(create.record.text)
        if (textprotogen) add = true

        if (create.record?.reply && add) {
          var parentReplier = create.record?.reply.parent.uri.split('//')[1].split('/')[0]
          var [parentuser] = await this.db.execute('SELECT * FROM users WHERE did = ?', [parentReplier])

          // @ts-ignore
          if (parentuser.length > 0) {
            console.log("discarding post due to reply");
            if (parentuser[0].protogen == 0) add = false
          } else {
            console.log("discarding post due to reply");
            add = false
          }
        }

        if (add) console.log('adding ; ' + create.record.text)

        return {
          shouldCreate: add,
          post: {
            uri: create.uri,
            cid: create.cid,
            indexedAt: new Date().toISOString(),
          },
        }
      }),
    )

    const postsToCreate = postsToCreateWithFilter
      .filter(({ shouldCreate }) => shouldCreate)
      .map(({ post }) => post)

    if (postsToDelete.length > 0) {
      // Create a string of placeholders (e.g., '?, ?, ?') for each element in postsToDelete
      const placeholders = postsToDelete.map(() => '?').join(', ')

      // Create the SQL query with placeholders
      const deleteQuery = `DELETE
                           FROM post
                           WHERE uri IN (${placeholders})`

      // Execute the query with the actual values
      await this.db.execute(deleteQuery, postsToDelete)
    }

    if (postsToCreate.length > 0) {
      const values = postsToCreate.map(post => [post.uri, post.cid, post.indexedAt])

      const insertQuery = `
          INSERT INTO post (uri, cid, indexedAt)
          VALUES ?
          ON DUPLICATE KEY UPDATE cid       = VALUES(cid),
                                  indexedAt = VALUES(indexedAt)
      `

      // Use the 'query' method instead of 'execute' to handle array of arrays correctly
      await this.db.query(insertQuery, [values])
    }

  }
}
