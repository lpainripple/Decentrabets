const express = require("express");
const app = express();
//const bcrypt = require("bcrypt");
const res = require("express/lib/response");
const Pool = require("pg").Pool;
const fs = require("fs");
const session = require("express-session");
const flash = require("express-flash");
const path = require("path");

let configFile = fs.readFileSync(__dirname + "/config.json");
let config = JSON.parse(configFile);

//put in the config file
const pool = new Pool({
  user: config.database.username,
  host: config.database.host,
  database: config.database.database,
  password: config.database.password,
  port: config.database.port,
  // user: "decentrabets",
  // host: "decentrabets.ddns.net",
  // database: "decentrabets",
  // password: "q1w2e3",
  // port: "5432",
});

app.use(
  session({
    secret: config.session.secret,
    resave: true,
    saveUninitialized: true,
  })
);
app.use(express.json());
//allow us to access request variables in the post methods
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "/views/static")));

//sets view engine to read ejs
app.set("view-engine", "ejs");

//app.use(express.urlencoded({extended: false}));

app.get("/", function (request, response) {
  response.render("index.ejs", { test: "This is how you send data to html" });
});

/********************************** LOGIN ************************************* */
app.get("/login", function (request, response) {
  response.render("login.ejs");
});

app.post("/login", function (request, response) {
  let username = request.body.username.toLowerCase();
  let password = request.body.password;

  console.log(`attempting to login for user: ${username}...`);

  if (username && password) {
    console.log(`Input - username: ${username} / password: ${password}`);
    console.log(`running query...`);
    pool.query(
      "SELECT LOWER(user_name), pass FROM users where user_name = $1 and pass = $2",
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
          console.log(
            `session initialized for user ${username}... redirecting to home page`
          );
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
  if (request.session.loggedin == true) {
    console.log(
      `user ${request.session.username} tried to access register page... already logged in`
    );
    response.redirect("/home");
  } else {
    response.render("register.ejs");
  }
});

//this function is asyncronous in case an encryption method is used
app.post("/register", async function (request, response) {
  //able to access because of app.use(expres...
  try {
    //const hashedPassword = await bcrypt.hash(request.body.password, 10);
    const username = request.body.username.toLowerCase();
    const email = request.body.email;
    //const password = hashedPassword;
    const password = request.body.password;

    pool.query(
      "INSERT into USERS (user_name, pass, account_address, email, balance) values ($1, $2, '', $3, 0);",
      [username, password, email],
      (error, results) => {
        if (error) {
          if (error.code == 23505) {
            console.log("user already exists...");
            response.send(`The user ${username} already exists`);
          } else {
            throw error;
          }
        } else {
          console.log("user added to database:" + results.response);
          console.log(
            `The user was added: ${username} and password used: ${password} with the email: ${email}`
          );

          //Redirect to homepage
          response.redirect("/login");
        }
      }
    );

    //TODO: CREATE WALLET
  } catch (exception) {
    response.redirect("/register");
    console.log(exception);
  }
});
/********************************** REGISTER END ************************************* */

/*********************************** HOME ************************************* */

app.get("/home", function (request, response) {
  var games = new Array();

  pool.query(
    "select * from games where end_datetime <= current_timestamp ",
    (error, results) => {
      if (error) {
        throw error;
      }
      results.rows.forEach((element) => {
        console.log(`Found game: ${element.game_title} in the database`);
        var game = {
          game_id: element.game_id,
          championship: element.championship,
          category: element.category,
          game_title: element.game_title,
          team1: element.team1,
          team2: element.team2,
          begin_datetime: element.begin_datetime,
          end_datetime: element.end_datetime,
          status: element.status,
          winning_team: element.winning_team,
        };

        games.push(game);
      });
    }
  );

  response.render("mainpage.ejs", {
    user: request.session.username,
    games: games,
  });
});

/********************************** HOME END ************************************* */

/********************************** FUNCTIONS ************************************* */

/********************************** FUNCTIONS END ************************************* */

const port = 3000;
app.listen(port, function (request, response) {
  console.log(`server started on port: ${port}`);
});
