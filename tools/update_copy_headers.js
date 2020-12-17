const newHeader = `
/**
 * NANOPAY CONFIDENTIAL
 *
 * [2020] nanopay Corporation
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of nanopay Corporation.
 * The intellectual and technical concepts contained
 * herein are proprietary to nanopay Corporation
 * and may be covered by Canadian and Foreign Patents, patents
 * in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from nanopay Corporation.
 */
`.trim();

const oldHeaders = [
].map(h => h.trim());

Array.prototype.objectify = function (f) {
  var o = {};
  this.forEach(v => o = {...o, ...f(v)});
  return o;
};

Object.prototype.let = function (fNewX, f) {
  var o = { ...this, ...fNewX(this) };
  return f(o);
};

({
  ...['fs'].objectify(k => ({ [k]: require(k) })),
  updateCopyHeader: (x, path) => {
    var txt = x.fs.readFile(path, (err, data) => {
      if (err) { console.error(err); process.exit(1); }
      data = data.toString('utf8').trimLeft();
      if ( oldHeaders.length > 0 ) {
        oldHeaders.forEach(h => {
          if ( data.startsWith(h) ) data = data.slice(h.length).trimLeft();
        })
      }
      data = newHeader + '\n\n' + data;
      x.fs.writeFile(path, data, () => {});
    });
  }
}).let(x => ({
  classFiles: JSON.parse(x.fs.readFileSync('./.foam/foamlinkoutput.json')).classesToFiles
}), x => {
  Object.keys(x.classFiles).filter(id => id.startsWith('net.nanopay'))
    .reduce((files, id) => files.includes(x.classFiles[id]) ? files : [...files, x.classFiles[id]], [])
    .forEach(x.updateCopyHeader.bind({}, x))
});