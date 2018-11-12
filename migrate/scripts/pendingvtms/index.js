'use strict';

global.Promise = require('bluebird');

var sql = require('mssql');
sql.Promise = require('bluebird');

var fs = require('fs');
var json2csv = Promise.promisify(require('json2csv'));
var ValueTransferMessage = require('mintchip-tools').ValueTransferMessage

var connection = new sql.Connection({
  // TODO: fill in
});

connection.connect()
.then(function () {
  return new sql.Request(connection)
  .query('select * from asset_store_sequential_logs')
  .then(function (records) {
    if ( ! records || records.length < 1 ) {
      throw new Error('No logs found.');
    }

    return Promise.map(records, function (record) {
      var vtm = new ValueTransferMessage(record.vtm);
      // add type to vtm
      switch ( record.transaction_type ) {
        case 0: vtm.type = 'Credit'; break;
        case 1: vtm.type = 'Debit' ; break;
      }

      vtm.vtm = record.vtm;
      return vtm;
    })
    .filter(function (vtm) {
      // filter out value origination
      return vtm.payerId[1] !== '0';
    });
  })
  .then(function (vtms) {
    var map = {};
    vtms.forEach(function (vtm) {
      // use signature of the vtm as it is guaranteed to be unique
      var signature = vtm.signature.toString('hex');
      if ( ! map[signature] ) {
        map[signature] = vtm;
        return;
      }

      var current = vtm;
      var existing = map[signature];

      // remove from map if current and existing vtm types cancel out
      if ( current.type === 'Credit' && existing.type === 'Debit' ) {
        delete map[signature];
      }

      // remove from map if current and existing vtm types cancel out
      if ( current.type === 'Debit' && existing.type === 'Credit' ) {
        delete map[signature];
      }
    });

    // flatten the map to be a list of vtms
    return Promise.map(Object.keys(map), function (k) {
      return map[k];
    });
  })
  .then(function (results) {
    return json2csv({
      data: results,
      fields: [
        'payerId',
        'payeeId',
        'amount',
        'vtm'
      ]
    });
  })
  .then(function (csv) {
    return fs.writeFileSync('pending_vtms.csv', csv);
  });
})
.then(function () {
  console.log('success');
  process.exit(0);
})
.catch(function (err) {
  console.error(err);
  process.exit(1);
})
.finally(function () {
  if ( connection ) {
    connection.close();
  }
})
