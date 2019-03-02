'use strict';

global.Promise = require('bluebird');

var sql = require('mssql');
sql.Promise = require('bluebird');

var MintChipInfo = require('mintchip-tools').MintChipInfo;
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
  connection.connect(),
])
.then(function (res) {

  var maindbo = res[0].db('prod');

  return new sql.Request(connection)
  .query('select * from asset_store_list where status_code != 1')
  .then(function (records) {
    if ( ! records || records.length < 1 ) {
      throw new Error('No asset stores found.');
    }

    return Promise.map(records, function (record) {
      return MintChipInfo.ParseStoreContextForInfo(record.store_context);
    })
    .filter(function (info) {
      // filter out stores with zero balance
      return info.balance === 0;
    })
    .then(function (records) {
      return Promise.map(records, function (record) {
        return maindbo.collection('mintchipConsumer').findOne({
          'secureAssetStore': parseFloat(record.id)
        })
        .then(function (doc) {
          if ( doc === null ) throw new Error();
          // set user to be disabled
          return maindbo.collection('user').updateOne({ '_id': doc.userId }, { '$set': { 'enabled': false } });
        })
        .then(function () {
          // block secure asset store
          return new sql.Request(connection).query('update asset_store_list set status_code = 3 where store_id = 0x' + record.id);
        })
        .catch(function (err) {
          return Promise.resolve(false);
        })
      });
    });
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
