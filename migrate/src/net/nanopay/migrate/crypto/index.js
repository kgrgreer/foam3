'use strict';

var forge = require('node-forge');

var key = process.argv[2];
var iv = process.argv[3];
var cipherTexts = JSON.parse(process.argv[4]);

Object.keys(cipherTexts).forEach(function (k) {
  var input = forge.util.createBuffer(forge.util.decode64(cipherTexts[k]));
  var decipher = forge.cipher.createDecipher('AES-CBC', key);
  decipher.start({ iv: iv });
  decipher.update(input);
  decipher.finish();

  cipherTexts[k] = decipher.output.getBytes();
});

console.log(JSON.stringify(cipherTexts));