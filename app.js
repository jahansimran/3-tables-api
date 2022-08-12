const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "cricketMatchDetails.db");
let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server started running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error : ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

const convertplayerDetailsTable = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
  };
};

const convertMatchDetails = (dbObject) => {
  return {
    matchId: dbObject.match_id,
    match: dbObject.match,
    year: dbObject.year,
  };
};

const convertPlayerMatchDetails = (dbObject) => {
  return {
    playerMatchId: player_match_id,
    playerId: player_id,
    matchId: match_id,
    score: score,
    fours: fours,
    sixes: sixes,
  };
};

//Get players details
app.get("/players/", async (request, response) => {
  const getPlayerQuery = `
    SELECT
      *
    FROM
      player_details;`;
  const playersArray = await db.all(getPlayerQuery);
  response.send(
    playersArray.map((eachPlayer) => convertplayerDetailsTable(eachPlayer))
  );
});

//Get players details based on id

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerName = `
        SELECT 
           * 
        FROM 
          player_details
        WHERE 
          player_id = ${playerId};`;

  const Player = await db.get(getPlayerName);
  response.send(convertplayerDetailsTable(Player));
});

//update player details
app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const { playerName } = request.body;
  const updatePlayerQuery = `
        UPDATE 
           player_details 
        SET 
          player_name = '${playerName}'
        WHERE
          player_id = ${playerId};`;

  await db.run(updatePlayerQuery);
  response.send("Player Details Updated");
});

//get match details based on id
app.get("/matches/:matchId/", async (request, response) => {
  const { matchId } = request.params;
  const getMatchQuery = `
      SELECT 
        * 
      FROM 
       match_details
      WHERE 
       match_id = ${matchId};`;

  const match = await db.get(getMatchQuery);
  response.send(convertMatchDetails(match));
});

//get list of all matches of player
app.get("/players/:playerId/matches", async (request, response) => {
  const { playerId } = request.params;
  const getplayerMatchesQuery = `
        SELECT 
           *
        FROM player_match_score
          NATURAL JOIN match_details         
        WHERE
          player_id = ${playerId};`;

  const playerMatch = await db.all(getplayerMatchesQuery);
  response.send(playerMatch.map((eachMatch) => convertMatchDetails(eachMatch)));
});

//get list of players of a specific match
app.get("/matches/:matchId/players", async (request, response) => {
  const { matchId } = request.params;
  const playerMatch = `
       SELECT 
         * 
       FROM 
         player_details 
          NATURAL JOIN player_match_score
       WHERE
         match_id = ${matchId};`;

  const match = await db.all(playerMatch);
  response.send(match.map((each) => convertplayerDetailsTable(each)));
});

//get statistics of all scores
app.get("/players/:playerId/playerScores", async (request, response) => {
  const { playerId } = request.params;
  const getStatQuery = `
        SELECT 
           player_id AS playerId,
           player_name AS playerName,
           SUM(score) AS totalScore,
           SUM(fours) AS totalFours,
           SUM(sixes) AS totalSixes
        FROM player_match_score 
           NATURAL JOIN player_details
        WHERE 
           player_id = ${playerId};`;

  const detail = await db.get(getStatQuery);
  response.send(detail);
});

module.exports = app;
