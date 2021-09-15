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
    let deptObj = { };
    let deptArray = [];

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

};

// update an employee's role
function updateRole() {

};

function quit() {
    console.log('Press control + C to exit');
};

// Ask what the user would like to do and redirect
function chooseAction() {
    inquirer.prompt(actions)
        .then(answer => {
            switch(answer.action) {
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