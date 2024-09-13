'user strict';

const dgram = require('dgram');
const Buffer = require('buffer');
const urlParse = require('url').parse;

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
          const announceReq = buildAnnounceReq(connResp.connectionId);
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

}
function buildConnReq(){

}
function parseConnResp(resp){

}
function buildAnnounceReq(connId){

}
function parseAnnounceResp(resp){

}
