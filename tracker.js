'user strict';

const dgram = require('dgram');
const Buffer = require('buffer').Buffer;
const urlParse = require('url').parse;
const crypto = require('crypto'); //for creating a random buffer for the transaction_id
const torrentParser = require('./torrent-parser');
const util = require('./util');

const getPeers = async (torrent, callback) => {
  if (torrent["announce-list"]) {
    const trackerUrls = torrent["announce-list"];
    let foundPeers = false; // Flag to exit the loop when peers are found

    for (let trackerUrl of trackerUrls) {
      if (foundPeers) break; // Exit loop if peers have been found

      const isSuccessful = await new Promise((resolve) => {
        const socket = dgram.createSocket("udp4");
        const tracker = trackerUrl[0].toString("utf8");
        const url = urlParse(tracker);

        udpSend(socket, buildConnReq(), url);

        socket.on("message", (response) => {
          if (respType(response) === "connect") {
            console.log("connected");
            const connResp = parseConnResp(response);
            const announceReq = buildAnnounceReq(
              connResp.connectionId,
              torrent
            );
            udpSend(socket, announceReq, url);
          } else if (respType(response) === "announce") {
            const announceResp = parseAnnounceResp(response);

            if (announceResp && announceResp.peers.length > 0) {
              callback(announceResp.peers);
              foundPeers = true; // Set flag to stop further attempts
              resolve(true); // Successfully retrieved peers
            } else {
              console.log(`No valid peers from tracker ${trackerUrl}`);
              resolve(false); // No valid peers, continue to next tracker
            }
          }
        });

        socket.on("error", (error) => {
          console.error(
            `Failed to connect to tracker ${trackerUrl}: ${error.message}`
          );
          resolve(false);
        });

        // Timeout for waiting on tracker response
        setTimeout(() => {
          console.log(
            `No response from tracker ${trackerUrl}, moving to the next tracker.`
          );
          resolve(false);
        }, 5000); // 5 seconds timeout
      });

      if (isSuccessful) {
        break; // Break out of loop once peers are found
      }
    }
  }
};





function udpSend(socket,message,rawUrl,callback=()=>{console.log("done")}){
    const url = urlParse(rawUrl);
    console.log("url is " + JSON.stringify(url));
    socket.send(message,0,message.length,url.port,url.hostname,callback);
}

function respType(resp){
  //respType will check if the response was for the connect or the announce request. 
  //Since both responses come through the same socket, we want a way to distinguish them.
  console.log('response is' +JSON.stringify(resp));
  const action = resp.readUInt32BE(0);
  if(action === 0) return 'connect';
  if(action === 1) return 'announce';
}
function buildConnReq(){
  //we create a new empty buffer with a size of 16 bytes since we already know that the entire message should be 16 bytes long.
  const buf = Buffer.allocUnsafe(16);
  //for the connection id
  //The 0x indicates that the number is a hexadecimal number, which can be a more conventient representation when working with bytes.
  //Otherwise they’re basically the same as base 10 numbers.
  buf.writeUInt32BE(0x417, 0);
  buf.writeUInt32BE(0x27101980, 4);
  //for the action its value will be 0 always
  buf.writeUInt32BE(0, 8);
  //For the final 4 bytes we generate a random 4-byte buffer using crypto.randomBytes which is a pretty handy way of creating a random 32-bit integer. 
  //To copy that buffer into our original buffer we use the copy method passing in the offset we would like to start writing at.
  crypto.randomBytes(4).copy(buf, 12);
  return buf;
}
function parseConnResp(resp){
  return {
    action:resp.readUInt32BE(0),
    transactionId:resp.readUInt32BE(4),
    connectionId:resp.slice(8),
  }
}
function buildAnnounceReq(connId,torrent,port=6881){
  //totaal bits of the req will be 98 and the port will be 6881 only
  const buf = Buffer.allocUnsafe(98);
  //connection id
  connId.copy(buf, 0);
  //action
  buf.writeUInt32BE(1, 8);
  //transaction id
  crypto.randomBytes(4).copy(buf, 12);
  //info hash
  torrentParser.infoHash(torrent).copy(buf, 16); //it is a 20 byte(not bit rest are bit) string so next will be at index 36
  //peer id
  util.genId().copy(buf, 36);
  //downloaded
  //I need a 64-bit integer but since they’re always initialized to 0, 
  //I just used Buffer.alloc(8), as this will just create an 8-byte buffer with all 0s.
  Buffer.alloc(8).copy(buf,56); //8byte buffer which will be equal to 64 bit 
  //left
  torrentParser.size(torrent).copy(buf,64);
  //uploaded
  Buffer.alloc(8).copy(buf,72);
  //event
  buf.writeUInt32BE(0,80);
  //ip address
  buf.writeUInt32BE(0,84);
  //key
  crypto.randomBytes(4).copy(buf,88);
  //num want
  buf.writeInt32BE(-1,92); //signed integer
  //port
  buf.writeUInt16BE(port,96);
  return buf;

}
//read the announcerespParseExplanation for this context
function parseAnnounceResp(resp) {
  console.log("announce final response is", JSON.stringify(resp));

  if (resp.length < 20) {
    console.log("Incomplete response received, skipping parsing for peers.");
    return null; // Return null to indicate an invalid response
  }
   function group(iterable, groupSize) {
     let groups = [];
     for (let i = 0; i < iterable.length; i += groupSize) {
       groups.push(iterable.slice(i, i + groupSize));
     }
     return groups;
   }
  try {
    const action = resp.readUInt32BE(0);
    const transactionId = resp.readUInt32BE(4);
    const interval = resp.readUInt32BE(8);
    const leechers = resp.readUInt32BE(12);
    const seeders = resp.readUInt32BE(16);

    const peersData = resp.slice(20);
    const peers = group(peersData, 6).map((address) => ({
      ip: `${address[0]}.${address[1]}.${address[2]}.${address[3]}`,
      port: address.readUInt16BE(4),
    }));

    return {
      action,
      transactionId,
      interval,
      leechers,
      seeders,
      peers,
    };
  } catch (err) {
    console.error("Error parsing announce response:", err);
    return null; // Handle errors by returning null
  }
}
module.exports.getPeers = getPeers;