var isWorker = typeof importScripts !== 'undefined';
var isServer = ( ! isWorker ) && typeof window === 'undefined';

global.FOAM_FLAGS = global.FOAM_FLAGS || {};
let srcFlag = global.FOAM_FLAGS.src;

if ( isServer ) {
  global.FOAM_FLAGS.src = __dirname;
}

FOAM_FILES([
  { name: 'foam/core/ByteArray' },
  { name: 'foam/dao/crypto/EncryptedObject' }
]);

if ( isServer ) {
  global.FOAM_FILES.src = srcFlag;
}