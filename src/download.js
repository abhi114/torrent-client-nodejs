const net = require('net');
const Buffer = require('buffer').Buffer;
const tracker = require('./tracker');

module.exports = torrent =>{
    tracker.getPeers(torrent,peers=>{
        peers.forEach(download);
    })
}

function downlaod(peer){
    const socket = net.socket();
    socket.on('error',console.log);
    socket.connect(peer.port,peer.ip,()=>{

    })
    socket.on('data',data=>{
        
    })
}