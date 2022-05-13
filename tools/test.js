
const rerequire = function (scriptPath) {
    const cacheKey = require.resolve(scriptPath);
    if ( require.cache[cacheKey] ) {
        delete require.cache[cacheKey];
    }
    return require(scriptPath);
};

globalThis.foam = {};
foam.POM = function (...a) { console.log('POM', a) };

require('../../pom.js');
for ( const k in require.cache ) {
    delete require.cache[k];
}
console.log(Object.keys(require.cache));
// require.cache = {};
require('../../pom.js');
