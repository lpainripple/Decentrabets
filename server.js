const express = require("express");
const app = express();
const bcrypt = require("bcrypt");
const res = require("express/lib/response");
const Pool = require("pg").Pool;
const fs = require("fs");
const session = require("express-session");
const flash = require("express-flash");
const path = require("path");

let configFile = fs.readFileSync(__dirname + "/config.json");
let dbconfig = JSON.parse(configFile);

//put in the config file
const pool = new Pool({
  //   user: dbconfig.database.username,
  //   host: dbconfig.database.host,
  //   database: dbconfig.database.database,
  //   password: dbconfig.database.password,
  //   port: dbconfig.database.port,
  user: "decentrabets",
  host: "decentrabets.ddns.net",
  database: "decentrabets",
  password: "q1w2e3",
  port: "5432",
});

app.use(
  session({
    //put in the config file
    secret: "7cfdf87a-2e82-4ec5-90ae-1223452d1373",
    resave: true,
    saveUninitialized: true,
  })
);
app.use(express.json());
//allow us to access request variables in the post methods
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "/views/static")));

app.set("view-engine", "ejs");

//app.use(express.urlencoded({extended: false}));

app.get("/", function (request, response) {
  response.render("index.ejs", { test: "test1" });
});

/********************************** LOGIN ************************************* */
app.get("/login", function (request, response) {
  response.render("login.ejs");
});

app.post("/login", function (request, response) {
  let username = request.body.username;
  let password = request.body.password;

  console.log(`attempting to login for user: ${username}...`);

  if (username && password) {
    console.log(`Input - username: ${username} / password: ${password}`);
    console.log(`running query...`);
    pool.query(
      "SELECT * FROM users where user_name = $1 and pass = $2",
      [username, password],
      (error, results) => {
        if (error) {
          throw error;
        }
        results.rows.forEach((element) => {
          console.log(`Found user: ${element.user_name} in the database`);
        });
        if (results.rowCount == 1) {
          //Authentication
          request.session.loggedin = true;
          request.session.username = username;
          console.log("session initialized...");
          //Redirect to homepage
          response.redirect("/home");
        } else {
          response.send("Incorrect username or password");
        }
      }
    );
  } else {
    response.send("Please enter username and password");
    response.end();
  }
});
/********************************** LOGIN END ************************************* */

/********************************** REGISTER ************************************* */
app.get("/register", function (request, response) {
  response.render("register.ejs");
});

app.post("/register", async function (request, response) {
  //able to access because of app.use(expres...
  try {
    const hashedPassword = await bcrypt.hash(request.body.password, 10);
    const username = request.body.username;
    const email = request.body.email;
    //const password = hashedPassword;
    const password = request.body.password;

    pool.query(
      "insert into USERS (user_name, pass, account_address, email, balance) values ($1, $2, '', $3, 0);",
      [username, password, email],
      (error, results) => {
        if (error) {
          throw error;
        }
        console.log("user added to database:" + results.response);

        console.log(username);
        console.log(password);
        console.log(email);
        console.log("Finished with no errors...");
        console.log(`User ${request.body.username} registered.`);

        //Redirect to homepage
        response.redirect("/login");
      }
    );

    //TODO: CREATE WALLET
  } catch (exception) {
    response.redirect("/register");
    console.log(exception);
  }
});
/********************************** REGISTER END ************************************* */

/********************************** HOME ************************************* */

app.get("/home", function (request, response) {
  response.render("games.ejs");
  // response.send(
  //   `The user ${request.session.username} is logged in: ${request.session.loggedin}`
  // );
});

/********************************** HOME END ************************************* */

const port = 3000;
app.listen(port, function (request, response) {
  console.log(`server started on port: ${port}`);
});
