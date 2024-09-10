// 1. Reset

delete localStorage.UNUSED;


// 2. Load each initial screen and then run the following:

var a = Object.keys(foam.UNUSED).filter(f => {
  if ( f.indexOf('foam.core') != -1 ) return false;
  return true;
});
if ( ! localStorage.UNUSED ) {
  localStorage.UNUSED = JSON.stringify(a);
} else {
  var b = JSON.parse(localStorage.UNUSED);
  var c = a.filter(v => b.includes(v));
  localStorage.UNUSED = JSON.stringify(c);
  console.log('size:', a.length, b.length, '->', c.length);
}


// 3. Run "Generate Screenshots" script, then run:

var stage1 = [], stage2 = [];
JSON.parse(localStorage.UNUSED).forEach(c => {
  if ( foam.UNUSED[c] ) {
    stage2.push(c);
  } else {
    stage1.push(c);
  }
});

function classToFile(f) {
  f = f.replaceAll('.', '/');
  if ( f.indexOf('nanopay') != -1 ) return 'nanopay/src/' + f;
  return 'foam3/src/' + f;
}

var stages = { name: 'staging', stages: {
  '1': stage1.map(classToFile),
  '2': stage2.map(classToFile)
}};
document.body.innerText = '// Generated with foam3/tools/stageScripts.js\nfoam.POM(' + JSON.stringify(stages, null, 4) + ');\n';




--------------------------------------------------------------------------




The following script gives a single list for a stage1 in a two stage build:

var a = Object.keys(foam.UNUSED).filter(f => {
  if ( f.indexOf('foam.core') != -1 ) return false;
  return true;
}).map(f => {
  f = f.replaceAll('.', '/');
  if ( f.indexOf('nanopay') != -1 ) return 'nanopay/src/' + f;
  return 'foam3/src/' + f;
});
document.body.innerText = JSON.stringify(a, null, 4);



The following script give an approximate size (based on # of axioms) for UNUSED
models.

Object.keys(foam.UNUSED).forEach(f => {
  try {
    var m = foam.lookup(f);
    console.log(f, m.getOwnAxioms().length);
  } catch (x) {}
});



The following script shows the source files of UNUSED files. Build without -u.
var output = '';
var count  = 0;
Object.keys(foam.UNUSED).forEach(f => {
  try {
    var m = foam.maybeLookup(f);
    var s = m.model_.source;
    if ( ! s.replaceAll('/','.').endsWith(f + ".js") ) {
      output += f + "\t\t\t" + s + '\n';
      count++;
    }
  } catch (x) {}
});
console.log(output);
console.log('count:', count);
