"use strict";
const fs = require("fs");
const bencode = require("bencode");
// 1
const dgram = require("dgram");
const Buffer = require("buffer").Buffer;
const urlParse = require("url").parse;

const torrent = bencode.decode(fs.readFileSync("puppy.torrent"));
// 2 I use the url module’s parse method on our tracker url. 
//This lets me easily extract different parts of the url like its protocol, hostname, port, etc.
const url = urlParse(torrent.announce.toString("utf8"));

// 3
const socket = dgram.createSocket("udp4"); //ipv4 socket
// 4
const myMsg = Buffer.from("hello?", "utf8");
// 5
socket.send(myMsg, 0, myMsg.length, url.port, url.host, () => {});
// 6
socket.on("message", (msg) => {
  console.log("message is", msg);
});
