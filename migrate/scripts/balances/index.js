'use strict';

global.Promise = require('bluebird');

var sql = require('mssql');
sql.Promise = require('bluebird');

var fs = require('fs');
var json2csv = Promise.promisify(require('json2csv'));
var MintChipInfo = require('mintchip-tools').MintChipInfo

var connection = new sql.Connection({
  // TODO: fill in
});

connection.connect(function (err) {
  if ( err ) {
    throw err;
  }

  new sql.Request(connection)
  .query('select * from asset_store_list where status_code != 1')
  .then(function (records) {
    if ( ! records || records.length < 1 ) {
      throw new Error('No asset stores found.');
    }

    return Promise.map(records, function (record) {
      var info = MintChipInfo.ParseStoreContextForInfo(record.store_context);

      // add status
      switch ( record.status_code ) {
        case 1: info.status = 'Unassigned'; break;
        case 2: info.status = 'Active';     break;
        case 3: info.status = 'Blocked';    break;
      }

      // add store type
      switch ( record.store_type ) {
        case 0: info.type = 'Originator';   break;
        case 1: info.type = 'Broker';       break;
        case 2: info.type = 'Merchant';     break;
        case 3: info.type = 'Consumer';     break;
        case 4: info.type = 'Minter';       break;
      }

      // format balance into human readable format
      switch ( info.version ) {
        case '2.6': info.balance = '$' + (info.balance /   100.0 ).toFixed(2); break;
        case '2.7': info.balance = '$' + (info.balance / 10000.0 ).toFixed(4); break;
      }

      return info;
    })
    .filter(function (info) {
      return info.version === '2.7';
    });
  })
  .then(function (results) {
    return json2csv({
      data: results,
      fields: [
        'id',
        'type',
        'status',
        'currencyCode',
        'balance',
        'creditLogCount',
        'debitLogCount'
      ]
    });
  })
  .then(function (csv) {
    return fs.writeFileSync('asset_store_list.csv', csv);
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
  });
});

sql.on('error', function (err) {
  throw err;
});
