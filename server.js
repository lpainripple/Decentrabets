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
const methodOverride = require("method-override");
const register = require("./routes/register");
const profile = require("./routes/profile");
const os = require("os");
let config = require('./config.json')

app.use(express.json());
//allow us to access request variables in the post methods
app.use(express.urlencoded({ extended: true }));
app.use(express.static("node_modules/bootstrap/dist")) // bootstraps static files
app.use(express.static("views/static"));
app.use(flash());
app.use(methodOverride("_method"));


//put in the config file
const pool = new Pool({
  user: config.database.username,
  host: config.database.host,
  database: config.database.database,
  password: config.database.password,
  port: config.database.port
});

app.use(
  session({
    secret: config.session.secret,
    resave: true,
    saveUninitialized: true,
    //cookie:
  })
);

//sets view engine to read ejs
app.set("view-engine", "ejs");

//app.use(express.urlencoded({extended: false}));

app.get("/", function (request, response) {
  response.render("login.ejs", { message: request.flash("message") });
});

app.use("/register",register);
app.use("/profile",profile);

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

app.delete("/logout", function (request, response) {
  console.log(
    `logging out user ${request.session.username} which is currency logged in: ${request.session.loggedin}`
  );
  request.flash("message", "User logged out");
  response.render("login.ejs", { message: request.flash("message") });
  request.session.destroy();
});
/********************************** LOGIN END ************************************* */

/********************************** BETS ************************************* */

app.get(["/bets", "/bets/:filter"], function (request, response) {
  var filter = request.params.filter;
  const bet_initiator = request.query.bet_initiator;
  const bet_taker = request.query.bet_taker;
  const begin_datetime = request.query.begin_datetime;
  //console.log(`This is the filter ${filter}`);
  if (filter == "upcominggames") {
    query = "select * from get_bets_after_date($1, $2, CURRENT_DATE)";
  }
  if (filter == "pastgames") {
    query = "select * from get_bets_before_date($1, $2, CURRENT_DATE)";
  }
  if (filter != "pastgames" && filter != "upcominggames") {
    query = "select * from get_bets_before_date($1, $2, null)";
  }
  pool.query(query, [bet_initiator, bet_taker], function (error, results) {
    if (error) {
      throw error;
    } else {
      var bets = new Array();

      results.rows.forEach((element) => {
        const bet = {
          bet_id: element.bet_id,
          bet_initiator: element.bet_initiator,
          bet_taker: element.bet_taker,
          game_id: element.game_id,
          bet_initiator_team_pick: element.bet_initiator_team_pick,
          xrp_amount: element.xrp_amount,
          bet_status: element.bet_status,
          bet_multiplication: element.bet_multiplication,
          game_title: element.game_title,
          game_status: element.game_status,
        };

        bets.push(bet);
      });

      response.send(bets);
    }
  });
});

app.post("/bets", function (request, response) {
  const winner = request.body.winner;
  const bet_amount = request.body.bet_amount;
  const multiplier = request.body.multiplier;
  const game_id = request.body.game_id;
  const bet_initiator = request.body.bet_initiator;

  pool.query(
    "INSERT into bets (bet_initiator, game_id, bet_initiator_team_pick, xrp_amount, bet_status, bet_multiplication) VALUES ($1, $2, $3, $4, $5, $6);",
    [bet_initiator, game_id, winner, bet_amount, "active", multiplier],
    function (error, results) {
      if (error) {
        throw error;
      } else {
        console.log(
          `Bet created in database. Bet taker: ${bet_initiator}. Amount: ${bet_amount} for game id: ${game_id}`
        );
        response.status(200).end();
      }
    }
  );
});

app.delete(["/bets", "/bets/:id"], function (request, response) {
  var id = request.params.id;

  pool.query("select delete_bet_id($1);", [id], function (error, results) {
    if (error) {
      console.log(`This is the error: ${error}`);
      throw error;
    } else {
      response.send(results.rows[0].delete_bet_id);
      response.status(200).end();
    }
  });
});

/********************************** BETS END ************************************* */

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

          var status_color = "green";
          if (element.status == "not started") {
            status_color = "gray";
          } else if (element.status == "finished") {
            status_color = "#DA3025";
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
            status_color: status_color,
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

/********************************** HO ME END ************************************* */

/********************************** FUNCTIONS ************************************* */

/********************************** FUNCTIONS END ************************************* */

/********************************** INTERNAL ************************************* */

app.get("/internal", function (request, response) {
  var cpu_s = os.cpus();
  var no_of_logical_core = 0;
  cpu_s.forEach((element) => {
    no_of_logical_core++;
  });

  const total_memory = os.totalmem();
  var total_mem_in_kb = total_memory / 1024;
  var total_mem_in_mb = total_mem_in_kb / 1024;

  total_mem_in_kb = Math.floor(total_mem_in_kb);
  total_mem_in_mb = Math.floor(total_mem_in_mb);

  const free_memory = os.freemem();
  var free_mem_in_kb = free_memory / 1024;
  var free_mem_in_mb = free_mem_in_kb / 1024;

  free_mem_in_kb = Math.floor(free_mem_in_kb);
  free_mem_in_mb = Math.floor(free_mem_in_mb);

  const serverinfo = {
    hostname: os.hostname(),
    platform: os.platform(),
    architecture: os.arch(),
    version: os.version(),
    cpus: no_of_logical_core,
    total_memory: total_mem_in_mb,
    free_memory: free_mem_in_mb,
    os_uptime_seconds: os.uptime(),
    os_uptime_minutes: os.uptime() / 60,
    os_uptime_hours: os.uptime() / 3600,
    os_uptime_days: os.uptime() / 86400,
  };

  response.send(serverinfo);
});

app.get("/example1", function (request, response) {
  response.render("example1.ejs");
});

app.get("/example2", function (request, response) {
  response.render("example2.ejs");
});

app.get("/example3", function (request, response) {
  console.log(request.query);
  console.log(request.query.name);
  console.log(request.query.age);

  const person = {
    name: request.query.name,
    age: request.query.age,
  };

  response.render("example3.ejs", { user: person });
});
/********************************** INTERNAL END ************************************* */

const port = 3000;
app.listen(port, function (request, response) {
  console.log(`server started on port: ${port}`);
});
