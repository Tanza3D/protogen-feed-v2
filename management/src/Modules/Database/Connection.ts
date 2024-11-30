// this doesn't follow the php counterpart very closely because
// the mysqli2 package has a nice enough syntax that i don't
// see the need

import * as mysql from "mysql2/promise";
import env from "../Env";

export namespace Database {
    export class Connection {
        public static db;
        constructor() {
            Connection.db = mysql.createPool({
                host: "localhost",
                user: env["mysqlUsername"],
                password: env["mysqlPassword"],
                database: "protogenfeed",
                connectionLimit: 10,
            });
        }
    }
}