import { FurryHelper } from '../furryhelper'
import { FirehoseSubscription } from '../subscription'

export async function ProtogenProcessor(ops, subscription : FirehoseSubscription, logger : Function) {
  const postsToDelete = ops.posts.deletes.map((del) => del.uri)
  const postsToCreateWithFilter = await Promise.all(
    ops.posts.creates.map(async (create) => {
      try {
        const endTime = new Date()
        const startTime = new Date(create.record.createdAt)
        const difference = endTime.getTime() - startTime.getTime() // This will give difference in milliseconds
        const resultInMinutes = Math.round(difference / 60000)
        const resultInSeconds = Math.round(difference / 1000) // Convert to seconds

        if (resultInSeconds > 60) {
          logger('running ' + resultInSeconds + ' seconds behind (' + resultInMinutes + ' mins)')
        }

        let add = false
        let reprocess_user = false

        let [user] = await subscription.db.execute('SELECT * FROM users WHERE did = ?', [create.author])

        if (FurryHelper.isFurry(create.record.text).length > 0) logger(FurryHelper.isFurry(create.record.text))
        // @ts-ignore
        if (user.length < 1) {
          const isfurry = FurryHelper.isFurry(create.record.text)
          let extra = false
          if (FurryHelper.isProtogen(create.record.text)) extra = true
          if (isfurry.length > 0 || extra) {
            reprocess_user = true
            logger('new furry ' + create.author + ' on matching ' + isfurry.join(', '))
          } else {
            if (create.author.includes('3uyxuzj')) logger('!!!!!!!!! ' + create.author + ' is nota furry')
          }
        } else {
          if (user[0]['protogen'] == 1) {
            add = true
            reprocess_user = false
          }
        }

        if (reprocess_user == true) {
          const isfurryx: boolean = (FurryHelper.isFurry(create.record.text).length > 0)
          const profile = await subscription.getUserData(create.author)

          logger('reprocessing ' + profile.data.handle)
          let protogen = false
          if (FurryHelper.isProtogen(profile.data.displayName)) protogen = true
          if (FurryHelper.isProtogenStrict(profile.data.description)) protogen = true
          if (FurryHelper.isProtogenTag(profile.data.handle)) protogen = true
          if (FurryHelper.isProtogen(profile.data.handle)) protogen = true

          if (protogen) add = true

          if (protogen) logger('that\'s a new protogen :D - ' + profile.data.handle)

          const data = {
            'user': create.author,
            'furry': isfurryx,
            'protogen': protogen,
          }

          await subscription.db.execute('INSERT INTO `users` (`did`, `furry`, `protogen`)\n' +
            'VALUES (?, ?, ?);', [data.user, data.furry ? 1 : 0, data.protogen ? 1 : 0])
        }

        const textprotogen = FurryHelper.isProtogen(create.record.text)
        if (textprotogen) add = true

        if (create.record?.reply && add) {
          const parentReplier = create.record?.reply.parent.uri.split('//')[1].split('/')[0]
          let [parentuser] = await subscription.db.execute('SELECT * FROM users WHERE did = ?', [parentReplier])

          // @ts-ignore
          if (parentuser.length > 0) {
            logger('discarding post due to reply')
            if (parentuser[0].protogen == 0) add = false
          } else {
            logger('discarding post due to reply')
            add = false
          }
        }

        if (add) logger('adding ; ' + create.record.text)

        return {
          shouldCreate: add,
          post: {
            uri: create.uri,
            cid: create.cid,
            indexedAt: new Date().toISOString(),
          },
        }
      } catch (e) {
        logger(e);
        return {
          shouldCreate: false,
          post: {
            uri: "",
            cid: "",
            indexedAt: new Date().toISOString(),
          },
        }
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
    await subscription.db.execute(deleteQuery, postsToDelete)
  }


  if (postsToCreate.length > 0) {
    const values = postsToCreate.map(post => [post.uri, post.cid, post.indexedAt])
    const insertQuery = `
            INSERT INTO post (uri, cid, indexedAt)
            VALUES ?
            ON DUPLICATE KEY UPDATE cid       = VALUES(cid),
                                    indexedAt = VALUES(indexedAt)
        `
    await subscription.db.query(insertQuery, [values])
  }
}