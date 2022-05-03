

function getFixtures(seasonId)
{
  if(token == null)
    var token = getToken();
  
  var httpReq = new XMLHttpRequest();
  var currentDate = new Date();
  currentDate.setDate(currentDate.getDate() - 14);

  //champions league 2021/2022 season:4200
  var address = "https://football.elenasport.io/v2/seasons/${seasonId}/fixtures?from=" + currentDate.toISOString().slice(0, 10);

  httpReq.open("GET", address, false);

  httpReq.setRequestHeader("Authorization", "Bearer " + token); 

  httpReq.onreadystatechange = callbackFunction(httpReq);
  httpReq.send();

  var gameResults = new Array();
  
  var jsonData = JSON.parse(httpReq.responseText);
  
  for (var i = 0; i < jsonData.data.length; i++) 
  {

    var game = jsonData.data[i];

  	gameResults[i] = {};
    gameResults[i].date = game.date.slice(0, 16);
    gameResults[i].id = game.id;
    gameResults[i].idHome = game.idHome;
    gameResults[i].homeName = game.homeName;
    gameResults[i].idAway = game.idAway;
    gameResults[i].awayName = game.awayName;
    gameResults[i].status = game.status;
    gameResults[i].seasonName = game.seasonName;
    gameResults[i].scoreHome = game.team_home_90min_goals + game.team_home_ET_goals;
    gameResults[i].scoreAway = game.team_away_90min_goals + game.team_away_ET_goals;
    gameResults[i].team_home_PEN_goals = game.team_home_PEN_goals;
    gameResults[i].team_away_PEN_goals = game.team_away_PEN_goals;
    }

  return gameResults;
}

    function getToken()
    {
      
        var xmlhttp = new XMLHttpRequest();
        var secret = "Basic NmgxOWliOWloamxzbGh1dGpnb3NwdTBkcmY6Njd2amloM2pnYWowdW5yM3BtMGNtM2c0c2QxNnMwNmlodHI3MXRqc3VrZGdudnEzbG5v";

        xmlhttp.open("POST", "https://oauth2.elenasport.io/oauth2/token", false);
        xmlhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        xmlhttp.setRequestHeader("Authorization", secret);
        var payload = 'grant_type=client_credentials';

        xmlhttp.onreadystatechange = callbackFunction(xmlhttp);
        xmlhttp.send(payload);

        var token = JSON.parse(xmlhttp.responseText)["access_token"];

        return token;
      }

    function callbackFunction(xmlhttp) 
    {
        //alert(xmlhttp.responseXML);
    }

    function loadGamestoDatabase(seasonIds, category)
    {
      const Pool = require("pg").Pool;
      const pool = new Pool
      (
        {
          user: "decentrabets",
          host: "decentrabets.ddns.net",
          database: "decentrabets",
          password: "q1w2e3",
          port: "5432",
        }
      );
      
      //const columns = await pool.query('SELECT * FROM information_schema.columns WHERE TABLE_NAME = games;')

      for(season in seasonIds)
      {
        //champions league 2021/2022 season: 4200
        const games = getFixtures(season);
        for (game in games)
        {
          const result = await pool.request()
            .input('c1', Pool.Date, game.date)
            .input('c2', Pool.VarChar(40), game.id)
            .input('c3', Pool.VarChar(40), game.idHome)
            .input('c4', Pool.VarChar(40), game.homeName)
            .input('c5', Pool.VarChar(40), game.idAway)
            .input('c6', Pool.VarChar(40), game.awayName)
            .input('c7', Pool.VarChar(40), game.status)
            .input('c8', Pool.VarChar(40), game.seasonName)
            .input('c9', Pool.Int(4), game.scoreHome)
            .input('c10', Pool.Int(4), game.scoreAway)
            .input('c11', Pool.Int(4), game.team_home_PEN_goals)
            .input('c12', Pool.Int(4), game.team_away_PEN_goals)
            .input('c13', Pool.VarChar(40), category)
            .query('INSERT INTO games (begin_datetime, game_external_id, home_team_id, home_team_name, away_team_id, away_team_name, status, season_name, score_home, score_away, score_home_pen_goals, score_away_pen_goals, category) values(@c1, @c2, @c3, @c4, @c5, @c6, @c7, @c8, @c9, @c10, @c11, @c12, @c13);');
          
            if (result !== null) 
              console.log(result.rowsAffected);
        }
      }
    }