"use strict"

require("dotenv").config();
require("promise");
const http = require("http");
const https = require("https");
const fs = require("fs");

const api = process.env.API
const steam_id_a = process.env.STEAM_ID_A
const steam_id_b = process.env.STEAM_ID_B

var dict = {};
var steam_ids = [steam_id_a, steam_id_b];
var steam_ids_validated = [];

// based on "https://www.tomas-dvorak.cz/posts/nodejs-request-without-dependencies/"
const getContent = function(url) {
    return new Promise((resolve, reject) => {
        const request = http.get(url, (response) => {
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
                // var game_array = body.response.games;
                // console.log(body);
                resolve(body);
            });
        });
        request.on("error", (err) => reject(err));
    });
};

const getContent_s = function(url) {
    return new Promise((resolve, reject) => {
        const request = https.get(url, (response) => {
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
                // var game_array = body.response.games;
                // console.log(body);
                resolve(body);
            });
        });
        request.on("error", (err) => reject(err));
    });
};

// take input
// check line to see if it is valid steam id
// if not, try to look up steam id with steam community id
// if successfull, add to steam_ids array
// otherwise, display error and continue with next line
const validateID = function(unvalidated) {
    // check to see if it is a vanity id
    return new getContent_s("https://api.steampowered.com/ISteamUser/ResolveVanityURL/v1/?Key=" + api + "&vanityurl=" + unvalidated)
    .then((message) => {
        if(message.response.success == 1) {
            steam_ids_validated.push(message.response.steamid);
        }
        else {
            console.log(unvalidated + " not recognized.");
        }
    })
    .catch((err) => console.log(err));
};

// const promise_a = getContent(url_a, games_a)
//     // .then((message) => console.log(message))
//     // .catch((err) => console.error(err));

const collectLibrary = function(url, steam_id) {
    return new getContent(url)
        .then((message) => {
            // loop through each game library, add game as key, and users as value
            message = message.response.games;
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

var vanity_url_calls = [];

steam_ids.forEach(element => {
    if(element.length == 17 && /^\d+$/.test(element)) {
        steam_ids_validated.push(element);
    }
    else {
        console.log(element);
        vanity_url_calls.push(validateID(element));
    }
});

Promise.all(vanity_url_calls)
    .then((values) => {
        
        var library_calls = [];
        
        steam_ids_validated.forEach(element => {
            let url = "http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?format=json&key=" + api + "&include_appinfo=true&steamid=" + element;
            library_calls.push(collectLibrary(url, element));
        });

        Promise.all(library_calls)
            .then((values) => {
                // print out
                for(var key in dict) {
                    console.log(key + ": " + dict[key]);
                }
            });
    });