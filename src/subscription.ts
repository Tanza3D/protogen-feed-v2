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
      if(post.record.text.includes("protogen")) console.log(post.record.text)
    }

    const postsToDelete = ops.posts.deletes.map((del) => del.uri)
    const postsToCreateWithFilter = await Promise.all(
      ops.posts.creates.map(async (create) => {
        if (create.author.includes('7jhguqneakum7yhv4wt3kwfi')) {
          console.log('{{{{{{{{{{{ Procesisng one from tanza')
        }
        const endTime = new Date()
        const startTime = new Date(create.record.createdAt)
        const difference = endTime.getTime() - startTime.getTime() // This will give difference in milliseconds
        const resultInMinutes = Math.round(difference / 60000)
        const resultInSeconds = Math.round(difference / 1000) // Convert to seconds

        if (resultInSeconds > 60) {
          console.log('running ' + resultInSeconds + ' seconds behind (' + resultInMinutes + ' mins)')
        }

        let add = false
        let reprocess_user = false

        let [user] = await this.db.execute('SELECT * FROM users WHERE did = ?', [create.author])

        if(FurryHelper.isFurry(create.record.text).length > 0) console.log(FurryHelper.isFurry(create.record.text));
        // @ts-ignore
        if (user.length < 1) {
          const isfurry = FurryHelper.isFurry(create.record.text)
          let extra = false
          if (FurryHelper.isProtogen(create.record.text)) extra = true
          if (isfurry.length > 0 || extra) {
            reprocess_user = true
            console.log('new furry ' + create.author + ' on matching ' + isfurry.join(', '))
          } else {
            if(create.author.includes("3uyxuzj")) console.log('!!!!!!!!! ' + create.author + ' is nota furry')
          }
        } else {
          if (user[0]['protogen'] == 1) {
            add = true
            reprocess_user = false
          }
        }

        if (reprocess_user == true) {
          const isfurryx: boolean = (FurryHelper.isFurry(create.record.text).length > 0)
          const profile = await this.agent.api.app.bsky.actor.getProfile({ actor: create.author })

          console.log('reprocessing ' + profile.data.handle)
          let protogen = false
          if (FurryHelper.isProtogen(profile.data.displayName)) protogen = true
          if (FurryHelper.isProtogenStrict(profile.data.description)) protogen = true
          if (FurryHelper.isProtogenTag(profile.data.handle)) protogen = true
          if (FurryHelper.isProtogen(profile.data.handle)) protogen = true

          if (protogen) add = true

          if (protogen) console.log('that\'s a new protogen :D - ' + profile.data.handle)

          const data = {
            'user': create.author,
            'furry': isfurryx,
            'protogen': protogen,
          }

          await this.db.execute('INSERT INTO `users` (`did`, `furry`, `protogen`)\n' +
            'VALUES (?, ?, ?);', [data.user, data.furry ? 1 : 0, data.protogen ? 1 : 0])
        }

        const textprotogen = FurryHelper.isProtogen(create.record.text)
        if (textprotogen) add = true

        if (create.record?.reply && add) {
          const parentReplier = create.record?.reply.parent.uri.split('//')[1].split('/')[0]
          let [parentuser] = await this.db.execute('SELECT * FROM users WHERE did = ?', [parentReplier])

          // @ts-ignore
          if (parentuser.length > 0) {
            console.log('discarding post due to reply')
            if (parentuser[0].protogen == 0) add = false
          } else {
            console.log('discarding post due to reply')
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
