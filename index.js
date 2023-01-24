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
function mainMenu() {
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
          { name: "View Employees By Department", value: "VIEW EMPLOYEES BY DEPARTMENT" },
          { name: "View Employees By Manager", value: "VIEW EMPLOYEES BY MANAGER" },
          { name: "Delete a Department", value: "DELETE A DEPARTMENT" },
          { name: "Delete a Role", value: "DELETE A ROLE" },
          { name: "Delete a Employee", value: "DELETE AN EMPLOYEE" },
          { name: "View a departments salary budget", value: "SEE A DEPARTMENTS BUDGET" },
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
      if (response.choice === "VIEW EMPLOYEES BY DEPARTMENT") {
        viewEmployeesByDepartment();
      }
      if (response.choice === "VIEW EMPLOYEES BY MANAGER") {
        viewEmployeesByManager();
      }
      if (response.choice === "DELETE A DEPARTMENT") {
        deleteDepartment();
      }
      if (response.choice === "DELETE A ROLE") {
        deleteRole();
      }
      if (response.choice === "DELETE AN EMPLOYEE") {
        deleteEmployee();
      }
      if (response.choice === "SEE A DEPARTMENTS BUDGET") {
        viewBudgetByDepartment();
      }
      if (response.choice === "EXIT") {
        process.exit();
      }
    });
}

// Function to ask if completed or Main Menu
function anotherOne() {
  inquirer
    .prompt([
      {
        type: "list",
        message: "What would you like to do now?",
        name: "choice",
        choices: [
          { name: "Main Menu", value: "MAIN MENU" },
          { name: "Exit", value: "EXIT" },
        ],
      },
    ])

    .then((response) => {
      if (response.choice === "MAIN MENU") {
        mainMenu();
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
    anotherOne();
  });
}

// Function to View Roles
function viewRoles() {
  db.query("SELECT role.id, role.title AS job_title, department.name AS department, role.salary FROM role LEFT JOIN department ON role.department_id = department.id", function (err, results) {
    console.table(results);
    anotherOne();
  });
}

// Function to View Employees
function viewEmployees() {
  db.query("SELECT employee.id, employee.first_name, employee.last_name, role.title, department.name AS department, role.salary, CONCAT(manager.first_name, ' ', manager.last_name) AS manager FROM employee LEFT JOIN role on employee.role_id = role.id LEFT JOIN department on role.department_id = department.id LEFT JOIN employee manager on manager.id = employee.manager_id;", function (err, results) {
    console.table(results);
    anotherOne();
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
    manager.unshift({ name: "none", value: null });
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
        manager.unshift({ name: "none", value: null });
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
                  const params = [answer.role_id, answer.employee_id];

                  db.query("UPDATE employee SET role_id = ? WHERE id = ?", params, function (err, results) {
                    console.log("Employee Role Updated successfully");
                    anotherOne();
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
                    anotherOne();
                  });
                });
            }
          });
      });
    });
  });
}

// Function to see Employees by Department
function viewEmployeesByDepartment() {
  db.query("SELECT * FROM department", function (err, results) {
    const departments = results.map((department) => ({ name: department.name, value: department.id }));
    inquirer
      .prompt([
        {
          type: "list",
          message: "What department?",
          name: "department_id",
          choices: departments,
        },
      ])
      .then((answer) => {
        db.query('SELECT employee.id as ID, concat(first_name, " ", last_name) AS NAME FROM employee JOIN role ON  role.id = employee.role_id WHERE department_id = ?', answer.department_id, function (err, results) {
          console.table(results);
          anotherOne();
        });
      });
  });
}

// Function to see Employees by manager
function viewEmployeesByManager() {
  db.query("SELECT * FROM employee", function (err, results) {
    const manager = results.map((manager) => ({ name: manager.first_name + " " + manager.last_name, value: manager.id }));
    inquirer
      .prompt([
        {
          type: "list",
          message: "Who is the manager you want to search?",
          name: "manager_id",
          choices: manager,
        },
      ])
      .then((answer) => {
        db.query('SELECT id, concat(first_name, " ", last_name) AS name FROM employee WHERE manager_id = ?', answer.manager_id, function (err, results) {
          if (results.length > 0) {
            console.table(results);
            anotherOne();
          } else {
            console.log(`Employee is not a manager`);
            anotherOne();
          }
        });
      });
  });
}

// Function to Delete a Department
function deleteDepartment() {
  db.query("SELECT * FROM department", function (err, results) {
    const departments = results.map((department) => ({ name: department.name, value: department.id }));
    inquirer
      .prompt([
        {
          type: "list",
          message: "What department are you deleting?",
          name: "department_id",
          choices: departments,
        },
      ])
      .then((answer) => {
        db.query("DELETE FROM department WHERE id = ?", answer.department_id, function (err, results) {
          console.log("Department deleted successfully");
          anotherOne();
        });
      });
  });
}

// Function to Delete a Role
function deleteRole() {
  db.query("SELECT * FROM role", function (err, results) {
    const roles = results.map((role) => ({ name: role.title, value: role.id }));
    inquirer
      .prompt([
        {
          type: "list",
          message: "What Role are you deleting?",
          name: "id",
          choices: roles,
        },
      ])
      .then((answer) => {
        db.query("DELETE FROM role WHERE id = ?", answer.id, function (err, results) {
          console.log("Role deleted successfully");
          anotherOne();
        });
      });
  });
}

// Function to Delete an Employee
function deleteEmployee() {
  db.query("SELECT * FROM employee", function (err, results) {
    const employees = results.map((employee) => ({ name: employee.first_name + " " + employee.last_name, value: employee.id }));
    inquirer
      .prompt([
        {
          type: "list",
          message: "What Employee are you deleting?",
          name: "id",
          choices: employees,
        },
      ])
      .then((answer) => {
        db.query("DELETE FROM employee WHERE id = ?", answer.id, function (err, results) {
          console.log("Employee deleted successfully");
          anotherOne();
        });
      });
  });
}

// Function to see Employees by Department
function viewBudgetByDepartment() {
  db.query("SELECT * FROM department", function (err, results) {
    const departments = results.map((department) => ({ name: department.name, value: department.id }));
    inquirer
      .prompt([
        {
          type: "list",
          message: "What department's Budget are you wanting?",
          name: "department_id",
          choices: departments,
        },
      ])
      .then((answer) => {
        db.query("SELECT department.name AS department FROM employee INNER JOIN role ON employee.role_id = role.id INNER JOIN department ON role.department_id = department.id WHERE department.id = ?", answer.department_id, function (err, result) {
          if (result.length > 0) {
            db.query("SELECT department.name AS department, sum(salary) as budgeted_salary FROM employee INNER JOIN role ON employee.role_id = role.id INNER JOIN department ON role.department_id = department.id WHERE department.id = ?", answer.department_id, function (err, results) {
              console.table(results);
              anotherOne();
            });
          } else {
            console.log("This Department does not have any budgetted Salaries");
            anotherOne();
          }
        });
      });
  });
}

mainMenu();
