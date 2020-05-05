"use strict"

require("dotenv").config();
require("promise");
const http = require("http");

const api = process.env.API
const steam_id_a = process.env.STEAM_ID_A
const steam_id_b = process.env.STEAM_ID_B
const url_a = "http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?format=json&key=" + api + "&include_appinfo=true&steamid=" + steam_id_a;
const url_b = "http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?format=json&key=" + api + "&include_appinfo=true&steamid=" + steam_id_b;

let games_a = [];
let games_b = [];

// based on "https://www.tomas-dvorak.cz/posts/nodejs-request-without-dependencies/"
const getContent = function(url, game_array) {
    return new Promise((resolve, reject) => {
        const lib = require("http");
        const request = lib.get(url, (response) => {
            if(response.statusCode < 200 || response.statusCode > 299) {
                reject(new Error('Failed to load page, status code: ' + response.statusCode));
            }

            response.setEncoding("utf8");
            let body = "";
            response.on('data', data => {
                body += data;
            });
            response.on("end", () => {
                body = JSON.parse(body);
                game_array = body.response.games;
                // console.log(body);
                resolve(body);
            });
        });
        request.on("error", (err) => reject(err));
    });
};

const promise_a = getContent(url_a, games_a)
    // .then((message) => console.log(message))
    // .catch((err) => console.error(err));

const promise_b = getContent(url_b, games_b)
    // .then((message) => console.log(message))
    // .catch((err) => console.log(err));

Promise.all([promise_a, promise_b])
    .then((values) => {
        console.log(values);
    });