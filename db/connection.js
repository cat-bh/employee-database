const mysql = require('mysql2');

require('dotenv').config();

const db = mysql.createConnection(
    {
        host: 'localhost',
        user: process.env.DB_USER,
        // Your password here
        password: process.env.DB_PW,
        database: process.env.DB_NAME
    },
    console.log('Connected to the database')
);

module.exports = db;