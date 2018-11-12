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
var cryptoDbUrl = '';
var connection = new sql.Connection({
  // TODO: fill in
});

Promise.all([
  MongoClient.connect(mainDbUrl),
  MongoClient.connect(cryptoDbUrl),
  connection.connect(),
])
.then(function (res) {

  var maindbo = res[0].db('prod');
  var cryptodb = res[1].db('crypto-service-prod');

  return new sql.Request(connection)
  .query('select * from asset_store_list where status_code != 1')
  .then(function (records) {
    if ( ! records || records.length < 1 ) {
      throw new Error('No asset stores found.');
    }

    return Promise.map(records, function (record) {
      var info = MintChipInfo.ParseStoreContextForInfo(record.store_context);

      // format balance into human readable format
      switch ( info.version ) {
        case '2.6': info.balance = '$' + ( info.balance /   100.0 ).toFixed(4); break;
        case '2.7': info.balance = '$' + ( info.balance / 10000.0 ).toFixed(4); break;
      }

      return maindbo.collection('mintchipConsumer').findOne({
        'secureAssetStore': parseFloat(record.store_id.toString('hex'))
      })
      .then(function (doc) {
        if ( doc === null ) throw new Error();
        return maindbo.collection('user').findOne({
          '_id': doc.userId
        })
      })
      .then(function (user) {
        if ( user === null ) throw new Error();

        var cipherTexts = {
          'firstName': user.firstName,
          'lastName': user.lastName
        };

        return cryptodb.collection('AESKey').findOne({
          'ownerId': user.email
        })
        .then(function (doc) {
          if ( doc === null ) throw new Error();

          var key = doc.key;
          var iv = doc.iv;
          var decipher = forge.cipher.createDecipher('AES-CBC', key);

          Object.keys(cipherTexts).forEach(function (k) {
            var input = forge.util.createBuffer(forge.util.decode64(cipherTexts[k]));
            decipher.start({ iv: iv });
            decipher.update(input);
            decipher.finish();

            user[k] = decipher.output.getBytes();
          });

          user.balance = info.balance;
          return user;
        });
      })
      .catch(function (err) {
        return Promise.resolve(false);
      });
    })
    .then(function (results) {
      return Promise.all([
        results.filter(function (result) {
          return result.balance === '$0.0000';

        }),
        results.filter(function (result) {
          return result.balance !== '$0.0000';
        })
      ]);
    })
    .then(function (results) {
      return Promise.all([
        json2csv({
          data: results[0],
          fields: [
            'firstName',
            'email',
            'balance'
          ]
        }),
        json2csv({
          data: results[1],
          fields: [
            'firstName',
            'email',
            'balance'
          ]
        })
      ]);
    })
    .then(function (csvs) {
      return Promise.all([
        fs.writeFileSync('asset_stores_with_zero_balance.csv', csvs[0]),
        fs.writeFileSync('asset_stores_with_non_balance.csv', csvs[1])
      ]);
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
