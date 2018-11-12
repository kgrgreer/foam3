'use strict';

global.Promise = require('bluebird');

var sql = require('mssql');
sql.Promise = require('bluebird');

var fs = require('fs');
var forge = require('node-forge');
var json2csv = Promise.promisify(require('json2csv'));
var MintChipInfo = require('mintchip-tools').MintChipInfo;
var MongoClient = require('mongodb').MongoClient;

var mainDbUrl = '';
var connection = new sql.Connection({
  // TODO: fill in
});

Promise.all([
  MongoClient.connect(mainDbUrl),
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
//          return maindbo.collection('user').updateOne({
//            '_id': doc.userId
//          }, { '$set': { 'enabled': false } });
        })
        .then(function () {
//          return new sql.Request(connection).query('update asset_store_list set status_code = 3 where store_id = 0x' + record.id);
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
});
