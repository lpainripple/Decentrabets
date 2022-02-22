

function getFixtures()
{
  if(token == null)
    var token = getToken();
  
  var ul = document.getElementById("gamesUL");
  ul.innerHTML = '';
  var httpReq = new XMLHttpRequest();
  var currentDate = new Date().toISOString().slice(0, 10);

  var address = "https://football.elenasport.io/v2/seasons/4200/fixtures?from=" + currentDate;

  httpReq.open("GET", address, false);

  httpReq.setRequestHeader("Authorization", "Bearer " + token); 

  httpReq.onreadystatechange = callbackFunction(httpReq);
  httpReq.send();

  var idGameList = new Array();
  var idHomeList = new Array();
  var idAwayList = new Array();

  var jsonData = JSON.parse(httpReq.responseText);
  
  for (var i = 0; i < jsonData.data.length; i++) 
  {

    var game = jsonData.data[i];

    idGameList[i] = game.id;
    idHomeList[i] = game.idHome;
    idAwayList[i] = game.idAway;

      var li = document.createElement("li");
      li.appendChild(document.createTextNode(game.seasonName));
      ul.appendChild(li);

      li = document.createElement("li");
      li.appendChild(document.createTextNode(game.status));
      ul.appendChild(li);
      //status = finished for when game is over and results will be processed
      //status	string	Possible values of the status field are: 'cancelled', 'postponed', 'not started', 'in progress', 'finished', 'half time', 'suspended'

      li = document.createElement("li");
      li.appendChild(document.createTextNode(game.homeName + " x " + game.awayName));
      ul.appendChild(li);

      if(game.team_away_PEN_goals == 0 && game.team_home_PEN_goals ==0 )
      {
        if(game.team_away_ET_goals == 0 && game.team_home_ET_goals == 0 )
        {
          li = document.createElement("li");
          li.appendChild(document.createTextNode("Score: "+ game.team_home_90min_goals + " - " + game.team_away_90min_goals));
          ul.appendChild(li);
        }
        else
        {
          li = document.createElement("li");
          li.appendChild(document.createTextNode("Score (ET): "+ game.team_home_90min_goals + game.team_home_ET_goals + " - " + game.team_away_90min_goals + game.team_away_ET_goals));
          ul.appendChild(li);
        }
      }
      else
      {
        li = document.createElement("li");
        li.appendChild(document.createTextNode("Score (PEN): "+ game.team_home_90min_goals + game.team_home_ET_goals + " ("+ game.team_home_PEN_goals + ") - " + game.team_away_90min_goals + game.team_away_ET_goals + "(" + game.team_away_PEN_goals + ")"));
        ul.appendChild(li);
      }

      li = document.createElement("br");
      ul.appendChild(li);
    
  }
  
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

        document.getElementById("login").innerHTML = token;
        return token;
      }

    function callbackFunction(xmlhttp) 
    {
        //alert(xmlhttp.responseXML);
    }