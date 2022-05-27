const mysql = require('mysql2');

connection = mysql.createConnection({
    host: 'localHost',
    port: 3306,
    user: 'root',
    password: 'MarLey2015!!',
    database: 'employee_tracker',
    multipleStatements: true
});

connection.connect((err) => {
    if (err) {
        console.log(err);
        return;
    }
    console.log('Connected to the database.');
});

module.exports = connection;