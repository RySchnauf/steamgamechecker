"use strict"

require("dotenv").config();
require("promise");
const http = require("http");

const api = process.env.API
const steam_id_a = process.env.STEAM_ID_A
const steam_id_b = process.env.STEAM_ID_B

var dict = {};
var steam_ids = [steam_id_a, steam_id_b];

// based on "https://www.tomas-dvorak.cz/posts/nodejs-request-without-dependencies/"
const getContent = function(url) {
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
                var game_array = body.response.games;
                // console.log(body);
                resolve(game_array);
            });
        });
        request.on("error", (err) => reject(err));
    });
};

// const promise_a = getContent(url_a, games_a)
//     // .then((message) => console.log(message))
//     // .catch((err) => console.error(err));

const collectLibrary = function(url, steam_id) {
    return new getContent(url)
        .then((message) => {
            message.forEach(element => {
                if(dict[element.appid]) {
                    dict[element.appid].push(steam_id);
                }
                else {
                    dict[element.appid] = [steam_id];
                }
            });
        })
        .catch((err) => console.log(err));
};

var promises = [];

steam_ids.forEach(element => {
    let url = "http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?format=json&key=" + api + "&include_appinfo=true&steamid=" + element;
    promises.push(collectLibrary(url, element));
});

Promise.all(promises)
    .then((values) => {
        // let dict = {};

        // loop through each game library, add game as key and users as value
        // for(var i = 0; i < values.length; i++) {
        //     values[i].forEach(element => {
        //         if(dict[element.appid]) {
        //             dict[element.appid].push(i);
        //         }
        //         else {
        //             dict[element.appid] = [i];
        //         }
        //     });
        // }

        // print out
        for(var key in dict) {
            console.log(key + ": " + dict[key]);
        }
    });