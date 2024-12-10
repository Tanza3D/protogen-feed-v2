import db from './database.js'


const feeds = {
  'protogens': () => ({
    table: 'post',
    where: [],
    params: [],
  }),
  'protogens-art': () => ({
    table: 'post',
    where: ['art = ?'],
    params: [1],
  }),
  'osusky': () => ({
    table: 'osu-post',
    where: [],
    params: [],
  }),
  'osufeed-test': () => ({
    table: 'post',
    where: [],
    params: [],
  }),
}

export default async (name, cursor, limit = 50) => {
  if (!(name in feeds)) {
    return // nuh uh
  }

  const { table, where, params } = feeds[name]()
  const queryParams = [...params]

  if (cursor) {
    const timeStr = new Date(parseInt(cursor, 10)).toISOString()
    where.push('post.indexedAt < ?')
    queryParams.push(timeStr)
  }

  const whereClause = where.length > 0 ? 'WHERE ' + where.join(' AND ') : ''

  const query = `
      SELECT uri, indexedAt
      FROM \`${table}\`
          ${whereClause}
      ORDER BY \`${table}\`.indexedAt DESC, \`${table}\`.cid DESC
      LIMIT ?
  `

  queryParams.push(limit)

  const [rows] = await db.execute(query, queryParams)

  const feed = (rows).map((row) => ({
    post: row.uri,
  }))

  let newCursor
  if (rows.length > 0) {
    const last = rows[rows.length - 1]
    newCursor = new Date(last.indexedAt).getTime().toString(10)
  }

  return {
    cursor: newCursor,
    feed,
  }
}