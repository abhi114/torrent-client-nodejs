'user strict';

const dgram = require('dgram');
const Buffer = require('buffer');
const urlParse = require('url').parse;
const crypto = require('crypto'); //for creating a random buffer for the transaction_id

module.exports.getPeers = (torrent,callback) =>{
    const socket = dgram.createSocket('udp4');
    const url = torrent.announce.toString('utf8');
    //send connection request

    udpSend(socket,buildConnReq(),url);
    socket.on('message',response=>{
        if(respType(response) === 'connect'){
          //receive and parse connect response
          const connResp = parseConnResp(response);
          //send announce request
          const announceReq = buildAnnounceReq(connResp.connectionId,torrent);
          udpSend(socket, announceReq, url);
        }else if(respType(response) === 'announce'){
          //parse announce response
          const announceResp = parseAnnounceResp(response);
          //pass peers to callback
          callback(announceResp.peers);
        }
    })
}


function udpSend(socket,message,rawUrl,callback=()=>{}){
    const url = urlParse(rawUrl);
    socket.send(message,0,message.length,url.port,url.host,callback);
}

function respType(){
  //respType will check if the response was for the connect or the announce request. 
  //Since both responses come through the same socket, we want a way to distinguish them.
}
function buildConnReq(){
  //we create a new empty buffer with a size of 16 bytes since we already know that the entire message should be 16 bytes long.
  const buf = Buffer.alloc(16);
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
function buildAnnounceReq(connId){

}
function parseAnnounceResp(resp){

}
