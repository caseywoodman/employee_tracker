const inquirer = require("inquirer");
const mysql = require("mysql2");
const cTable = require("console.table");

const db = mysql.createConnection(
  {
    host: "localhost",
    // MySQL username,
    user: "root",
    // MySQL password
    password: "password",
    database: "tracker",
  },
  console.log(`Connected to the tracker database.`)
);

// Function to View Departments
function viewDepartments() {
  db.query("SELECT * FROM department", function (err, results) {
    console.table(results);
  });
}

// Function to View Roles
function viewRoles() {
  db.query("SELECT * FROM role", function (err, results) {
    console.table(results);
  });
}

// Function to View Employees
function viewEmployees() {
  db.query("SELECT * FROM employee", function (err, results) {
    console.table(results);
  });
}

inquirer
  .prompt([
    {
      type: "list",
      message: "What would you like to do?",
      name: "choice",
      choices: [
        { name: "View all departments", value: "VIEW DEPARTMENTS" },
        { name: "View all roles", value: "VIEW ROLES" },
        { name: "View all employees", value: "VIEW EMPLOYEES" },
      ],
    },
  ])

  .then((response) => {
    if (response.choice === "VIEW DEPARTMENTS") {
      viewDepartments();
    }
    if (response.choice === "VIEW ROLES") {
      viewRoles();
    }
    if (response.choice === "VIEW EMPLOYEES") {
      viewEmployees();
    }
  });
