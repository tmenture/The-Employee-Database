const mysql = require('mysql2');

require('dotenv').config();

const db = mysql.createconnection (
    {
        host: 'localhost',
        user: 'root',
        password: 'MarLey2015!!',
        database: 'election'
    },
    console.log('Connected to the employee tracker database')
);

module.exports = db;