import db from "./database.js";

const userLastPushTime = {};
var dataCache = null;

export async function PushAnalytic(user, feed) {
    const currentTime = Date.now();
    const oneMinuteAgo = 60 * 1000;

    if (userLastPushTime[user] && currentTime - userLastPushTime[user] < oneMinuteAgo) {
        return; // oh well
    }

    userLastPushTime[user] = currentTime;

    await db.execute(`
        INSERT INTO \`analytics\` (\`feed\`, \`user\`, \`time\`)
        VALUES (?, ?, now());
    `, [feed, user]);
}

export async function AggregateDailyViews(date) {
    const day = date.toISOString().split('T')[0]; // "YYYY-MM-DD"
    const today = new Date().toISOString().split('T')[0];

    if (day === today) {
        console.log(`Skipping aggregation for current day: ${day}`);
        return;
    }

    await db.execute(`
        DELETE FROM daily_feed_views
        WHERE day = ?
    `, [day]);

    await db.execute(`
        INSERT INTO daily_feed_views (feed, day, views)
        SELECT 
            feed, 
            DATE(time) as day, 
            COUNT(*) as views
        FROM analytics
        WHERE DATE(time) = ?
        GROUP BY feed
    `, [day]);

    dataCache = null;
}


export async function FillEmptyDays() {
    const [rangeRows] = await db.execute(`
        SELECT 
            MIN(DATE(time)) AS earliest, 
            MAX(DATE(time)) AS latest 
        FROM analytics;
    `);

    const { earliest, latest } = rangeRows[0];
    if (!earliest || !latest) return; // no analytics yet

    const startDate = new Date(earliest);
    const endDate = new Date(latest);

    const [existingRows] = await db.execute(`
        SELECT DISTINCT day FROM daily_feed_views;
    `);

    const existingDays = new Set(existingRows.map(row => row.day.toISOString().split('T')[0]));

    for (
      let d = new Date(startDate);
      d <= endDate;
      d.setDate(d.getDate() + 1)
    ) {
        const dayStr = d.toISOString().split('T')[0];
        if (!existingDays.has(dayStr)) {
            await AggregateDailyViews(new Date(dayStr));
        }
    }
}

export function InitAnalytics() {
    FillEmptyDays();

    const now = new Date();
    const msUntilMidnightUTC = new Date(Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate() + 1,
      0, 0, 0, 0
    )) - now;

    setTimeout(() => {
        FillEmptyDays();
        AggregateDailyViews(getYesterday());

        setInterval(() => {
            FillEmptyDays();
            AggregateDailyViews(getYesterday());
            // we run this every 24 hours from this point on !!
        }, 24 * 60 * 60 * 1000);

    }, msUntilMidnightUTC);
}

function getYesterday() {
    const now = new Date();
    now.setUTCDate(now.getUTCDate() - 1);
    now.setUTCHours(1, 0, 0, 0); // just in case timezone shenanigans
    return now;
}
export async function GetData() {
    if(dataCache !== null) return dataCache;
    const [rows] = await db.execute(`
        SELECT feed, day, views
        FROM daily_feed_views;
    `);
    dataCache = rows;

    return dataCache;

}