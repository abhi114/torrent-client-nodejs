'use strict'
const crypto = require('crypto');
let id = null;
//“peer id” is used to uniquely identify your client. I created a new file called util.js to generate an id for me. A peer id can basically be any random 20-byte string but most clients follow a convention detailed here. 
//Basically “AT” is the name of my client (ab-torrent), and 0001 is the version number.
module.exports.genId = ()=>{
    if(!id){
        id = crypto.randomBytes(20);
        Buffer.from('-AT0001-').copy(id,0);
    }
    return id;
};