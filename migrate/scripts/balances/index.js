'use strict';

global.Promise = require('bluebird');

var sql = require('mssql');
sql.Promise = require('bluebird');

var fs = require('fs');
var json2csv = Promise.promisify(require('json2csv'));
var MintChipInfo = require('mintchip-tools').MintChipInfo
var MongoClient = require('mongodb').MongoClient;

require('dotenv').config({
  path: '/etc/.prod.migration.env'
});

var connection = new sql.Connection({
  user:              process.env.MSSQL_USER,
  password:          process.env.MSSQL_PASS,
  server:            process.env.MSSQL_SERVER,
  port:              process.env.MSSQL_PORT,
  database:          process.env.MSSQL_DB,
  connectionTimeout: process.env.MSSQL_TIMEOUT,
  requestTimeout:    process.env.MSSQL_TIMEOUT
});

Promise.all([
  MongoClient.connect(process.env.API_MONGODB_URL),
  connection.connect()
])
.then(function (res) {

  var maindbo = res[0].db('prod');

  return new sql.Request(connection)
  .query('select * from asset_store_list where status_code != 1 and store_id >= 0x2000000000000000')
  .then(function (records) {
    if ( ! records || records.length < 1 ) {
      throw new Error('No asset stores found.');
    }

    return Promise.map(records, function (record) {
      return maindbo.collection('mintchipConsumer').findOne({
        'secureAssetStore': parseFloat(record.store_id.toString('hex'))
      })
      .then(function (doc) {
        if ( doc === null ) return Promise.resolve(false);
        return maindbo.collection('user').findOne({
          '_id': doc.userId
        });

      })
      .then(function (doc) {
        var info = MintChipInfo.ParseStoreContextForInfo(record.store_context);

        // attach email
        if ( doc !== null ) {
          info.email = doc.email;
        }

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
          case '2.6': info.balance = '$' + (info.balance /   100.0 ).toFixed(4); break;
          case '2.7': info.balance = '$' + (info.balance / 10000.0 ).toFixed(4); break;
        }

        return info;
      });
    });
  })
  .then(function (results) {
    return json2csv({
      data: results,
      fields: [
        'id',
        'email',
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
});
