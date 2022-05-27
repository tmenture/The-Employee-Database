const mysql = require('mysql2');
const inquirer = require('inquirer');
const consoleTable = require('console.table');
const connection = require('./config/connection');

// Choices that show up in console 
const startConsoleView = ['View all Employees', 'View all Emplyees by Department', 'View all Employees by Manager', 'Add Employee', 'Remove Employee', 'Update Employee Role', 'View all Roles', 'Add Role', 'Remove Role', 'View all Departments', 'Add Department', 'Remove Department', 'Exit'];

// Query to retireve all Employees
const employeeQuery = `SELECT employee.id, employee.first_name AS "First Name", employee.last_name AS "Last Name", roles.title, department.department_name AS "Department", 
                        IFNULL(roles.salary, "No Data") AS "Salary", CONCAT(m.first_name," ", m.last_name) AS "Manager"
                        FROM employee
                        LEFT JOIN roles
                        ON roles.id = employee.roles_id
                        LEFT JOIN department
                        ON department.id = roles.department_id
                        LEFT JOIN employee m ON m.id = employee.manager_id
                        ORDER BY employee.id;`

// Questions asked when adding an Employee
const addEmployeeQuestions = ['What is employees first name?', 'What is the employees last name?', 'What is the employees role?', 'Who is this employees manager?']

// Selects from Roles 
const roleQ = `SELECT * FROM roles; SELECT CONCAT (employee.first_name," ", employee.last_name) AS full_name FROM employee;`

// Selects Managers
const managerQ = `SELECT CONCAT (employee.first_name," ", employee.last_name) AS full_name, roles.title, department.department_name FROM employee 
                INNER JOIN roles ON roles.id = employee.roles_id INNER JOIN department ON department.id = roles.department_id WHERE department_name = "Management";`

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

// Function to run query and show all Employees
const showAllEmployees = () => {
    connection.query(employeeQuery, (err, result) => {
        if (err) throw err;
        console.log(' ');
        console.table(('All employees'), result)
        start();
    })
}

// Function to run query and show Employees by Department
const showEmployeeByDepartment = () => {
    const departmentQuery = `SELECT * FROM department;`;

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

            const query = `SELECT employee.id, employee.first_name AS "First Name", employee.last_name AS "Last Name", roles.title AS "Title", 
                        department.department_name AS "Department", roles.salary AS "Salary", FROM employee INNER JOIN roles ON roles.id = employee.roles_id 
                        INNER JOIN department ON department.id = roles.department_id Where ?;`;
            connection.query(query, { department_name: chosenDepartment.department_name }, (err, res) => {
                if (err) throw err;
                console.log(' ');
                console.table((`All Employees by Department: ${ chosenDepartment.department_name }`), res)
                start();
            })
        })
    })
}

// Function to run query and show Employees by Manager 
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
            const managerQ2 = `SELECT employee.id, employee.first_name AS "First Name", employee.last_name AS "Last Name", IFNULL(roles.title, "No Data") AS "Title", 
                                IFNULL(department.department_name, "No Data") AS "Department", IFNULL(roles.salary, "No Data") AS "Salary", CONCAT(m.first_name," ",m.last_name) AS "Manager"
                                FROM employee
                                LEFT JOIN roles
                                ON roles.id = employee.roles_id
                                LEFT JOIN department
                                ON department.id = roles.department_id
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


// Function to run query and add an employee to the database
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
                `INSERT INTO employees(first_name, last_name, roles_id, manager_id) VALUES(?, ?, (SELECT id FROM roles WHERE title = ? ), 
                (SELECT id FROM (SELECT id FROM employees WHERE CONCAT(first_name," ",last_name) = ? ) AS tmptable))`, [answer.fName, answer.lName, answer.role, answer.manager]
            )
            start();
        })
    })
}

// Function to run query and remove an employee from the database
const removeEmployee = () => {
    connection.query(employeeQuery, (err, result) => {
        if (err) throw err;
        console.log(' ');
        console.table(('All Employes'), result)

        inquirer.prompt([
            {
                name: 'idRemove',
                type: 'input',
                message: 'Enter the employee id of the employee you wish to remove:'
            }
        ]).then((answer) => {
            connection.query(`DELETE FROM employee WHERE ?`, { id: answer.idRemove });
            start();
        })
    })
}

// Function to run query and update an employees role
const updateEmployee = () => {
    const query = `SELECT CONCAT (first_name," ",last_name) AS full_name FROM employee; SELECT title FROM roles`

    connection.query(query, (err, result) => {
        if (err) throw err;
        
        inquirer.prompt([
            {
                name: 'emp',
                type: 'list',
                choices: function () {
                    let choiceArray = result[0].map(choice => choice.full_name);
                    return choiceArray;
                },
                message: 'Select the employee whos role you want to update:'
            },
            {
                name: 'nRole',
                type: 'list',
                choices: function () {
                    let choiceArray = result[1].map(choice => choice.title);
                    return choiceArray;
                }
            }
        ]).then((answer) => {
            connection.query(`UPDATE employee SET roles_id = (SELECT id FROM roles WHERE title = ?) 
                            WHERE id = (SELECT id FROM (SELECT id FROM employee WHERE CONCAT (first_name," ",last_name) = ?) AS tmptable)`, [answer.nRole, answer.emp], (err, result) => {
                if (err) throw err;
                start();
            })
        })
    })
}

// Funciton to run query and view all roles 
const viewRoles = () => {
    let query = `SELECT title AS "Title" FROM roles`;
    connection.query(query, (err, result) => {
        if (err) throw err;
        console.log(' ');
        console.table(('All Roles Listed:'), result);
        start();
    }) 
}

// Function to run query and add a role to the database
const addRole = () => {
    const query = `SELECT * FROM roles; SELECT * From department`

    connection.query(query, (err, result) => {
        if (err) throw err;

        console.log(' ');
        console.table(('List of current Roles:'), result[0]);

        inquirer.prompt([
            {
                name: 'nTitle',
                type: 'input',
                message: 'Enter the title of the role you want to add:'
            },
            {
                name: 'nSalary',
                type: 'input',
                message: 'Enter the salary for the new role:'
            },
            {
                name: 'dept',
                type: 'list',
                choices: function () {
                    let choiceArray = results[1].map(choice => choice.department_name);
                    return choiceArray;
                },
                message: 'Select the department for the new role:'
            }
        ]).then((answer) => {
            connection.query(
                `INSERT INTO roles (title, salary, department_id)
                VALUES
                ("${answer.nTitle}", "${answer.nSalary}", (SELECT id FROM department WHERE department_name = "${answer.dept}"));`
            )
            start();
        })
    })
}

// Function to run query and remove a role from the database
const removeRole = () => {
    const query = `SELECT * FROM roles`;
    
    connection.query(query, (err, result) => {
        if (err) throw err;

        inquirer.prompt([
            {
                name: 'remRole',
                type: 'list',
                choices: function () {
                    let choiceArray = result.map(choice => choice.title);
                    return choiceArray;
                },
                message: 'Select the role you want to remove:'
            }
        ]).then((answer) => {
            connection.query(`DELETE FROM roles WHERE ?`, { title: answer.remRole });
            start();
        })
    })
}

// Function to run query and view all departments in the database
const viewAllDepartments = () => {
   const query = `SELECT department_name AS "Department" FROM department`;
    connection.query(query, (err, result) => {
        if (err) throw err;

        console.log(' ');
        console.table(('All Departments listed:'), result)
        start();
    })
}

// Function to run query and add a department to the database
const addDepartment = () => {
    const query = `SELECT department_name AS "Department" FROM department`;

    connection.query(query, (err, result) => {
        if (err) throw err;

        console.log(' ');
        console.table(('List of current Departments:'), result);

        inquirer.prompt([
            {
                name: 'nDept',
                type: 'input',
                message: 'Enter the name of the new Department:'
            }
        ]).then((answer) => {
            connection.query(`INSERT INTO department(department_name) VALUES( ? )`, answer.nDept)
            start();
        })
    })
}

// Function to run query and remove a department from the database
const removeDepartment = () => {
    const query = `SELECT * FROM department`;

    connection.query(query, (err, result) => {
        if (err) throw err;

        inquirer.prompt([
            {
                name: 'department',
                type: 'list',
                choices: function () {
                    let choiceArray = result.map(choice => choice.department_name);
                    return choiceArray;
                },
                message: 'Select the Department you woule like to remove:'
            }
        ]).then((answer) => {
            connection.query(`DELETE FROM department WHERE ?`, { department_name: answer.deparment })
            start();
        })
    })
}

start();