import database from '../utils/database.js'
import colours from '../utils/colours.js'
import FurryHelper from '../utils/feed/FurryHelper.js'
import { BskyApi } from '../utils/bskyApi.js'

export default async function ProtogenProcessor(data, logger) {
  const postsToDelete = data.deletes.map((del) => del.uri)
  const postsToCreateWithFilter = []
  for (var create of data.creates) {
    try {
      var post = create;
      const endTime = new Date()
      const startTime = new Date(create.record.createdAt)
      const difference = endTime.getTime() - startTime.getTime() // This will give difference in milliseconds
      const resultInMinutes = Math.round(difference / 60000)
      const resultInSeconds = Math.round(difference / 1000) // Convert to seconds

      let blocked = false
      if (resultInSeconds > 999999) {
        blocked = true
      } else if (resultInSeconds > 60) {
        logger('running ' + resultInSeconds + ' seconds behind (' + resultInMinutes + ' mins)')
      }

      let add = false
      let reprocess_user = false



      let [user] = await database.execute('SELECT * FROM users WHERE did = ?', [create.author])

      //if (FurryHelper.isFurry(create.record.text).length > 0) logger(FurryHelper.isFurry(create.record.text))
      // @ts-ignore
      if (user.length < 1) {
        const isfurry = FurryHelper.isFurry(create.record.text)
        let extra = false
        if (FurryHelper.isProtogen(create.record.text)) extra = true
        if (isfurry.length > 0 || extra) {
          reprocess_user = true
          logger(colours.FgLightBlue + 'new furry ' + create.author + ' on matching ' + colours.FgGreen + isfurry.join(', '))
        } else {
          if (create.author.includes('3uyxuzj')) logger('!!!!!!!!! ' + create.author + ' is nota furry')
        }
      } else {
        if (user[0]['protogen'] == 1) {
          add = true
          reprocess_user = false
        }
        if (user[0]['blocked'] == 1) {
          blocked = true
        }
      }
      if (create.record.text.toLowerCase().replace('\'', '').includes('im a protogen!')) reprocess_user = true

      if (reprocess_user == true) {
        const isfurryx = (FurryHelper.isFurry(create.record.text).length > 0)
        const profile = await BskyApi.GetUserData(create.author)

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

        await database.execute('REPLACE INTO `users` (`did`, `furry`, `protogen`)\n' +
          'VALUES (?, ?, ?);', [data.user, data.furry ? 1 : 0, data.protogen ? 1 : 0])
      }

      const textprotogen = FurryHelper.isProtogen(create.record.text)
      if (textprotogen) add = true

      if (create.record?.reply && add) {
        add = false // no longer care about replies
      }


      var isArt = FurryHelper.isArt(create.record.text)
      if (!(create.record.embed && create.record.embed.$type === 'app.bsky.embed.images')) {
        isArt = false
      }

      if (isArt && add) {
        console.log('this is protogen art!', create.record)
      }

      if (create.record.text.toLowerCase().includes('gta6trailer')) add = false

      if (blocked) add = false

      if (add) logger('adding ; ' + create.record.text)

      if(add) {

        console.log(create);
      }
      postsToCreateWithFilter.push({
        shouldCreate: add,
        post: {
          uri: create.uri,
          cid: create.cid,
          indexedAt: new Date().toISOString(),
          art: isArt ? 1 : 0,
        },
      })
    } catch (e) {
      logger(e)
      postsToCreateWithFilter.push({
        shouldCreate: false,
        post: {
          uri: '',
          cid: '',
          indexedAt: new Date().toISOString(),
          art: 0,
        },
      })
    }
  }

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


    await database.execute(deleteQuery, postsToDelete)
  }


  if (postsToCreate.length > 0) {
    const values = postsToCreate.map(post => [post.uri, post.cid, post.indexedAt, post.art])
    const insertQuery = `
        INSERT INTO post (uri, cid, indexedAt, art)
        VALUES ?
        ON DUPLICATE KEY UPDATE cid       = VALUES(cid),
                                indexedAt = VALUES(indexedAt)
    `
    await database.query(insertQuery, [values])
  }
}
