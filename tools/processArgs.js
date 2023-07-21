/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

function processArgs(usage, x, defaultFlags) {
  var flags = globalThis.foam.flags;
  var argv  = process.argv.slice(2);

  if ( defaultFlags ) for ( var key in defaultFlags ) {
    flags[key] = defaultFlags[key];
  }

  // Flags
  while ( argv.length ) {
    if ( ! argv[0].startsWith('-') ) break;

    var arg = argv.shift();

    if ( arg === '-help' || arg === '--help' ) {
      var flagKeys = defaultFlags ? Object.keys(defaultFlags) : [];
      var argList  = Object.keys(x).map(k => ` [ -${k}=value ]`).join('');
      var flagList = '';
      if ( flagKeys.length ) {
        flagList = '[ -flags=' + flagKeys.map(k => `[-]${k}`).join(',') + ']'
      }
      console.log('USAGE:', process.argv[1], '[ -flags=[-]flag,...,[-]flag ]' + argList, usage);
      process.exit(1);
    }

    var key   = arg.substring(1, arg.indexOf('='));
    var value = arg.substring(arg.indexOf('=') + 1);
    if ( key === 'flags' ) {
      value.split(',').forEach(f => {
        if ( f.startsWith('-') ) {
          flags[f.substring(1)] = false;
        } else {
          flags[f] = true;
        }
      });
    } else {
      x[key] = value;
    }
  }

  return [argv, x, flags];
}

module.exports = processArgs;
