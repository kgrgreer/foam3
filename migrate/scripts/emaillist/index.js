'use strict';

global.Promise = require('bluebird');

var sql = require('mssql');
sql.Promise = require('bluebird');

var fs = require('fs');
var forge = require('node-forge');
var json2csv = Promise.promisify(require('json2csv'));
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
  MongoClient.connect(process.env.CRYPTO_MONGODB_URL),
  connection.connect(),
])
.then(function (res) {

  var maindbo = res[0].db('prod');
  var cryptodb = res[1].db('crypto-service-prod');

  return new sql.Request(connection)
  .query('select * from asset_store_list where status_code != 1 and store_id >= 0x2000000000000000')
  .then(function (records) {
    if ( ! records || records.length < 1 ) {
      throw new Error('No asset stores found.');
    }

    return Promise.map(records, function (record) {
      var info = MintChipInfo.ParseStoreContextForInfo(record.store_context);

      return maindbo.collection('mintchipConsumer').findOne({
        'secureAssetStore': parseFloat(record.store_id.toString('hex'))
      })
      .then(function (doc) {
        if ( doc === null ) throw new Error();
        return maindbo.collection('user').findOne({
          '_id': doc.userId,
          'email': {
            $nin: [
              'tch@iassist.ca',
              'glebsuhatski@gmail.com',
              'fredakennedy@gmail.com',
              '62oranges@gmail.com',
              'sskalinski@icloud.com',
              'viannayau@gmail.com',
              'julie.oc@gmail.com',
              'jhcyoung@icloud.com'
            ]
          }
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
          user.version = info.version;
          user.credits = info.creditLogCount;
          user.debits = info.debitLogCount;
          return user;
        });
      })
      .catch(function (err) {
        return Promise.resolve(false);
      });
    })
    .then(function (results) {
      // filter out duplicate emails and add their balances
      // happens in the case where a single merchant has multiple devices
      // each device has their own secure asset store.
      for ( var i = 0 ; i < results.length ; i++ ) {
        for ( var j = i + 1 ; j < results.length ; j++ ) {
          if ( ! results[i] || ! results[j] ) {
            continue;
          }

          // add balances
          if ( results[i]['email'] === results[j]['email'] ) {
            results[i]['balance'] += results[j]['balance'];
            results[i]['credits'] += results[j]['credits'];
            results[i]['debits'] += results[j]['debits'];
            results[j] = false;
          }
        }
      }

      // filter out false values
      results = results.filter(function (result) {
        return result !== false;
      });

      // convert balance into human readable format
      results = results.map(function (result) {
        switch ( result.version ) {
          case '2.6': result.balance = '$' + (result.balance /   100.00).toFixed(2); break;
          case '2.7': result.balance = '$' + (result.balance / 10000.00).toFixed(2); break;
        }
        return result;
      });

      // filter zero balances
      var zeroBalance = results.filter(function (result) {
        return ( result.balance === '$0.00' );
      });

      // filter non zero balances
      var nonZeroBalance = results.filter(function (result) {
        if ( result.balance === '$0.00' ) {
          return false;
        }

        if ( result.balance === '$2.00' || result.balance === '$5.00' || result.balance === '$7.00' )  {
          if ( result.credits === 1 && result.debits === 0 ) {
            return false;
          }
        }

        return true;
      });

      // filter promo balances
      var promoBalance = results.filter(function (result) {
        if ( result.balance === '$0.00' ) {
          return false;
        }

        if ( result.balance === '$2.00' || result.balance === '$5.00' || result.balance === '$7.00' )  {
          if ( result.credits === 1 && result.debits === 0 ) {
            return true;
          }
        }

        return false;
      });

      return Promise.all([
        // zero balance - enabled
        zeroBalance.filter(function (result) {
          return result.enabled === true;
        }),
        // zero balance - disabled
        zeroBalance.filter(function (result) {
          return result.enabled === false;
        }),
        // non-zero balance - enabled
        nonZeroBalance.filter(function (result) {
          return result.enabled === true;
        }),
        // non-zero balance - disabled
        nonZeroBalance.filter(function (result) {
          return result.enabled === false;
        }),
        // promo-balance - enabled
        promoBalance.filter(function (result) {
          return result.enabled === true;
        }),
        // promo-balance - disabled
        promoBalance.filter(function (result) {
          return result.enabled === false;
        })
      ]);
    })
    .then(function (results) {
      var fields = ['firstName','email','balance'];
      return Promise.all([
        json2csv({ data: results[0], fields: fields }),
        json2csv({ data: results[1], fields: fields }),
        json2csv({ data: results[2], fields: fields }),
        json2csv({ data: results[3], fields: fields }),
        json2csv({ data: results[4], fields: fields }),
        json2csv({ data: results[5], fields: fields })
      ]);
    })
    .then(function (csvs) {
      return Promise.all([
        fs.writeFileSync('enabled_zero_balance_asset_stores.csv', csvs[0]),
        fs.writeFileSync('disabled_zero_balance_asset_stores.csv', csvs[1]),
        fs.writeFileSync('enabled_non_zero_balance_asset_stores.csv', csvs[2]),
        fs.writeFileSync('disabled_non_zero_balance_asset_stores.csv', csvs[3]),
        fs.writeFileSync('enabled_promo_balance_asset_stores.csv', csvs[4]),
        fs.writeFileSync('disabled_promo_balance_asset_stores.csv', csvs[5])
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
