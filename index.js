const inquirer = require("inquirer");
const mysql = require("mysql2");
const cTable = require("console.table");
require("dotenv").config();

const db = mysql.createConnection(
  {
    host: "localhost",
    // MySQL username,
    user: "root",
    // MySQL password
    password: process.env.PW,
    database: "tracker",
  },
  console.log(`Connected to the tracker database.`)
);

// Function to loop prompts
function anotherOne() {
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
          { name: "Add a department", value: "ADD DEPARTMENT" },
          { name: "Add a role", value: "ADD ROLE" },
          { name: "Add an employee", value: "ADD EMPLOYEE" },
          { name: "Update an employee", value: "UPDATE EMPLOYEE" },
          { name: "Exit", value: "EXIT" },
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
      if (response.choice === "ADD DEPARTMENT") {
        addDepartment();
      }
      if (response.choice === "ADD ROLE") {
        addRole();
      }
      if (response.choice === "ADD EMPLOYEE") {
        addEmployee();
      }
      if (response.choice === "UPDATE EMPLOYEE") {
        updateEmployee();
      }
      if (response.choice === "EXIT") {
        process.exit();
      }
    });
}

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

// Function to add Department
function addDepartment() {
  inquirer
    .prompt([
      {
        message: "What is the department name",
        name: "name",
      },
    ])
    .then((answer) => {
      db.query("INSERT INTO department SET ?", answer, function (err, results) {
        console.table(results);
        console.log("Department added successfully");
        anotherOne();
      });
    });
}

// Function to Add a Role
function addRole() {
  db.query("SELECT * FROM department", function (err, results) {
    const departments = results.map((department) => ({ name: department.name, value: department.id }));
    inquirer
      .prompt([
        {
          message: "What is the Role Title?",
          name: "title",
        },
        {
          message: "What is the Salary?",
          name: "salary",
        },
        {
          type: "list",
          message: "What department does the role belong to?",
          name: "department_id",
          choices: departments,
        },
      ])
      .then((answer) => {
        db.query("INSERT INTO role SET ?", answer, function (err, results) {
          console.log("Role added successfully");
          anotherOne();
        });
      });
  });
}

// Function to Add an Employee
function addEmployee() {
  db.query("SELECT * FROM employee", function (err, results) {
    const manager = results.map((manager) => ({ name: manager.first_name + " " + manager.last_name, value: manager.id }));
    db.query("SELECT * FROM role", function (err, results) {
      const role = results.map((role) => ({ name: role.title, value: role.id }));
      inquirer
        .prompt([
          {
            message: "What is the employee's first name?",
            name: "first_name",
          },
          {
            message: "What is the employee's last name?",
            name: "last_name",
          },
          {
            type: "list",
            message: "What role does this employee have?",
            name: "role_id",
            choices: role,
          },
          {
            type: "list",
            message: "Who is the employee's manager?",
            name: "manager_id",
            choices: manager,
          },
        ])
        .then((answer) => {
          console.log(answer);
          db.query("INSERT INTO employee SET ?", answer, function (err, results) {
            console.log("Employee added successfully");
            anotherOne();
          });
        });
    });
  });
}
// Function to Update an Employee
function updateEmployee() {
  db.query("SELECT * FROM employee", function (err, results) {
    const employee = results.map((employee) => ({ name: employee.first_name + " " + employee.last_name, value: employee.id }));
    db.query("SELECT * FROM role", function (err, results) {
      const role = results.map((role) => ({ name: role.title, value: role.id }));
      db.query("SELECT * FROM employee", function (err, results) {
        const manager = results.map((manager) => ({ name: manager.first_name + " " + manager.last_name, value: manager.id }));
        inquirer
          .prompt([
            {
              type: "list",
              message: "What would you like to update?",
              name: "update_selection",
              choices: ["role", "manager"],
            },
          ])
          .then((answer) => {
            console.log(answer.update_selection);
            if (answer.update_selection === "role") {
              inquirer
                .prompt([
                  {
                    type: "list",
                    message: "What employee do you want to update?",
                    name: "employee_id",
                    choices: employee,
                  },
                  {
                    type: "list",
                    message: "What is the new Role for this Employee?",
                    name: "role_id",
                    choices: role,
                  },
                ])
                .then((answer) => {
                  console.log(answer.role_id, answer.employee_id);
                  const params = [answer.role_id, answer.employee_id];
                  console.log(params);
                  db.query("UPDATE employee SET role_id = ? WHERE id = ?", params, function (err, results) {
                    console.log("Employee Role Updated successfully");
                  });
                });
            }
            if (answer.update_selection === "manager") {
              inquirer
                .prompt([
                  {
                    type: "list",
                    message: "What employee do you want to update?",
                    name: "employee_id",
                    choices: employee,
                  },
                  {
                    type: "list",
                    message: "Who is the new manager for this employee Employee?",
                    name: "manager_id",
                    choices: manager,
                  },
                ])
                .then((answer) => {
                  const params = [answer.manager_id, answer.employee_id];
                  db.query("UPDATE employee SET manager_id = ? WHERE id = ?", params, function (err, results) {
                    console.log("Employee Manager Updated successfully");
                  });
                });
            }
          });
      });
    });
  });
}

anotherOne();
