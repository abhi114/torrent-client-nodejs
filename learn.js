const Buffer = require('buffer').Buffer;
const crypto = require("crypto");
const buf = Buffer.from([
  0x68, 0x65, 0x6c, 0x6c, 0x6f, 0x20, 0x77, 0x6f, 0x72, 0x6c, 0x64,
]);
console.log(buf);
console.log(buf.toString('utf8'));
const buf1 = Buffer.alloc(16);
//for the connection id
buf1.writeUInt32BE(0x417, 0);
buf1.writeUInt32BE(0x27101980, 4);
//for the action its value will be 0 always
buf1.writeUInt32BE(0, 8);
crypto.randomBytes(4).copy(buf1, 12);
////<Buffer 00 00 04 17 27 10 19 80 00 00 00 00 a6 ec 6b 7d>
console.log(buf1);
