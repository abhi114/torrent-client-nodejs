'use strict'

//The purpose of "use strict" is to indicate that the code should be executed in "strict mode".

///With strict mode, you can not, for example, use undeclared variables.
//Converting a Buffer into a string using one of the above is referred to as decoding,
// and converting a string into a Buffer is referred to as encoding.
//In a torrent file, the announce property specifies the URL of the tracker that coordinates the 
//distribution of the torrent's content. A tracker is a server that keeps track of which peers have which pieces of the torrent and helps peers find each other to exchange data.

//In other words, the announce property contains the URL that a BitTorrent client would use to announce its
//presence to the tracker and retrieve a list of other peers that are sharing the same torrent.

//For example, the announce property might contain a URL like 
//http://example.com:6969/announce, which the BitTorrent client would use to connect to the tracker and participate in the torrent's distribution.

const download = require("./src/download");
const fs = require('fs');
const bencode = require("bencode");
const tracker = require('./tracker');
const torrentParser = require('./torrent-parser');
const torrent = torrentParser.open(process.argv[2]); //now the file path can be passed using the arguments in cmd line
//console.log(torrent);
download(torrent);
tracker.getPeers(torrent,peers=>{
    if(peers){
    console.log("list of peers:",peers);
    }
    
})


