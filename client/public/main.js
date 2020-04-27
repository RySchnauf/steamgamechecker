"use strict"

require("dotenv").config();
const http = require("http");

const api = process.env.API
const steam_id = process.env.STEAM_ID
const url = "http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?format=json&key=" + api + "&include_appinfo=true&steamid=" + steam_id;

http.get(url, res => {
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