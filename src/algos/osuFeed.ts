import { QueryParams } from '../lexicon/types/app/bsky/feed/getFeedSkeleton'
import { AppContext } from '../config'

// max 15 chars
export const shortname = 'osufeed-test'

export const handler = async (ctx: AppContext, params: QueryParams) => {
  const limit = params.limit;
  let whereClause = '';
  let queryParams: any[] = [];

  if (params.cursor) {
    const timeStr = new Date(parseInt(params.cursor, 10)).toISOString();
    whereClause = 'WHERE indexedAt < ?';
    queryParams.push(timeStr);
  }

  const query = `
    SELECT *
    FROM \`osu-post\`
    ${whereClause}
    ORDER BY indexedAt DESC, cid DESC
    LIMIT ?
  `;

  queryParams.push(limit);

  const [rows] = await ctx.db.execute(query, queryParams);

  const feed = (rows as any[]).map((row) => ({
    post: row.uri,
  }));

  let cursor: string | undefined;
  // @ts-ignore
  if (rows.length > 0) {
    // @ts-ignore
    const last = rows[rows.length - 1];
    cursor = new Date(last.indexedAt).getTime().toString(10);
  }

  return {
    cursor,
    feed,
  };
};