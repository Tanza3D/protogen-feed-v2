import { FurryHelper } from '../furryhelper'
import { FirehoseSubscription } from '../subscription'
import colours from '../colours'

export async function ProtogenProcessor(ops, subscription: FirehoseSubscription, logger: Function) {
  const postsToDelete = ops.posts.deletes.map(del => del.uri)

  const postsToCreateWithFilter = await Promise.all(
    ops.posts.creates.map(async (create) => {
      try {
        const record = create.record
        const createdAt = new Date(record.createdAt)
        const now = Date.now()
        const elapsedSeconds = Math.round((now - createdAt.getTime()) / 1000)

        if (elapsedSeconds > 999999) return { shouldCreate: false, post: null }
        if (elapsedSeconds > 60) logger(`running ${elapsedSeconds} seconds behind (${Math.round(elapsedSeconds / 60)} mins)`)

        const user = (await subscription.db.execute('SELECT * FROM users WHERE did = ?', [create.author]))[0]
        let shouldCreate = false
        let reprocessUser = false
        let isBlocked = false

        if (!user) {
          const isFurry = FurryHelper.isFurry(record.text).length > 0
          const isProtogen = FurryHelper.isProtogen(record.text)

          if (isFurry || isProtogen) {
            reprocessUser = true
            logger(`${colours.FgLightBlue}new furry ${create.author} on matching ${colours.FgGreen}${isFurry ? 'furry' : 'protogen'}`)
          }
        } else {
          if (user.protogen === 1) shouldCreate = true
          if (user.blocked === 1) isBlocked = true
        }

        if (record.text.toLowerCase().replace("'", "").includes("im a protogen!")) {
          reprocessUser = true
        }

        if (reprocessUser) {
          const profile = await subscription.getUserData(create.author)
          logger(`reprocessing ${profile.data.handle}`)

          const isProtogen = [
            FurryHelper.isProtogen(profile.data.displayName),
            FurryHelper.isProtogenStrict(profile.data.description),
            FurryHelper.isProtogenTag(profile.data.handle),
            FurryHelper.isProtogen(profile.data.handle)
          ].some(Boolean)

          const isFurry = FurryHelper.isFurry(record.text).length > 0
          shouldCreate = isProtogen

          if (isProtogen) logger(`that's a new protogen :D - ${profile.data.handle}`)

          await subscription.db.execute(
            'REPLACE INTO `users` (`did`, `furry`, `protogen`) VALUES (?, ?, ?)',
            [create.author, isFurry ? 1 : 0, isProtogen ? 1 : 0]
          )
        }

        if (isBlocked) shouldCreate = false
        if (record.text.toLowerCase().includes("gta6trailer")) shouldCreate = false
        if (record.reply) shouldCreate = false

        const isArt = record.embed?.$type === "app.bsky.embed.images" && FurryHelper.isArt(record.text)
        if (isArt) logger("this is protogen art!", record)

        return shouldCreate ? {
          shouldCreate: true,
          post: {
            uri: create.uri,
            cid: create.cid,
            indexedAt: new Date().toISOString(),
            art: isArt ? 1 : 0
          }
        } : { shouldCreate: false, post: null }
      } catch (error) {
        logger(error)
        return { shouldCreate: false, post: null }
      }
    })
  )

  const postsToCreate = postsToCreateWithFilter
    .filter(({ shouldCreate }) => shouldCreate)
    .map(({ post }) => post)

  if (postsToDelete.length > 0) {
    const deleteQuery = `DELETE FROM post WHERE uri IN (${postsToDelete.map(() => '?').join(', ')})`
    await subscription.db.execute(deleteQuery, postsToDelete)
  }

  if (postsToCreate.length > 0) {
    const values = postsToCreate.map(({ uri, cid, indexedAt, art }) => [uri, cid, indexedAt, art])
    const insertQuery = `
      INSERT INTO post (uri, cid, indexedAt, art)
      VALUES ?
      ON DUPLICATE KEY UPDATE
        cid = VALUES(cid),
        indexedAt = VALUES(indexedAt)
    `
    await subscription.db.query(insertQuery, [values])
  }
}
