'use strict';
const fs = require('fs');
const bencode = require('bencode');
const crypto = require('crypto');
const Buffer = require("buffer").Buffer;


module.exports.open = (filepath) =>{
    return bencode.decode(fs.readFileSync(filepath));
};

module.exports.size = (torrent) => {
  const size = torrent.info.files
    ? torrent.info.files.map((file) => file.length).reduce((a, b) => a + b)
    : torrent.info.length;

  // Create an 8-byte buffer and write the size as a big-endian integer
  const buffer = Buffer.alloc(8); // Allocate an 8-byte buffer
  buffer.writeBigUInt64BE(BigInt(size), 0); // Write the size as a big integer (big-endian)

  return buffer;
};
//What Is an Info Hash?
//The info hash is a SHA-1 hash of the info dictionary of the torrent file.
//The info hash is unique to each torrent, even if it's the same file but with different trackers or metadata. 
//This is because the info dictionary contains specific data about the torrent's content (like the piece hashes and file structure), 
//and not the tracker information.
//The info hash is used to announce the torrent to a tracker and identify it in peer-to-peer communications.
module.exports.infoHash = torrent=>{
  //info hash - the torrent hash has an info property pass it through a sha1 function to get the info hash

  //The bencode.encode function will encode this info dictionary into a binary format.
  const info = bencode.encode(torrent.info);
  return crypto.createHash("sha1").update(info).digest();
}