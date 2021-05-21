const path = require('path');
const prog = process.argv.slice(0,2).map(v => path.basename(v)).join(' ');
const args = process.argv.slice(2);
const fs = require('fs');

if ( args.length < 1 ) {
  console.error(`Usage: ${prog} <journal file> [property to extract]`);
  return;
}
var journalPath = args[0];
var key = args.length > 1 ? args[1] : 'id';

var text = fs.readFileSync(journalPath);

var p = entry => {
  console.log(`"${entry[key]}",`);
}

eval(`\n${text.toString()}\n`);
