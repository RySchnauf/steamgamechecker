"use strict"

require("dotenv").config();
const http = require("http");

const api = process.env.API
const steam_id_a = process.env.STEAM_ID_A
const steam_id_b = process.env.STEAM_ID_B
const url_a = "http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?format=json&key=" + api + "&include_appinfo=true&steamid=" + steam_id_a;
const url_b = "http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?format=json&key=" + api + "&include_appinfo=true&steamid=" + steam_id_b;

http.get(url_a, res => {
    res.setEncoding("utf8");
    let body = "";
    res.on("data", data => {
        body += data;
    });
    res.on("end", () => {
        body = JSON.parse(body);
        console.log(body);
    });
});

http.get(url_b, res => {
    res.setEncoding("utf8");
    let body = "";
    res.on("data", data => {
        body += data;
    });
    res.on("end", () => {
        body = JSON.parse(body);
        console.log(body);

        var games = body.response.games;
        
        for(let i = 0; i < games.length; i++) {
            console.log(games[i].appid);
        }
    });
});