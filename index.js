'use strict'

//The purpose of "use strict" is to indicate that the code should be executed in "strict mode".

///With strict mode, you can not, for example, use undeclared variables.
//Converting a Buffer into a string using one of the above is referred to as decoding,
// and converting a string into a Buffer is referred to as encoding.
const fs = require('fs');
const torrent = fs.readFileSync('puppy.torrent');
console.log(torrent.toString('utf8'))