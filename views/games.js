

function getFixtures()
{
  if(token == null)
    var token = getToken();
  
  var httpReq = new XMLHttpRequest();
  var currentDate = new Date();
  currentDate.setDate(currentDate.getDate() - 14);

  var address = "https://football.elenasport.io/v2/seasons/4200/fixtures?from=" + currentDate.toISOString().slice(0, 10);

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