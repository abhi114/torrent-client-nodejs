const crypto = require("crypto");
 // This is the original approach (you can skip this if bignum is not working)

// Example torrent size
const torrentSize = 123456789012345; // Example large size

// Approach 1: Using bignum (original)


// Approach 2: Using Buffer and BigInt (updated code without bignum)
function bufferApproach(size) {
  const buffer = Buffer.alloc(8); // Allocate an 8-byte buffer
  buffer.writeBigUInt64BE(BigInt(size), 0); // Write the size as a big-endian 64-bit integer
  return buffer;
}

// Comparing both results

const resultBuffer = bufferApproach(torrentSize);

// Print the results

console.log("Result from buffer approach: ", resultBuffer);

