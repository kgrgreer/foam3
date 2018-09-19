module.exports = JSON.parse(require('zlib').gunzipSync(require('fs').readFileSync(require('path').resolve(__dirname, 'iso20022/mapping.json.gz'))).toString('utf8'));
