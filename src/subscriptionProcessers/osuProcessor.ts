import { OsuHelper } from '../osuhelper'
import { FirehoseSubscription } from '../subscription'
import colours from "../colours";
export async function OsuProcessor(ops, subscription : FirehoseSubscription, logger : Function) {
  const postsToDelete = ops.posts.deletes.map((del) => del.uri)
  const postsToCreateWithFilter = await Promise.all(
    ops.posts.creates.map(async (create) => {
      try {
        let add = false
        let reprocess_user = false

        let [user] = await subscription.db.execute('SELECT * FROM `osu-users` WHERE did = ?', [create.author])

        //if (OsuHelper.generalCheck(create.record.text).length > 0) logger(OsuHelper.generalCheck(create.record.text))
        // @ts-ignore
        if (user.length < 1) {
          const isfurry = OsuHelper.generalCheck(create.record.text)
          let extra = false
          if (OsuHelper.isOsu(create.record.text)) extra = true
          if (isfurry.length > 0 || extra) {
            reprocess_user = true
            logger(colours.FgPink + 'new osu ' + create.author + ' on matching ' + colours.FgGreen + isfurry.join(', '))
          }
        } else {
          if (user[0]['always'] == 1) {
            add = true
            reprocess_user = false
          }
        }

        if(create.record.text.includes("osu!") && !reprocess_user && !add) {
          // grrr
          reprocess_user = true;
        }

        if (reprocess_user == true) {
          const isfurryx: boolean = (OsuHelper.generalCheck(create.record.text).length > 0)
          const profile = await subscription.getUserData(create.author)

          logger('reprocessing ' + profile.data.handle)
          let protogen = false
          if (OsuHelper.isOsu(profile.data.displayName)) protogen = true
          if (OsuHelper.isOsuStrict(profile.data.description)) protogen = true
          if (OsuHelper.isOsuHashtag(profile.data.handle)) protogen = true
          if (OsuHelper.isOsu(profile.data.handle)) protogen = true

          if (protogen) add = true

          if (protogen) logger('👀 new osu! player - ' + profile.data.handle)

          const data = {
            'user': create.author,
            'always': protogen,
          }

          await subscription.db.execute('INSERT INTO `osu-users` (`did`, `always`)\n' +
            'VALUES (?, ?);', [data.user, data.always ? 1 : 0])
        }

        const textprotogen = OsuHelper.isOsu(create.record.text)
        if (textprotogen) add = true

        if (create.record?.reply && add) {
          const parentReplier = create.record?.reply.parent.uri.split('//')[1].split('/')[0]
          let [parentuser] = await subscription.db.execute('SELECT * FROM `osu-users` WHERE did = ?', [parentReplier])

          // @ts-ignore
          if (parentuser.length > 0) {
            if (parentuser[0].always == 0) add = false
          } else {
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
                             FROM \`osu-post\`
                             WHERE uri IN (${placeholders})`

    // Execute the query with the actual values
    await subscription.db.execute(deleteQuery, postsToDelete)
  }


  if (postsToCreate.length > 0) {
    const values = postsToCreate.map(post => [post.uri, post.cid, post.indexedAt])
    const insertQuery = `
            INSERT INTO \`osu-post\` (uri, cid, indexedAt)
            VALUES ?
            ON DUPLICATE KEY UPDATE cid       = VALUES(cid),
                                    indexedAt = VALUES(indexedAt)
        `
    await subscription.db.query(insertQuery, [values])
  }
}