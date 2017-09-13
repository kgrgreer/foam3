var isWorker = typeof importScripts !== 'undefined';
var isServer = ( ! isWorker ) && typeof window === 'undefined';

global.FOAM_FLAGS = global.FOAM_FLAGS || {};
let srcFlag = global.FOAM_FLAGS.src;

if ( isServer ) {
  global.FOAM_FLAGS.src = __dirname;
}

FOAM_FILES([
  // Models
  { name: 'net/nanopay/model/Account' },
  { name: 'net/nanopay/model/AccountInfo' },
  { name: 'net/nanopay/model/AccountLimit' },
  { name: 'net/nanopay/model/Bank' },
  { name: 'net/nanopay/model/BankAccountInfo' },
  { name: 'net/nanopay/model/PadAccount' },
  { name: 'net/nanopay/model/Phone' },
  { name: 'net/nanopay/model/User' },
  { name: 'net/nanopay/model/UserAccountInfo' },

  // Views
  { name: 'net/nanopay/ui/SignIn' },
]);

if ( isServer ) {
  global.FOAM_FILES.src = srcFlag;
}
