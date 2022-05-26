const mysql = require('mysql2');
const inquirer = require('inquirer');
const consoleTable = require('console.table');
const connection = require('./config/connection');

// Choices that show up in console 
const startConsoleView = ['View all Employees', 'View all Emplyees by Department', 'View all Employees by Manager', 'Add Employee', 'Remove Employee', 'Update Employee Role', 'View all Roles', 'Add Role', 'Remove Role', 'View all Departments', 'Add Department', 'Remove Department', 'Exit'];

// Query to retireve all employees
const employeeQuery = `SELECT employee_id, employee.first_name AS "First Name", employee.last_name AS "Last Name", role.title, department.department_name AS "Department", IFNULL(role.salary, "No Data") AS "Salary", CONCAT(m.first_name," ", m.lsat_name) AS "Manager"
                        FROM employee
                        LEFT JOIN role
                        ON role.id = employee.role_id
                        LEFT JOIN department
                        ON department.id = role.department_id
                        LEFT JOIN employee m ON m.id = employee.manager_id
                        ORDER BY employee.id;`

// Questions asked when adding an employee
const addEmployeeQuestions = ['What is employees first name?', 'What is the employees last name?', 'What is the employees role?', 'Who is this employees manager?']

// Selects from roles 
const roleQ = `SELECT * FROM roles; SELECT CONCAT (employee.first_name," ", employee.last_name) AS full_name FROM employee;`

// Selects managers
const managerQ = `SELECT CONCAT (employee.first_name," ", employee.last_name) AS full_name, role.title, department.department_name FROM employee INNER JOIN role ON role.id = employee.role_id INER JOIN department ON department.id = role.department_id WHERE department_name = "Management";`

const start = () => {
    inquirer.prompt({
        name: 'Choices',
        type: 'list',
        message: 'Select an option',
        choices: startConsoleView
    }) .then((answer) => {
        switch (answer.Choices) {
            case 'View all Employees':
                showAllEmployees();
                break;
            case 'View all Employees by Department':
                showEmployeeByDepartment();
                break;
            case 'View all Employees by Manager':
                showEmployeeByManager();
                break;
            case 'Add Employee':
                addEmployee();
                break;
            case 'Remove Employee':
                removeEmployee();
                break;
            case 'Update Employee Role':
                updateEmployee();
                break;
            case 'View all Roles':
                viewRoles();
                break;
            case 'ADD Role':
                addRole();
                break;
            case 'Remove Role':
                removeRole();
                break;
            case 'View all Departments':
                viewAllDepartments();
                break;
            case 'Add Department':
                addDepartment();
                break;
            case 'Remove Department':
                removeDepartment();
                break;
            case 'Exit':
                connection.end();
                break;
        }
    })
}

// Function to show all employees
const showAllEmployees = () => {
    connection.query(employeeQuery, (err, result) => {
        if (err) throw err;
        console.log(' ');
        console.log(('All employees'), result)
        start();
    })
}

// Function to show Employees by Department
const showEmployeeByDepartment = () => {
    const departmentQuery = `SELECT * FROM department`;

    connection.query(departmentQuery, (err, result) =>{
        if (err) throw err;

        inquirer.prompt([
            {
                name: 'departmentChoice',
                type: 'list',
                choices: function () {
                    let choiceArray = result.map(choice => choice.department_name)
                    return choiceArray;
                },
                message: 'Select the Department you wish to view:'
            }
        ]).then((answer) => {
            let chosenDepartment;
            
            for (let i = 0; i < result.length; i++) {
                if (result[i].department_name === answer.departmentChoice) {
                    chosenDepartment = result[i];
                }
            }

            const query = `SELECT employee.id, employee.first_name AS "First Name", employee.last_name AS "Last Name", role.title AS "Title", department.department_name AS "Department", role.salary AS "Salary", FROM employee INNER JOIN role ON role.id = employee.role_id INNER JOIN department ON department.id = role.department_id Where ?;`;
            connection.query(query, { department_name: chosenDepartment_name }, (err, res) => {
                if (err) throw err;
                console.log(' ');
                console.table((`All Employees by Department: ${chosenDepartment_name }`), res)
                start();
            })
        })
    })
}

// Function to show employees by manager 
const showEmployeeByManager = () => {
    connection.query(managerQ, (err, result) => {
        if (err) throw err;

        inquirer.prompt([
            {
                name: 'manager_choice',
                type: 'list',
                choices: function () {
                    let choiceArray = result.map(choice => choice.full_name);
                    return choiceArray;
                },
                message: 'Select the Manager whos staff you wish to see:'
            }
        ]).then((answer) => {
            const managerQ2 = `SELECT employee.id, employee.first_name AS "First Name", employee.last_name AS "Last Name", IFNULL(role.title, "No Data") AS "Title", IFNULL(department.department_name, "No Data") AS "Department", IFNULL(role.salary, "No Data") AS "Salary", CONCAT(m.first_name," ",m.last_name) AS "MAnager"
                                FROM employee
                                LEFT JOIN role
                                ON role.id = employee.role_id
                                LEFT JOIN department
                                ON department.id = role.department_id
                                LEFT JOIN employee m ON m.id = employee.manager_id
                                WHERE CONCAT(m.first_name," ",m.last_name) = ?
                                ORDER BY employee.id;`
            connection.query(managerQ2, [answer.manager_choice], (err, result) => {
                if (err) throw err;
                console.log(' ');
                console.table(('Employees by MAnager'), result);
                start();
            })
        })
    })
}


// Function to add employees to database
const addEmployee = () => {
    connection.query(roleQ, (err, result) => {
        if (err) throw err;

        inquirer.prompt([
            {
                name: 'fName',
                type: 'input',
                message: addEmployeeQuestions[0]
            },
            {
                name: 'lName',
                type: 'input',
                choice: addEmployeeQuestions[1]
            },
            {
                name: 'role',
                type: 'list',
                choices: function () {
                    let choiceArray = result[0].map(choice => choice.title);
                    return choiceArray;
                },
                message: addEmployeeQuestions[2]
            },
            {
                name: 'manager',
                type: 'list',
                choices: function () {
                    let choiceArray = result[1].map(choice => choice.full_name);
                    return choiceArray;
                },
                message: addEmployeeQuestions[3]
            }
        ]).then((answer) => {
            connection.query(
                `INSERT INTO employees(first_name, last_name, role_id, manager_id) VALUES(?, ?, 
                (SELECT id FROM roles WHERE title = ? ), 
                (SELECT id FROM (SELECT id FROM employees WHERE CONCAT(first_name," ",last_name) = ? ) AS tmptable))`, [answer.fName, answer.lName, answer.role, answer.manager]
            )
            start();
        })
    })
}

// Function to remove employees from database