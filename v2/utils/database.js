import mysql from 'mysql2/promise'
import config from './config.js'

const connection = mysql.createPool(config.db);

export default connection;