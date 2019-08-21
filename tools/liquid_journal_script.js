var npRoot = __dirname + '/../';

global.FOAM_FLAGS = {
  js: true,
  web: true,
  node: true,
  java: true,
  swift: true,
};

require(npRoot + 'foam2/src/foam.js');
require(npRoot + 'foam2/src/foam/nanos/nanos.js');
require(npRoot + 'foam2/src/foam/support/support.js');

var classloader = foam.__context__.classloader;
[
  npRoot + 'nanopay/src',
].forEach(classloader.addClassPath.bind(classloader));

var old = global.FOAM_FLAGS.src;
var oldRoot = global.FOAM_ROOT;
global.FOAM_FLAGS.src = npRoot + 'nanopay/src/'; // Hacky
require(npRoot + 'nanopay/src/net/nanopay/files.js');
require(npRoot + 'nanopay/src/net/nanopay/iso20022/files.js');
require(npRoot + 'nanopay/src/net/nanopay/iso8583/files.js');
require(npRoot + 'nanopay/src/net/nanopay/flinks/utils/files.js');
global.FOAM_FLAGS.src = old;
global.FOAM_ROOT = oldRoot;

/**
 * Manually add the new currencies and new trust accounts that need to be created
 * b/c for now I don't know how we can query the existing currencies or accounts here
 */

// for new currencies need to create an object defining AT LEAST
/**
    {
      name,
      alphabeticCode,
      numericCode,
      country
    }
 */
var newCurrencies = [];
var newTrustAccountDenominations = ['USD', 'CNY', 'HKD', 'JPY', 'MXN'];

// what number the account IDs should start up
var startAccountIds = 1000;

// can enter banks with new currencies just by typing the denomination ('alphabetic code')
var accountTree = [
  {
    type: 'Bank',
    denomination: 'USD',
    name: 'GS02'
  },
  {
    type: 'Bank',
    denomination: 'USD',
    name: 'GS03'
  },
  {
    type: 'Bank',
    denomination: 'USD',
    name: 'GS10'
  },
  {
    type: 'Bank',
    denomination: 'USD',
    name: 'GS11'
  },
  {
    type: 'Bank',
    denomination: 'USD',
    name: 'GS13'
  },
  {
    type: 'Bank',
    denomination: 'USD',
    name: 'GS00'
  },
  {
    type: 'Bank',
    denomination: 'USD',
    name: 'GS01'
  },
  {
    type: 'Bank',
    denomination: 'USD',
    name: 'GS05'
  },
  {
    type: 'Bank',
    denomination: 'USD',
    name: 'GS06'
  },
  {
    type: 'Bank',
    denomination: 'USD',
    name: 'GS07'
  },
  {
    type: 'Bank',
    denomination: 'USD',
    name: 'GS08'
  },
  {
    type: 'Bank',
    denomination: 'USD',
    name: 'GS09'
  },
  {
    type: 'Bank',
    denomination: 'USD',
    name: 'GS12'
  },
  {
    type: 'Bank',
    denomination: 'USD',
    name: 'GS04'
  },
  {
    type: 'Bank',
    denomination: 'USD',
    name: 'GS14'
  },
  {
    type: 'Bank',
    denomination: 'USD',
    name: 'GS15'
  },
  {
    type: 'Bank',
    denomination: 'USD',
    name: 'GS16'
  },
  {
    type: 'Aggregate', denomination: 'USD',
    name: 'Goldman Sachs Group, Inc',
    children: [
      {
        type: 'Aggregate', denomination: 'USD',
        name: 'Goldman Sachs Asia',
        children: [
          {
            type: 'Aggregate', denomination: 'USD',
            name: 'GS02',
            children: [
              {
                type: 'Aggregate', denomination: 'USD',
                name: 'GS02 (SECURITIES)',
                children: [
                  {
                    type: 'Virtual',
                    name: 'GS02 SECURITIES (ARS)',
                    denomination: 'ARS'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS02 SECURITIES (BRL)',
                    denomination: 'BRL'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS02 SECURITIES (CHF)',
                    denomination: 'CHF'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS02 SECURITIES (CLP)',
                    denomination: 'CLP'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS02 SECURITIES (CNY)',
                    denomination: 'CNY'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS02 SECURITIES (DEM)',
                    denomination: 'DEM'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS02 SECURITIES (EGP)',
                    denomination: 'EGP'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS02 SECURITIES (EUR)',
                    denomination: 'EUR'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS02 SECURITIES (IDR)',
                    denomination: 'IDR'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS02 SECURITIES (KRW)',
                    denomination: 'KRW'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS02 SECURITIES (MXN)',
                    denomination: 'MXN'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS02 SECURITIES (NLG)',
                    denomination: 'NLG'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS02 SECURITIES (PEN)',
                    denomination: 'PEN'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS02 SECURITIES (SEK)',
                    denomination: 'SEK'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS02 SECURITIES (TRY)',
                    denomination: 'TRY'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS02 SECURITIES (USD)',
                    denomination: 'USD'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS02 SECURITIES (JPY)',
                    denomination: 'JPY'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS02 SECURITIES (CAD)',
                    denomination: 'CAD'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS02 SECURITIES (HKD)',
                    denomination: 'HKD'
                  },
                ]
              },
              {
                type: 'Aggregate', denomination: 'USD',
                name: 'GS02 (CASH)',
                children: [
                  {
                    type: 'Virtual',
                    name: 'GS02 CASH (JPY)',
                    denomination: 'JPY'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS02 CASH (USD)',
                    denomination: 'USD'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS02 CASH (CHF)',
                    denomination: 'CHF'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS02 CASH (EUR)',
                    denomination: 'EUR'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS02 CASH (TRY)',
                    denomination: 'TRY'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS02 CASH (HKD)',
                    denomination: 'HKD'
                  },
                ]
              }
            ]
          },
          {
            type: 'Aggregate', denomination: 'USD',
            name: 'GS03',
            children: [
              {
                type: 'Aggregate', denomination: 'USD',
                name: 'GS03 (SECURITIES)',
                children: [
                  {
                    type: 'Virtual',
                    name: 'GS03 SECURITIES (CNY)',
                    denomination: 'CNY'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS03 SECURITIES (HKD)',
                    denomination: 'HKD'
                  }
                ]
              },
              {
                type: 'Aggregate', denomination: 'USD',
                name: 'GS03 (CASH)',
                children: [
                  {
                    type: 'Virtual',
                    name: 'GS03 CASH (CNY)',
                    denomination: 'CNY'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS03 CASH (HKD)',
                    denomination: 'HKD'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS03 CASH (USD)',
                    denomination: 'USD'
                  }
                ]
              }
            ]
          },
          {
            type: 'Aggregate', denomination: 'USD',
            name: 'GS10',
            children: [
              {
                type: 'Aggregate', denomination: 'USD',
                name: 'GS10 (SECURITIES)',
                children: [
                  {
                    type: 'Virtual',
                    name: 'GS10 SECURITIES (AUD)',
                    denomination: 'AUD'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS10 SECURITIES (ARS)',
                    denomination: 'ARS'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS10 SECURITIES (BRL)',
                    denomination: 'BRL'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS10 SECURITIES (CAD)',
                    denomination: 'CAD'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS10 SECURITIES (CHF)',
                    denomination: 'CHF'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS10 SECURITIES (CNY)',
                    denomination: 'CNY'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS10 SECURITIES (CZK)',
                    denomination: 'CZK'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS10 SECURITIES (DKK)',
                    denomination: 'DKK'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS10 SECURITIES (EUR)',
                    denomination: 'EUR'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS10 SECURITIES (GBP)',
                    denomination: 'GBP'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS10 SECURITIES (HKD)',
                    denomination: 'HKD'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS10 SECURITIES (HUF)',
                    denomination: 'HUF'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS10 SECURITIES (ILS)',
                    denomination: 'ILS'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS10 SECURITIES (JPY)',
                    denomination: 'JPY'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS10 SECURITIES (KRW)',
                    denomination: 'KRW'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS10 SECURITIES (MXN)',
                    denomination: 'MXN'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS10 SECURITIES (NLG)',
                    denomination: 'NLG'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS10 SECURITIES (NOK)',
                    denomination: 'NOK'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS10 SECURITIES (NZD)',
                    denomination: 'NZD'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS10 SECURITIES (PEN)',
                    denomination: 'PEN'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS10 SECURITIES (PLN)',
                    denomination: 'PLN'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS10 SECURITIES (RUB)',
                    denomination: 'RUB'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS10 SECURITIES (SEK)',
                    denomination: 'SEK'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS10 SECURITIES (SGD)',
                    denomination: 'SGD'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS10 SECURITIES (THB)',
                    denomination: 'THB'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS10 SECURITIES (USD)',
                    denomination: 'USD'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS10 SECURITIES (ZAR)',
                    denomination: 'ZAR'
                  }
                ]
              },
              {
                type: 'Aggregate', denomination: 'USD',
                name: 'GS10 (CASH)',
                children: [
                  {
                    type: 'Virtual',
                    name: 'GS10 CASH (AUD)',
                    denomination: 'AUD'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS10 CASH (BRL)',
                    denomination: 'BRL'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS10 CASH (CAD)',
                    denomination: 'CAD'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS10 CASH (CHF)',
                    denomination: 'CHF'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS10 CASH (CNY)',
                    denomination: 'CNY'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS10 CASH (EUR)',
                    denomination: 'EUR'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS10 CASH (GBP)',
                    denomination: 'GBP'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS10 CASH (HKD)',
                    denomination: 'HKD'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS10 CASH (HUF)',
                    denomination: 'HUF'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS10 CASH (ILS)',
                    denomination: 'ILS'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS10 CASH (JPY)',
                    denomination: 'JPY'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS10 CASH (MXN)',
                    denomination: 'MXN'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS10 CASH (PLN)',
                    denomination: 'PLN'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS10 CASH (RUB)',
                    denomination: 'RUB'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS10 CASH (TRY)',
                    denomination: 'TRY'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS10 CASH (USD)',
                    denomination: 'USD'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS10 CASH (CZK)',
                    denomination: 'CZK'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS10 CASH (THB)',
                    denomination: 'THB'
                  }
                ]
              }
            ]
          },
          {
            type: 'Aggregate',
            denomination: 'USD',
            name: 'GS11',
            children: [
              {
                type: 'Aggregate', denomination: 'USD',
                name: 'GS11 (SECURITIES)',
                children: [
                  {
                    type: 'Virtual',
                    name: 'GS11 SECURITIES (JPY)',
                    denomination: 'JPY'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS11 SECURITIES (EUR)',
                    denomination: 'EUR'
                  }
                ]
              },
              {
                type: 'Aggregate', denomination: 'USD',
                name: 'GS11 (CASH)',
                children: [
                  {
                    type: 'Virtual',
                    name: 'GS11 CASH (EUR)',
                    denomination: 'EUR'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS11 CASH (JPY)',
                    denomination: 'JPY'
                  }
                ]
              }
            ]
          },
          {
            type: 'Aggregate',
            denomination: 'USD',
            name: 'GS13',
            children: [
              {
                type: 'Aggregate', denomination: 'USD',
                name: 'GS13 (SECURITIES)',
                children: [
                  {
                    type: 'Virtual',
                    name: 'GS13 SECURITIES (USD)',
                    denomination: 'USD'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS13 SECURITIES (MXN)',
                    denomination: 'MXN'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS13 SECURITIES (UDI)',
                    denomination: 'UDI'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS13 SECURITIES (JPY)',
                    denomination: 'JPY'
                  }
                ]
              },
              {
                type: 'Aggregate', denomination: 'USD',
                name: 'GS13 (CASH)',
                children: [
                  {
                    type: 'Virtual',
                    name: 'GS13 CASH (EUR)',
                    denomination: 'EUR'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS13 CASH (JPY)',
                    denomination: 'JPY'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS13 CASH (USD)',
                    denomination: 'USD'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS13 CASH (MXN)',
                    denomination: 'MXN'
                  }
                ]
              }
            ]
          },
        ]
      },
      {
        type: 'Aggregate', denomination: 'USD',
        name: 'Goldman Sachs Int\'l',
        children: [
          {
            type: 'Aggregate', denomination: 'USD',
            name: 'GS00',
            children: [
              {
                type: 'Aggregate', denomination: 'USD',
                name: 'GS00 (SECURITIES)',
                children: [
                  {
                    type: 'Virtual',
                    name: 'GS00 SECURITIES (AUD)',
                    denomination: 'AUD'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS00 SECURITIES (EUR)',
                    denomination: 'EUR'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS00 SECURITIES (USD)',
                    denomination: 'USD'
                  },
                ]
              },
              {
                type: 'Aggregate', denomination: 'USD',
                name: 'GS00 (CASH)',
                children: [
                  {
                    type: 'Virtual',
                    name: 'GS00 CASH (AUD)',
                    denomination: 'AUD'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS00 CASH (USD)',
                    denomination: 'USD'
                  }
                ]
              }
            ]
          },

          {
            type: 'Aggregate', denomination: 'USD',
            name: 'GS01',
            children: [
              {
                type: 'Aggregate', denomination: 'USD',
                name: 'GS01 (SECURITIES)',
                children: [
                  {
                    type: 'Virtual',
                    name: 'GS01 SECURITIES (AUD)',
                    denomination: 'AUD'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS01 SECURITIES (ARS)',
                    denomination: 'ARS'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS01 SECURITIES (BRL)',
                    denomination: 'BRL'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS01 SECURITIES (CHF)',
                    denomination: 'CHF'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS01 SECURITIES (CLP)',
                    denomination: 'CLP'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS01 SECURITIES (CNH)',
                    denomination: 'CNH'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS01 SECURITIES (CNY)',
                    denomination: 'CNY'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS01 SECURITIES (CZK)',
                    denomination: 'CZK'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS01 SECURITIES (DEM)',
                    denomination: 'DEM'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS01 SECURITIES (DKK)',
                    denomination: 'DKK'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS01 SECURITIES (EGP)',
                    denomination: 'EGP'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS01 SECURITIES (EUR)',
                    denomination: 'EUR'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS01 SECURITIES (IDR)',
                    denomination: 'IDR'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS01 SECURITIES (INR)',
                    denomination: 'INR'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS01 SECURITIES (KRW)',
                    denomination: 'KRW'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS01 SECURITIES (PEN)',
                    denomination: 'PEN'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS01 SECURITIES (SEK)',
                    denomination: 'SEK'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS01 SECURITIES (THB)',
                    denomination: 'THB'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS01 SECURITIES (TRY)',
                    denomination: 'TRY'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS01 SECURITIES (USD)',
                    denomination: 'USD'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS01 SECURITIES (ZAR)',
                    denomination: 'ZAR'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS01 SECURITIES (MXN)',
                    denomination: 'MXN'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS01 SECURITIES (NLG)',
                    denomination: 'NLG'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS01 SECURITIES (RON)',
                    denomination: 'RON'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS01 SECURITIES (GBP)',
                    denomination: 'GBP'
                  }
                ]
              },
              {
                type: 'Aggregate', denomination: 'USD',
                name: 'GS01 (CASH)',
                children: [
                  {
                    type: 'Virtual',
                    name: 'GS01 CASH (AUD)',
                    denomination: 'AUD'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS01 CASH (CHF)',
                    denomination: 'CHF'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS01 CASH (EUR)',
                    denomination: 'EUR'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS01 CASH (TRY)',
                    denomination: 'TRY'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS01 CASH (USD)',
                    denomination: 'USD'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS01 CASH (MXN)',
                    denomination: 'MXN'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS01 CASH (GBP)',
                    denomination: 'GBP'
                  }
                ]
              },
            ]
          },
          {
            type: 'Aggregate',
            denomination: 'USD',
            name: 'GS05',
            children: [
              {
                type: 'Aggregate',
                denomination: 'USD',
                name: 'GS05 (SECURITIES)',
                children: [
                  {
                    type: 'Virtual',
                    name: 'GS05 SECURITIES (BRL)',
                    denomination: 'BRL'
                  },
                ]
              },
              {
                type: 'Aggregate',
                denomination: 'USD',
                name: 'GS05 (CASH)',
                children: [
                  {
                    type: 'Virtual',
                    name: 'GS05 CASH (BRL)',
                    denomination: 'BRL'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS05 CASH (USD)',
                    denomination: 'USD'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS05 CASH (CHF)',
                    denomination: 'CHF'
                  }
                ]
              },
            ]
          },
          {
            type: 'Aggregate',
            denomination: 'USD',
            name: 'GS06',
            children: [
              {
                type: 'Aggregate', denomination: 'USD',
                name: 'GS06 (SECURITIES)',
                children: [
                  {
                    type: 'Virtual',
                    name: 'GS06 SECURITIES (EUR)',
                    denomination: 'EUR'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS06 SECURITIES (ILS)',
                    denomination: 'ILS'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS06 SECURITIES (USD)',
                    denomination: 'USD'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS06 SECURITIES (BRL)',
                    denomination: 'BRL'
                  }
                ]
              },
              {
                type: 'Aggregate',
                denomination: 'USD',
                name: 'GS06 (CASH)',
                children: [
                  {
                    type: 'Virtual',
                    name: 'GS06 CASH (AUD)',
                    denomination: 'AUD'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS06 CASH (BRL)',
                    denomination: 'BRL'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS06 CASH (CHF)',
                    denomination: 'CHF'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS06 CASH (CNY)',
                    denomination: 'CNY'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS06 CASH (DKK)',
                    denomination: 'DKK'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS06 CASH (EUR)',
                    denomination: 'EUR'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS06 CASH (GBP)',
                    denomination: 'GBP'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS06 CASH (HKD)',
                    denomination: 'HKD'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS06 CASH (JPY)',
                    denomination: 'JPY'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS06 CASH (PLN)',
                    denomination: 'PLN'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS06 CASH (SAR)',
                    denomination: 'SAR'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS06 CASH (TRY)',
                    denomination: 'TRY'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS06 CASH (USD)',
                    denomination: 'USD'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS06 CASH (CZK)',
                    denomination: 'CZK'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS06 CASH (HUF)',
                    denomination: 'HUF'
                  }
                ]
              }
            ]
          },
          {
            type: 'Aggregate', denomination: 'USD',
            name: 'GS07',
            children: [
              {
                type: 'Aggregate', denomination: 'USD',
                name: 'GS07 (SECURITIES)',
                children: [
                  {
                    type: 'Virtual',
                    name: 'GS07 SECURITIES (ARS)',
                    denomination: 'ARS'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS07 SECURITIES (AUD)',
                    denomination: 'AUD'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS07 SECURITIES (BRL)',
                    denomination: 'BRL'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS07 SECURITIES (CAD)',
                    denomination: 'CAD'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS07 SECURITIES (CHF)',
                    denomination: 'CHF'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS07 SECURITIES (CLP)',
                    denomination: 'CLP'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS07 SECURITIES (CNY)',
                    denomination: 'CNY'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS07 SECURITIES (DKK)',
                    denomination: 'DKK'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS07 SECURITIES (EGP)',
                    denomination: 'EGP'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS07 SECURITIES (EUR)',
                    denomination: 'EUR'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS07 SECURITIES (GBP)',
                    denomination: 'GBP'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS07 SECURITIES (HKD)',
                    denomination: 'HKD'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS07 SECURITIES (HUF)',
                    denomination: 'HUF'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS07 SECURITIES (IDR)',
                    denomination: 'IDR'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS07 SECURITIES (ILS)',
                    denomination: 'ILS'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS07 SECURITIES (JPY)',
                    denomination: 'JPY'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS07 SECURITIES (MXN)',
                    denomination: 'MXN'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS07 SECURITIES (NOK)',
                    denomination: 'NOK'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS07 SECURITIES (NZD)',
                    denomination: 'NZD'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS07 SECURITIES (PEN)',
                    denomination: 'PEN'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS07 SECURITIES (PLN)',
                    denomination: 'PLN'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS07 SECURITIES (RUB)',
                    denomination: 'RUB'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS07 SECURITIES (SEK)',
                    denomination: 'SEK'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS07 SECURITIES (USD)',
                    denomination: 'USD'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS07 SECURITIES (ZAR)',
                    denomination: 'ZAR'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS07 SECURITIES (INR)',
                    denomination: 'INR'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS07 SECURITIES (KZT)',
                    denomination: 'KZT'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS07 SECURITIES (SGD)',
                    denomination: 'SGD'
                  },
                ]
              },
              {
                type: 'Aggregate', denomination: 'USD',
                name: 'GS07 (CASH)',
                children: [
                  {
                    type: 'Virtual',
                    name: 'GS07 CASH (AUD)',
                    denomination: 'AUD'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS07 CASH (CAD)',
                    denomination: 'CAD'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS07 CASH (CHF)',
                    denomination: 'CHF'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS07 CASH (EUR)',
                    denomination: 'EUR'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS07 CASH (GBP)',
                    denomination: 'GBP'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS07 CASH (HKD)',
                    denomination: 'HKD'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS07 CASH (JPY)',
                    denomination: 'JPY'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS07 CASH (PLN)',
                    denomination: 'PLN'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS07 CASH (USD)',
                    denomination: 'USD'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS07 CASH (CNY)',
                    denomination: 'CNY'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS07 CASH (HUF)',
                    denomination: 'HUF'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS07 CASH (MXN)',
                    denomination: 'MXN'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS07 CASH (RUB)',
                    denomination: 'RUB'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS07 CASH (SGD)',
                    denomination: 'SGD'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS07 CASH (CZK)',
                    denomination: 'CZK'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS07 CASH (TRY)',
                    denomination: 'TRY'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS07 CASH (ILS)',
                    denomination: 'ILS'
                  }
                ]
              }
            ]
          },
          {
            type: 'Aggregate', denomination: 'USD',
            name: 'GS08',
            children: [
              {
                type: 'Aggregate', denomination: 'USD',
                name: 'GS08 (SECURITIES)',
                children: [
                  {
                    type: 'Virtual',
                    name: 'GS08 SECURITIES (EUR)',
                    denomination: 'EUR'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS08 SECURITIES (GBP)',
                    denomination: 'GBP'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS08 SECURITIES (JPY)',
                    denomination: 'JPY'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS08 SECURITIES (USD)',
                    denomination: 'USD'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS08 SECURITIES (ARS)',
                    denomination: 'ARS'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS08 SECURITIES (AUD)',
                    denomination: 'AUD'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS08 SECURITIES (BRL)',
                    denomination: 'BRL'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS08 SECURITIES (CAD)',
                    denomination: 'CAD'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS08 SECURITIES (CHF)',
                    denomination: 'CHF'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS08 SECURITIES (CNY)',
                    denomination: 'CNY'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS08 SECURITIES (CZK)',
                    denomination: 'CZK'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS08 SECURITIES (DKK)',
                    denomination: 'DKK'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS08 SECURITIES (HKD)',
                    denomination: 'HKD'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS08 SECURITIES (HUF)',
                    denomination: 'HUF'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS08 SECURITIES (IDR)',
                    denomination: 'IDR'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS08 SECURITIES (ILS)',
                    denomination: 'ILS'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS08 SECURITIES (MXN)',
                    denomination: 'MXN'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS08 SECURITIES (NOK)',
                    denomination: 'NOK'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS08 SECURITIES (NZD)',
                    denomination: 'NZD'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS08 SECURITIES (PEN)',
                    denomination: 'PEN'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS08 SECURITIES (PLN)',
                    denomination: 'PLN'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS08 SECURITIES (RUB)',
                    denomination: 'RUB'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS08 SECURITIES (SEK)',
                    denomination: 'SEK'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS08 SECURITIES (ZAR)',
                    denomination: 'ZAR'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS08 SECURITIES (SGD)',
                    denomination: 'SGD'
                  }
                ]
              },
              {
                type: 'Aggregate', denomination: 'USD',
                name: 'GS08 (CASH)',
                children: [
                  {
                    type: 'Virtual',
                    name: 'GS08 CASH (AUD)',
                    denomination: 'AUD'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS08 CASH (CAD)',
                    denomination: 'CAD'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS08 CASH (CHF)',
                    denomination: 'CHF'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS08 CASH (EUR)',
                    denomination: 'EUR'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS08 CASH (GBP)',
                    denomination: 'GBP'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS08 CASH (HKD)',
                    denomination: 'HKD'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS08 CASH (JPY)',
                    denomination: 'JPY'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS08 CASH (MXN)',
                    denomination: 'MXN'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS08 CASH (RUB)',
                    denomination: 'RUB'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS08 CASH (USD)',
                    denomination: 'USD'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS08 CASH (CNY)',
                    denomination: 'CNY'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS08 CASH (HUF)',
                    denomination: 'HUF'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS08 CASH (ILS)',
                    denomination: 'ILS'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS08 CASH (PLN)',
                    denomination: 'PLN'
                  }
                ]
              }
            ]
          },

          {
            type: 'Aggregate', denomination: 'USD',
            name: 'GS09',
            children: [
              {
                type: 'Aggregate', denomination: 'USD',
                name: 'GS09 (SECURITIES)',
                children: [
                  {
                    type: 'Virtual',
                    name: 'GS09 SECURITIES (ARS)',
                    denomination: 'ARS'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS09 SECURITIES (AUD)',
                    denomination: 'AUD'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS09 SECURITIES (CHF)',
                    denomination: 'CHF'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS09 SECURITIES (CNY)',
                    denomination: 'CNY'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS09 SECURITIES (CZK)',
                    denomination: 'CZK'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS09 SECURITIES (DKK)',
                    denomination: 'DKK'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS09 SECURITIES (EUR)',
                    denomination: 'EUR'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS09 SECURITIES (GBP)',
                    denomination: 'GBP'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS09 SECURITIES (HKD)',
                    denomination: 'HKD'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS09 SECURITIES (HUF)',
                    denomination: 'HUF'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS09 SECURITIES (ILS)',
                    denomination: 'ILS'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS09 SECURITIES (JPY)',
                    denomination: 'JPY'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS09 SECURITIES (KRW)',
                    denomination: 'KRW'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS09 SECURITIES (MXN)',
                    denomination: 'MXN'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS09 SECURITIES (NLG)',
                    denomination: 'NLG'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS09 SECURITIES (NOK)',
                    denomination: 'NOK'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS09 SECURITIES (NZD)',
                    denomination: 'NZD'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS09 SECURITIES (PEN)',
                    denomination: 'PEN'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS09 SECURITIES (PLN)',
                    denomination: 'PLN'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS09 SECURITIES (RUB)',
                    denomination: 'RUB'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS09 SECURITIES (SEK)',
                    denomination: 'SEK'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS09 SECURITIES (SGD)',
                    denomination: 'SGD'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS09 SECURITIES (THB)',
                    denomination: 'THB'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS09 SECURITIES (TRY)',
                    denomination: 'TRY'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS09 SECURITIES (USD)',
                    denomination: 'USD'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS09 SECURITIES (BRL)',
                    denomination: 'BRL'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS09 SECURITIES (CAD)',
                    denomination: 'CAD'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS09 SECURITIES (SAR)',
                    denomination: 'SAR'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS09 SECURITIES (ZAR)',
                    denomination: 'ZAR'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS09 SECURITIES (KZT)',
                    denomination: 'KZT'
                  }
                ]
              },
              {
                type: 'Aggregate', denomination: 'USD',
                name: 'GS09 (CASH)',
                children: [
                  {
                    type: 'Virtual',
                    name: 'GS09 CASH (CAD)',
                    denomination: 'CAD'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS09 CASH (CNY)',
                    denomination: 'CNY'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS09 CASH (EUR)',
                    denomination: 'EUR'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS09 CASH (GBP)',
                    denomination: 'GBP'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS09 CASH (HKD)',
                    denomination: 'HKD'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS09 CASH (JPY)',
                    denomination: 'JPY'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS09 CASH (RUB)',
                    denomination: 'RUB'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS09 CASH (SAR)',
                    denomination: 'SAR'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS09 CASH (SEK)',
                    denomination: 'SEK'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS09 CASH (TRY)',
                    denomination: 'TRY'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS09 CASH (USD)',
                    denomination: 'USD'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS09 CASH (AUD)',
                    denomination: 'AUD'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS09 CASH (CHF)',
                    denomination: 'CHF'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS09 CASH (DKK)',
                    denomination: 'DKK'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS09 CASH (NOK)',
                    denomination: 'NOK'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS09 CASH (PLN)',
                    denomination: 'PLN'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS09 CASH (CZK)',
                    denomination: 'CZK'
                  }
                ]
              },
            ]
          },
          {
            type: 'Aggregate',
            denomination: 'USD',
            name: 'GS12',
            children: [
              {
                type: 'Aggregate',
                denomination: 'USD',
                name: 'GS12 (SECURITIES)',
                children: [
                  {
                    type: 'Virtual',
                    name: 'GS12 SECURITIES (JPY)',
                    denomination: 'JPY'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS12 SECURITIES (USD)',
                    denomination: 'USD'
                  }
                ]
              },
              {
                type: 'Aggregate',
                denomination: 'USD',
                name: 'GS12 (CASH)',
                children: [
                  {
                    type: 'Virtual',
                    name: 'GS12 CASH (EUR)',
                    denomination: 'EUR'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS12 CASH (ILS)',
                    denomination: 'ILS'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS12 CASH (JPY)',
                    denomination: 'JPY'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS12 CASH (AUD)',
                    denomination: 'AUD'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS12 CASH (USD)',
                    denomination: 'USD'
                  }
                ]
              },
            ]
          },
        ]
      },
      {
        type: 'Aggregate',
        denomination: 'USD',
        name: 'Goldman Sachs CO (NA)',
        children: [
          {
            type: 'Aggregate',
            denomination: 'USD',
            name: 'GS04',
            children: [
              {
                type: 'Aggregate',
                denomination: 'USD',
                name: 'GS04 (SECURITIES)',
                children: [
                  {
                    type: 'Virtual',
                    name: 'GS04 SECURITIES (BRL)',
                    denomination: 'BRL'
                  }
                ]
              },
              {
                type: 'Aggregate',
                denomination: 'USD',
                name: 'GS04 (CASH)',
                children: [
                  {
                    type: 'Virtual',
                    name: 'GS04 CASH (USD)',
                    denomination: 'USD'
                  }
                ]
              }
            ]
          },
          {
            type: 'Aggregate', denomination: 'USD',
            name: 'GS14',
            children: [
              {
                type: 'Aggregate', denomination: 'USD',
                name: 'GS14 (SECURITIES)',
                children: [
                  {
                    type: 'Virtual',
                    name: 'GS14 SECURITIES (MXN)',
                    denomination: 'MXN'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS14 SECURITIES (USD)',
                    denomination: 'USD'
                  }
                ]
              },
              {
                type: 'Aggregate', denomination: 'USD',
                name: 'GS14 (CASH)',
                children: [
                  {
                    type: 'Virtual',
                    name: 'GS14 CASH (AUD)',
                    denomination: 'AUD'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS14 CASH (USD)',
                    denomination: 'USD'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS14 CASH (JPY)',
                    denomination: 'JPY'
                  }
                ]
              }
            ]
          },
          {
            type: 'Aggregate', denomination: 'USD',
            name: 'GS15',
            children: [
              {
                type: 'Aggregate', denomination: 'USD',
                name: 'GS15 (CASH)',
                children: [
                  {
                    type: 'Virtual',
                    name: 'GS15 CASH (JPY)',
                    denomination: 'JPY'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS15 CASH (USD)',
                    denomination: 'USD'
                  }
                ]
              }
            ]
          },
          {
            type: 'Aggregate', denomination: 'USD',
            name: 'GS16',
            children: [
              {
                type: 'Aggregate', denomination: 'USD',
                name: 'GS16 (SECURITIES)',
                children: [
                  {
                    type: 'Virtual',
                    name: 'GS16 SECURITIES (MXN)',
                    denomination: 'MXN'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS16 SECURITIES (UDI)',
                    denomination: 'UDI'
                  }
                ]
              },
              {
                type: 'Aggregate', denomination: 'USD',
                name: 'GS16 (CASH)',
                children: [
                  {
                    type: 'Virtual',
                    name: 'GS16 CASH (USD)',
                    denomination: 'USD'
                  },
                  {
                    type: 'Virtual',
                    name: 'GS16 CASH (MXN)',
                    denomination: 'MXN'
                  }
                ]
              }
            ]
          },
        ]
      }
    ],
  }
];

// to be filled out as accounts are created
const accountNamesToId = {};
const accountNamesToAccount = {};

var cashInCounter = 0;
var cashOutCounter = 0;

function* referenceIdMaker() {
  var index = 10000000;
  while (index < index + 1)
    yield index++;
}

function seedIdIterator(start) {
  for ( var i = 0; i < start; i++){
    foam.next$UID();
  }
}

const refIdGenerator = referenceIdMaker();

function createCurrency(X, cObj) {
  var currency = net.nanopay.model.Currency.create({
    delimiter: ',',
    decimalCharacter: '.',
    symbol: '¤',
    leftOrRight: 'left',
    showSpace: true,
    precision: 2,
    numericCode: 0,
    ...cObj
  }, X);

  X.currencyDAO.put(currency);
}

function createTrustAccount(X, d) {
  var trust = net.nanopay.account.TrustAccount.create({
    id: foam.next$UID(),
    owner: 101,
    name: `${d} Trust Account`,
    denomination: d
  }, X);

  X.accountDAO.put(trust);
}

function bank(X, a) {
  var cls = a.denomination == 'CAD'
    ? net.nanopay.bank.CABankAccount
    : a.denomination == 'USD'
      ? net.nanopay.bank.USBankAccount
      : net.nanopay.bank.BankAccount

  var bank = cls.create({
    id: foam.next$UID(),
    owner: X.userId,
    status: net.nanopay.bank.BankAccountStatus.VERIFIED,
    name: a.name + ' Bank Account',
    createdBy: X.userId,
    created: X.currentDate,
    lastModified: X.currentDate,
    lastModifiedBy: X.userID,
    denomination: a.denomination
  }, X);

  var shadow = net.nanopay.account.ShadowAccount.create({
    id: foam.next$UID(),
    denomination: a.denomination,
    name: a.name + ' Shadow Account',
    created: X.currentDate,
    createdBy: X.userId,
    lastModified: X.currentDate,
    lastModifiedBy: X.userId,
    owner: X.userId,
    isDefault: a.isDefault
  }, X);

  accountNamesToId[bank.name] = bank.id;
  accountNamesToId[shadow.name] = shadow.id;
  accountNamesToAccount[shadow.name] = shadow;
  accountNamesToAccount[bank.name] = bank;

  X.accountDAO.put(bank);
  X.accountDAO.put(shadow);

  X = X.createSubContext({
    denomination: a.denomination,
    parentAccount: shadow.id
  });


  X.balances[shadow.id] = 0;
  X.balances[bank.id] = 0;

  a.bank = bank;
  a.shadow = shadow;

  return a;
}

function virtual(X, a) {
  var obj = net.nanopay.account.DigitalAccount.create({
    id: foam.next$UID(),
    denomination: a.denomination,
    name: a.name,
    created: X.currentDate,
    createdBy: X.userId,
    lastModified: X.currentDate,
    lastModifiedBy: X.userId,
    parent: X.parentAccount,
    owner: X.userId,
    liquiditySetting: a.liquiditySetting,
    isDefault: a.isDefault
  }, X);

  a.obj = obj;
  accountNamesToId[obj.name] = obj.id;
  accountNamesToAccount[obj.name] = obj;

  X.accountDAO.put(obj);

  X = X.createSubContext({
    parentAccount: obj.id
  });

  a.children = a.children ? a.children.map(inflate.bind(null, X)) : [];

  return a;
}

function aggregate(X, a) {
  var obj = net.nanopay.account.AggregateAccount.create({
    denomination: a.denomination,
    id: foam.next$UID(),
    created: X.currentDate,
    createdBy: X.userId,
    lastModified: X.currentDate,
    lastModifiedBy: X.userId,
    parent: X.parentAccount,
    owner: X.userId,
    name: a.name,
    liquiditySetting: a.liquiditySetting,
    isDefault: a.isDefault
  }, X);

  X.accountDAO.put(obj);

  a.obj = obj;
  accountNamesToId[obj.name] = obj.id;
  accountNamesToAccount[obj.name] = obj;

  X = X.createSubContext({
    parentAccount: obj.id
  });

  X.balances[obj.id] = 0;

  a.children = a.children.map(inflate.bind(null, X));

  return a;
}

function inflate(X, a) {
  switch (a.type) {
    case "Bank":
      return bank(X, a);
    case "Aggregate":
      return aggregate(X, a);
    case "Virtual":
      return virtual(X, a);
  }
}

function jdao(journal) {
  var stringifier = foam.json.Outputter.create({
    pretty: false,
    strict: true,
    formatDatesAsNumbers: false,
    outputDefaultValues: false,
    useShortNames: false,
    propertyPredicate: function (o, p) { return !p.storageTransient; }
  });

  var stream = require('fs').createWriteStream(journal, { flags: 'a' });

  return {
    put: function (o) {
      stream.write('p(', 'utf8');
      stream.write(stringifier.stringify(o), 'utf8');
      stream.write(');\n', 'utf8');
    },
    close: function () {
      stream.end();
    }
  };
}

function cashIn(X, bank, dest, amount) {
  var tx = net.nanopay.tx.cico.CITransaction.create({
    id: foam.next$UID().toString(),
    name: `Cash In #${++cashInCounter}`,
    sourceAccount: bank.id,
    destinationAccount: dest.id,
    amount: amount,
    createdBy: X.userId,
    payerId: X.userId,
    payeeId: X.userId,
    completionDate: X.currentDate,
    created: X.currentDate,
    lastModified: X.currentDate,
    sourceCurrency: bank.denomination,
    destinationCurrency: dest.denomination,
    status: net.nanopay.tx.model.TransactionStatus.PENDING,
    initialStatus: net.nanopay.tx.model.TransactionStatus.PENDING,
    isQuoted: false,
    lineItems: [
      net.nanopay.tx.ETALineItem.create({
        eta: 172800000
      }),
      net.nanopay.tx.ReferenceLineItem.create({
        referenceId: refIdGenerator.next().value
      })
    ]
  }, X);

  X.transactionDAO.put(tx);

  tx = net.nanopay.tx.cico.CITransaction.create({
    id: tx.id,
    status: net.nanopay.tx.model.TransactionStatus.COMPLETED,
    lineItems: [
      net.nanopay.tx.ETALineItem.create({ eta: 172800000, id: foam.uuid.randomGUID() }),
      net.nanopay.tx.ReferenceLineItem.create({
        referenceId: refIdGenerator.next().value
      })
    ],
    lastModified: X.currentDate
  }, X);


  X.transactionDAO.put(tx);

  X.balances[dest.id] += amount;
}

function cashOut(X, source, bank, amount) {
  var tx = net.nanopay.tx.cico.COTransaction.create({
    id: foam.next$UID().toString(),
    name: `Cash Out #${++cashOutCounter}`,
    sourceAccount: source.id,
    destinationAccount: bank.id,
    amount: amount,
    createdBy: X.userId,
    payerId: X.userId,
    payeeId: X.userId,
    completionDate: X.currentDate,
    created: X.currentDate,
    lastModified: X.currentDate,
    sourceCurrency: source.denomination,
    destinationCurrency: bank.denomination,
    status: net.nanopay.tx.model.TransactionStatus.PENDING,
    initialStatus: net.nanopay.tx.model.TransactionStatus.PENDING,
    isQuoted: false,
    lineItems: [
      net.nanopay.tx.ETALineItem.create({
        eta: 172800000
      }),
      net.nanopay.tx.ReferenceLineItem.create({
        referenceId: refIdGenerator.next().value
      })
    ]
  }, X);

  X.transactionDAO.put(tx);

  tx = net.nanopay.tx.cico.COTransaction.create({
    id: tx.id,
    status: net.nanopay.tx.model.TransactionStatus.COMPLETED,
    lineItems: [
      net.nanopay.tx.ETALineItem.create({ eta: 172800000, id: foam.uuid.randomGUID() }),
      net.nanopay.tx.ReferenceLineItem.create({
        referenceId: refIdGenerator.next().value
      })
    ],
    lastModified: X.currentDate
  }, X);

  X.transactionDAO.put(tx);

  X.balances[source.id] -= amount;
}

function main() {
  seedIdIterator(startAccountIds);

  var currentDate = new Date();
  currentDate.setFullYear(currentDate.getFullYear() - 5);

  var X = foam.createSubContext({
    transactionDAO: jdao("target/journals/transactions.0"),
    liquiditySettingsDAO: jdao("target/journals/liquiditySettings.0"),
    currencyDAO: jdao("target/journals/currencies.0"),
    currentDate: currentDate,
    balances: {},
    homeDenomination: 'USD',
    userDAO: foam.dao.NullDAO.create(),
    complianceHistoryDAO: foam.dao.NullDAO.create(),
    userId: 8005,
    fxService: foam.dao.NullDAO.create(),
    addCommas: function (a) { return a; }
  });

  X = X.createSubContext({
    user: foam.nanos.auth.User.create({ id: 8005 }, X),
    accountDAO: jdao("target/journals/accounts.0"),
    debtAccountDAO: foam.dao.NullDAO.create(),
  })

  newCurrencies.forEach(c => {
    createCurrency(X, c);
  })

  newTrustAccountDenominations.forEach(d => {
    createTrustAccount(X, d)
  })

  accountTree = accountTree.map(inflate.bind(null, X));

  accountTree.forEach(function foo(a) {
    if (a.bank)
      console.log("Bank: ", a.name, a.bank.id, a.shadow.id);
    else if (a.obj)
      console.log(a.obj.cls_.name, a.name, a.obj.id);
    else
      console.log("Wut:", a);

    if (a.children) a.children.forEach(foo);
  });

  // accountTree.forEach(function (root) {
  //   if ( ! root.isDefault ){
  //     var balance = 10000000;

  //     cashIn(X, root.bank, root.shadow, balance);

  //     var virtuals = virtualAccounts(root);

  //     var amount = Math.floor(balance / virtuals.length);

  //     virtuals.forEach(function (v) {
  //       transfer(X, root.shadow, v, amount);
  //     });
  //   }
  // });

  X.accountDAO.close();
  X.transactionDAO.close();
  X.liquiditySettingsDAO.close();
  X.currencyDAO.close();
}

main();
