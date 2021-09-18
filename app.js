const db = require('./db/connection');
const cTable = require('console.table');
const inquirer = require('inquirer');
const { end } = require('./db/connection');

// The options a user can choose from
const actions = [
    {
        type: 'list',
        name: 'action',
        message: 'What would you like to do?',
        choices: ['View departments', 'View roles', 'View employees', 'Add a department', 'Add a role', 'Add an employee', 'Update employee role', 'Finish']
    }
];

// View departments
function viewDep() {
    const sql = `SELECT * FROM department`;
    db.query(sql, (err, rows) => {
        if (err) throw err;
        console.table(rows);
        chooseAction();
    })
};

// View roles 
function listRoles() {
    const sql = `SELECT role.id, role.title, role.salary, department.name AS department 
                FROM role
                LEFT JOIN department ON role.department_id = department.id`;
    db.query(sql, (err, rows) => {
        if (err) throw err;
        console.table(rows);
        chooseAction();
    })
};

// view all employees
function listEmployees() {
    const sql = `SELECT e.id, e.first_name, e.last_name, role.title AS position, 
                role.salary, department.name AS department, 
                concat(m.first_name, ' ', m.last_name) Manager
                FROM employee e
                LEFT JOIN role ON e.role_id = role.id
                LEFT JOIN department ON role.department_id = department.id
                LEFT JOIN employee m ON e.manager_id = m.id`;
    db.query(sql, (err, rows) => {
        if (err) throw err;
        console.table(rows);
        chooseAction();
    })
};

// Add a department
function addDep() {
    inquirer.prompt([
        {
            type: 'input',
            name: 'newDept',
            message: 'What is the name of the new department?'
        }
    ]).then(answer => {
        const sql = `INSERT INTO department (name) VALUES (?)`;
        const params = [answer.newDept];

        db.query(sql, params, (err, result) => {
            if (err) throw err;
            console.log('Added new department');
            chooseAction();
        });
    });
};

// Add a role
function addRole() {
    let deptObj = {};
    let deptArray = [];

    // Get current department names
    db.query('SELECT * FROM department', (err, rows) => {
        if (err) throw err;
        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            const key = row.name;
            const value = row.id;

            deptObj[key] = value;
            deptArray.push(key);
        }
    })

    console.log('Adding a new role:');
    inquirer.prompt([
        {
            type: 'input',
            name: 'title',
            message: 'What is the title of the new position?'
        },
        {
            type: 'number',
            name: 'salary',
            message: 'What is the salary for this role?'
        },
        {
            type: 'list',
            name: 'department',
            message: 'What department is this role in?',
            choices: deptArray
        }
    ]).then(responses => {
        const deptId = deptObj[responses.department];

        const sql = `INSERT INTO role (title, salary, department_id) VALUES (?,?,?)`;
        const params = [responses.title, responses.salary, deptId];

        db.query(sql, params, (err, result) => {
            if (err) throw err;
            console.log('Added a new role!');
            chooseAction();
        })
    });
};

// Add an employee
function addEmploy() {

    console.log('Adding a new employee:');
    getCurrentData()
        .then(dbResponse => {
            const roleArray = dbResponse.roleArr;
            const roleObj = dbResponse.roleObj;
            const managerArray = dbResponse.employeeArr;
            const managerObj = dbResponse.employeeObj;

            inquirer.prompt([
                {
                    type: 'input',
                    name: 'firstName',
                    message: "What is the employee's first name?"
                },
                {
                    type: 'input',
                    name: 'lastName',
                    message: 'What is their last name?'
                },
                {
                    type: 'list',
                    name: 'role',
                    message: 'What is their role?',
                    choices: roleArray
                },
                {
                    type: 'list',
                    name: 'manager',
                    message: 'Who is their manager?',
                    choices: managerArray
                }
            ]).then(responses => {
                const roleId = roleObj[responses.role];
                const managerId = managerObj[responses.manager];

                const sql = `INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?,?,?,?)`;
                const params = [responses.firstName, responses.lastName, roleId, managerId];

                db.query(sql, params, (err, result) => {
                    if (err) throw err;
                    console.log('Added a new employee!');
                    chooseAction();
                })
            })
        })
};

// update an employee's role
function updateRole() {

    getCurrentData()
        .then(dbResponse => {
            const roleArray = dbResponse.roleArr;
            const roleObj = dbResponse.roleObj;
            const employeeArray = dbResponse.employeeArr;
            const employeeObj = dbResponse.employeeObj;

            inquirer.prompt([
                {
                    type: 'list',
                    name: 'person',
                    message: 'Who would you like to update?',
                    choices: employeeArray
                },
                {
                    type: 'list',
                    name: 'position',
                    message: 'What is their new role?',
                    choices: roleArray
                }
            ]).then(responses => {
                const employId = employeeObj[responses.person];
                const roleId = roleObj[responses.position];

                const sql = `UPDATE employee SET role_id = ? WHERE id = ?`;
                const params = [roleId, employId];
                db.query(sql, params, (err, result) => {
                    if (err) throw err;
                    console.log('Update successfull');
                    chooseAction();
                })
            })
        })
};

function quit() {
    console.log('Press control + C to exit');
};

// queries the database for current employees and role, returns a promise
const getCurrentData = () => {
    return new Promise((resolve, reject) => {
        let employeeArray = [];
        let employeeObj = {};
        let roleArray = [];
        let roleObj = {};

        const employeeSql = `SELECT id, concat(first_name, ' ', last_name) manager FROM employee`;
        db.query(employeeSql, (err, rows) => {
            if (err) {
                reject(err);
                return;
            }
            for (let i = 0; i < rows.length; i++) {
                const key = rows[i].manager;
                const value = rows[i].id;

                employeeObj[key] = value;
                employeeArray.push(key);
            }
        })

        db.query('SELECT id, title FROM role', (err, rows) => {
            if (err) {
                reject(err);
                return;
            }
            for (let i = 0; i < rows.length; i++) {
                const key = rows[i].title;
                const value = rows[i].id;

                roleObj[key] = value;
                roleArray.push(key);
            }
            resolve({
                ok: true,
                employeeObj: employeeObj,
                employeeArr: employeeArray,
                roleObj: roleObj,
                roleArr: roleArray
            });
        })
    });
}

// Ask what the user would like to do and redirect
function chooseAction() {
    inquirer.prompt(actions)
        .then(answer => {
            switch (answer.action) {
                case 'View departments': viewDep();
                    break;
                case 'View employees': listEmployees();
                    break;
                case 'View roles': listRoles();
                    break;
                case 'Add a department': addDep();
                    break;
                case 'Add a role': addRole();
                    break;
                case 'Add an employee': addEmploy();
                    break;
                case 'Update employee role': updateRole();
                    break;
                case 'Finish': quit();
            }

        });
};

// Initialize and connect to database
function init() {
    db.connect(err => {
        if (err) throw err;
        console.log("Let's get started");
        chooseAction();
    })
};

init();