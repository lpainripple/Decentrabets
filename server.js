const express = require("express");
const app = express();
//const bcrypt = require("bcrypt");
const res = require("express/lib/response");
const Pool = require("pg").Pool;
const fs = require("fs");
const session = require("express-session");
//const flash = require("express-flash");
const flash = require("connect-flash");
const path = require("path");
const ejs = require("ejs");

app.use(express.static(__dirname + '/static/img'));

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
    //cookie:
  })
);
app.use(express.json());
//allow us to access request variables in the post methods
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "/views/static")));
app.use(flash());

//sets view engine to read ejs
app.set("view-engine", "ejs");

//app.use(express.urlencoded({extended: false}));

app.get("/", function (request, response) {
  response.render("index.ejs", { test: "This is how you send data to html" });
});

/********************************** LOGIN ************************************* */
app.get("/login", function (request, response) {
  response.render("login.ejs", { message: request.flash("message") });
});

app.post("/login", function (request, response) {
  let username = request.body.username.toLowerCase();
  let password = request.body.password;
  
  console.log(`attempting to login for user: ${username}...`);

  if (username && password) {
    console.log(`Input - username: ${username} / password: ${password}`);
    console.log(`running query...`);
    pool.query(
      "SELECT LOWER(user_name), pass, balance FROM users where user_name = $1 and pass = $2",
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
          request.session.balance = results.rows[0].balance;
          console.log(
            `session initialized for user ${username}... redirecting to home page`
          );
          //Redirect to homepage
          response.redirect("/home");
        } else {
          request.flash("message", "Incorrect username or password");
          response.redirect("/login");
          //response.send("Incorrect username or password");
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
    response.render("register.ejs", { message: request.flash("message") });
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
      "INSERT into USERS (user_name, pass, address, email, balance) values ($1, $2, '', $3, 0);",
      [username, password, email],
      (error, results) => {
        if (error) {
          if (error.code == 23505) {
            console.log("user already exists...");
            request.flash("message", "This user already exists");
            response.redirect("/register");
            //response.send(`The user ${username} already exists`);
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
  if (request.session.loggedin == true) {
     pool.query(
    //"SELECT game_id, game_external_id, home_team_id, home_team_name, away_team_id, away_team_name, season_name, category, score_home, score_home_pen_goals, score_away, score_away_pen_goals, begin_datetime, status FROM games",
    "SELECT * FROM games",
    (error, results) => {
      if (error) {
        throw error;
      }
      var games = new Array();

      results.rows.forEach((element) => {
        console.log(`Found game: ${element.game_id} in the database`);

        var status_color = 'green';
        if (element.status == 'not started') {
          status_color = 'gray';
        } else if (element.status == 'finished') {
          status_color = '#DA3025';
        }

        var game = {
          game_id: element.game_id,
          game_external_id: element.game_external_id,
          home_team_id: element.home_team_id,
          home_team_name: element.home_team_name,
          away_team_id: element.away_team_id,
          away_team_name: element.away_team_name,
          season_name: element.season_name,
          category: element.category,
          score_home: element.score_home,
          score_home_pen_goals: element.score_home_pen_goals,
          score_away: element.score_away,
          score_away_pen_goals: element.score_away_pen_goals,
          begin_datetime: element.begin_datetime.toString().slice(0, 16),
          status: element.status,
          status_color: status_color
        };

        games.push(game);
      });

      response.render("games.ejs", {
        user: request.session.username,
        balance: request.session.balance,
        games: games,
      });
    }
  );

  } else {
    response.redirect("/login");
  }
});

/********************************** HOME END ************************************* */

/********************************** FUNCTIONS ************************************* */

/********************************** FUNCTIONS END ************************************* */

const port = 3000;
app.listen(port, function (request, response) {
  console.log(`server started on port: ${port}`);
});
