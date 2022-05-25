const mysql = require('mysql2');
const inquirer = require('inquirer');
const consoleTable = require('console.table');
const connection = require('./config/connection');

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
const addEmployeeQ = ['What is employees first name?', 'What is the employees last name?', 'What is the employees role?', 'Who is this employees manager?']

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
                showAll();
                break;
            case 'View all Employees by Department':
                showByDepartment();
                break;
            case 'View all Employees by Manager':
                showByManager();
                break;
            case 'Add Employee':
                addEmployeeQ();
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
                viewDepartments();
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

