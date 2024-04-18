const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "cricketMatchDetails.db");
let db = null;

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    console.log("Database connected successfully");

    app.listen(3000, () => {
      console.log("server running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`Db error ${e.message}`);
  }
};
initializeDbAndServer();

// API 1 : Get Details by player

app.get("/players/", async (request, response) => {
  const getPlayersQueries = `
        select player_id as playerId, player_name as playerName 
        from player_details 
        order by 
        playerId 
    `;
  const updatePlayerQueries = await db.all(getPlayersQueries);
  response.send(updatePlayerQueries);
});

// API 2 : Get Details by PlayerId

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerIdQueries = `
     select player_id as playerId, player_name as playerName 
     from player_details 
     where 
     player_id = ${playerId}
  `;
  const updatePlayerId = await db.get(getPlayerIdQueries);
  response.send(updatePlayerId);
});

// API 3 : Add Details to Player

app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playerIdDetails = request.body;
  const { playerName } = playerIdDetails;
  const playerIdQueries = `
    UPDATE player_details 
    SET player_name = '${playerName}' 
    WHERE player_id = ${playerId}
  `;
  const updatePlayerIdQueries = await db.run(playerIdQueries);
  response.send("Player Details Updated");
});

// APi 4 : Get Details by matchId

app.get("/matches/:matchId/", async (request, response) => {
  const { matchId } = request.params;
  const matchIdQueries = `
        SELECT match_id as matchId,
        match as match,
        year as year
        FROM  match_details
        WHERE match_id = ${matchId}
        `;
  const updateMatchIdQueries = await db.get(matchIdQueries);
  response.send(updateMatchIdQueries);
});

// API 5 : Get Matches Details by playerId

app.get("/players/:playerId/matches", async (request, response) => {
  const { playerId } = request.params;
  const getPlayersIdQueries = `
        SELECT match_id as matchId ,match,year 
        FROM   match_details 
        WHERE match_id IN (
            SELECT match_id 
            FROM player_match_score 
            WHERE player_id = ${playerId}
        )
        `;
  const updatePlayersId = await db.all(getPlayersIdQueries);
  response.send(updatePlayersId);
});

// API 6 : Get Player Details by MatchId

app.get("/matches/:matchId/players", async (request, response) => {
  const { matchId } = request.params;
  const getMatchIdQueries = `
    SELECT player_details.player_id as playerId,
    player_details.player_Name as playerName
    FROM player_details INNER JOIN player_match_score 
    ON player_details.player_id = player_match_score.player_id 
    INNER JOIN match_details ON 
    match_details.match_id = player_match_score.match_id 
    WHERE 
    match_details.match_id = ${matchId}
    
       `;
  const updateMatchIdQueries = await db.all(getMatchIdQueries);
  response.send(updateMatchIdQueries);
});

// API 7 : Get PlayerScoreDetails by playerId

app.get("/players/:playerId/playerScores/", async (request, response) => {
  const { playerId } = request.params;
  const playerIdQueries = ` 
    SELECT
    player_details.player_id AS playerId,
    player_details.player_name AS playerName,
    SUM(player_match_score.score) AS totalScore,
    SUM(fours) AS totalFours,
    SUM(sixes) AS totalSixes FROM 
    player_details INNER JOIN player_match_score ON
    player_details.player_id = player_match_score.player_id
    WHERE player_details.player_id = ${playerId};
    `;

  const updatePlayerIdQueries = await db.get(playerIdQueries);
  response.send(updatePlayerIdQueries);
});

module.exports = app;
