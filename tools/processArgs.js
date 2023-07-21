/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

function processArgs(usage, x, defaultFlags, cmds) {
  var flags = globalThis.foam.flags;
  var argv  = process.argv.slice(2);

  if ( defaultFlags ) for ( var key in defaultFlags ) {
    flags[key] = defaultFlags[key];
  }

  // Flags
  while ( argv.length ) {
    if ( ! argv[0].startsWith('-') ) break;

    var arg = argv.shift();

    if ( arg === '-help' || arg === '--help' || arg === '-usage' || arg === '--usage' || arg === '-?' || arg === '--?' ) {
      var flagKeys = defaultFlags ? Object.keys(defaultFlags) : [];
      var argList  = Object.keys(x).map(k => ` [ -${k}=value ]`).join('');
      var flagList = '';
      if ( flagKeys.length ) {
        flagList = '[ -flags=' + flagKeys.map(k => (defaultFlags[k] ? '-' : '') + k).join(',') + ' ]';
      }
      console.log('USAGE:', process.argv[1], flagList + argList, usage);
      cmds && cmds.usage && cmds.usage();
      process.exit(1);
    }

    var i = arg.indexOf('=');
    if ( i == -1 ) {
      arg = arg.substring(1);
      if ( cmds && cmds[arg] ) {
        cmds[arg]();
      } else {
        console.log('Unknown command: ' + arg);
      }
    } else {
      var key   = arg.substring(1, i);
      var value = arg.substring(i + 1);
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
  }

  return [argv, x, flags];
}

module.exports = processArgs;
