// Object to store the last time each user pushed an analytic
const userLastPushTime = {};

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
