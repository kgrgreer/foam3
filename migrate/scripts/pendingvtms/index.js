'use strict';

global.Promise = require('bluebird');

var sql = require('mssql');
sql.Promise = require('bluebird');

var fs = require('fs');
var json2csv = Promise.promisify(require('json2csv'));
var MongoClient = require('mongodb').MongoClient;
var ValueTransferMessage = require('mintchip-tools').ValueTransferMessage

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

// mapping of special accounts
var special = {
  '1110000000000005': 'Broker',
  '1310000000002330': 'Registration Bonus',
  '1310000000033673': 'MintChip Cash Back',
  '2110000000000011': 'Broker',
  '2310000000002338': 'Registration Bonus',
  '2310000000033630': 'MintChip Cash Back'
};

Promise.all([
  MongoClient.connect(process.env.API_MONGODB_URL),
  connection.connect()
])
.then(function (res) {

  var maindbo = res[0].db('prod');

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

      var amount = null;
      switch ( vtm.version ) {
        case '2.6': amount = '$' + ( vtm.amount /   100.0 ).toFixed(4); break;
        case '2.7': amount = '$' + ( vtm.amount / 10000.0 ).toFixed(4); break;
      }

      return {
        payerId: vtm.payerId,
        payeeId: vtm.payeeId,
        type: vtm.type,
        amount: amount,
        signature: vtm.signature,
        vtm: record.vtm
      };
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
  .then(function (vtms) {
    var userCollection = maindbo.collection('user');
    var consumerCollection = maindbo.collection('mintchipConsumer');

    return Promise.map(vtms, function (vtm) {
      return Promise.all([
        consumerCollection.findOne({
          'secureAssetStore': parseFloat(vtm.payerId)
        }),
        consumerCollection.findOne({
          'secureAssetStore': parseFloat(vtm.payeeId)
        })
      ])
      .then(function (results) {
        var payer = results[0];
        var payee = results[1];

        return Promise.all([
          payer !== null ? userCollection.findOne({
            '_id': payer.userId
          }) : Promise.resolve(null),
          payee !== null ? userCollection.findOne({
            '_id': payee.userId
          }) : Promise.resolve(null)
        ]);
      })
      .then(function (results) {
        var payer = results[0];
        var payee = results[1];

        if ( payer !== null ) {
          vtm.payerEmail = payer.email;
        } else {
          vtm.payerEmail = special[vtm.payerId] || null;
        }

        if ( payee !== null ) {
          vtm.payeeEmail = payee.email;
        } else {
          vtm.payeeEmail = special[vtm.payeeId] || null;
        }

        return vtm;
      })
    })
  })
  .then(function (results) {
    return json2csv({
      data: results,
      fields: [
        'payerId',
        'payeeId',
        'payerEmail',
        'payeeEmail',
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
});
