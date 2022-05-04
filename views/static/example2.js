console.log("this is example2");

fetch("http://localhost:3000/bets")
  .then((response) => response.json())
  .then((data) => console.log(data));
