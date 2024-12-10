import db from './database.js'

export default async (name, cursor, limit = 50) => {
  let whereClause = '';
  let queryParams = [];

  if (cursor) {
    const timeStr = new Date(parseInt(cursor, 10)).toISOString();
    whereClause = 'WHERE post.indexedAt < ?';
    queryParams.push(timeStr);
  }

  const query = `
    SELECT uri, indexedAt
    FROM post
    ${whereClause}
    ORDER BY post.indexedAt DESC, post.cid DESC
    LIMIT ?
  `;

  queryParams.push(limit);

  console.log(query, queryParams)
  const [rows] = await db.execute(query, queryParams);

  const feed = (rows).map((row) => ({
    post: row.uri,
  }));

  let newCursor;
  if (rows.length > 0) {
    const last = rows[rows.length - 1];
    newCursor = new Date(last.indexedAt).getTime().toString(10);
  }

  return {
    cursor: newCursor,
    feed,
  };
}