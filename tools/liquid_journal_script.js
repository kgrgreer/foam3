
var npRoot = __dirname + '/../';

global.FOAM_FLAGS = {
  js: true,
  web: true,
  node: true,
  java: true,
  swift: true,
};

require(npRoot + 'foam3/src/foam.js');
require(npRoot + 'foam3/src/foam/nanos/nanos.js');
require(npRoot + 'foam3/src/foam/support/support.js');

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
      id,
      numericCode,
      country
    }
 */
var newCurrencies = [];
var newTrustAccountDenominations = ['USD', 'CNY', 'HKD', 'JPY', 'MXN'];

// what number the account IDs should start up
var startAccountIds = 1000;

var lit = false;

var banks = lit ? [
  {
    type: 'Bank',
    denomination: 'CAD',
    name: 'GLOBAL'
  }
] : null;

// below tree is just for testing purposes
var accountTree = lit ? [
  {
    type: 'Aggregate',
    name: 'GLOBAL',
    denomination: 'CAD',
    children: [
      {
        type: 'Aggregate',
        name: 'EU',
        denomination: 'CAD',
        children: [
          {
            type: 'Virtual',
            name: 'EUWest',
            denomination: 'CAD',
          },
          {
            type: 'Virtual',
            name: 'EUEast',
            denomination: 'CAD',
          },
        ]
      },
      {
        type: 'Aggregate',
        name: 'ASIA',
        denomination: 'CAD',
        children: [
          {
            type: 'Virtual',
            name: 'ASIAWest',
            denomination: 'CAD',
          },
          {
            type: 'Virtual',
            name: 'ASIAEast',
            denomination: 'CAD',
          }
        ]
      }
    ]
  }
]

: [ ];

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
  var currency = foam.core.Currency.create({
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

function transfer(X, source, dest, amount) {
  if ( source.id == dest.id ) {
    throw new Error("Transfer from same account " + source.id);
  }

  X.balances[source.id] -= amount;
  X.balances[dest.id] += amount

  var tx = net.nanopay.tx.DigitalTransaction.create({
    name: 'Digital Transfer',
    id: foam.next$UID(),
    amount: amount,
    completionDate: X.currentDate,
    status: net.nanopay.tx.model.TransactionStatus.COMPLETED,
    initialStatus: net.nanopay.tx.model.TransactionStatus.COMPLETED,
    sourceCurrency: source.denomination,
    destinationCurrency: dest.denomination,
    destinationAccount: dest.id,
    sourceAccount: source.id,
    lastModified: X.currentDate,
    lastModifiedBy: X.userId,
    created: X.currentDate,
    createdBy: X.userId,
    lineItems: [
      net.nanopay.tx.ReferenceLineItem.create({
        referenceId: refIdGenerator.next().value
      })
    ],
  }, X);

  X.transactionDAO.put(tx);
}

function createLiquiditySettings(X) {
  liquiditySettings.forEach(s => {
    switch (s.type) {
      case 'email':
        return createEmailLiquiditySetting(X, s);
      case 'rebalance':
        return createRebalanceLiquiditySetting(X, s);
      case 'emailRebalance':
        return createEmailRebalanceLiquiditySetting(X, s);
    }
  })
}

function addLiquiditySettingsToAccounts(X) {
  Object.keys(accountNamesToLiquidity).forEach(accountName => {
    var account = accountNamesToAccount[accountName];

    var liquiditySettingName = accountNamesToLiquidity[accountName];

    account.liquiditySetting = liquidityNamesToId[liquiditySettingName];

    X.accountDAO.put(account);
  })
}

function randomDigitalTransfer(X) {
  var root = randomItem(accountTree);
  var accounts = virtualAccounts(root);

  if ( accounts.length < 2 ) {
    throw new Error("Cannot created transfer in account tree " + root.name + " as there is only one virtual account.");
  }

  var source = randomItem(accounts);
  var dest;
  do {
    dest = randomItem(accounts);
  } while ( dest === source );

  var amount = Math.floor(
    X.balances[source.id] * 0.05 +
    X.balances[source.id] * Math.random() * 0.02);

  transfer(X, source, dest, amount);
}

function randomCICOTransfer(X) {
  var root = randomItem(accountTree);

  var bank = accountNamesToAccount[`${root.name} Bank Account`];
  var shadow = accountNamesToAccount[`${root.name} Shadow Account`];

  if (Math.random() < 0.5) {
    var amount = Math.floor(
      X.balances[shadow.id] * 0.05 +
      X.balances[shadow.id] * Math.random() * 0.02);

    cashIn(X, bank, shadow, amount);

  } else {
    var amount = Math.floor(
      X.balances[shadow.id] * 0.05 +
      X.balances[shadow.id] * Math.random() * 0.02);

    cashOut(X, shadow, bank, amount);
  }
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

function virtualAccounts(root) {
  var ret = [];

  function collect(node) {
    if ( ! net.nanopay.account.AggregateAccount.isInstance(node.obj) &&
      net.nanopay.account.DigitalAccount.isInstance(node.obj) ) {
      ret.push(node.obj);
    }

    if ( node.children ) node.children.forEach(collect);
  }

  collect(root);

  return ret;
}

function main() {
  seedIdIterator(startAccountIds);

  var currentDate = new Date();
  currentDate.setFullYear(currentDate.getFullYear() - 5);

  var X = foam.createSubContext({
    transactionDAO: jdao("target/journals/transactions.0"),
    liquiditySettingsDAO: jdao("target/journals/liquiditySettings.0"),
    currencyDAO: foam.dao.NullDAO.create(),
    currentDate: currentDate,
    balances: {},
    homeDenomination: 'USD',
    userDAO: foam.dao.NullDAO.create(),
    complianceHistoryDAO: foam.dao.NullDAO.create(),
    userId: 8007,
    addCommas: function (a) { return a; }
  });

  X = X.createSubContext({
    user: foam.nanos.auth.User.create({ id: 8005 }, X),
    accountDAO: jdao("target/journals/accounts.0"),
    debtAccountDAO: foam.dao.NullDAO.create(),
    fxService: net.nanopay.fx.mock.MockFXService.create()
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

  // 1. cash in the banks
  // 2. send transactions to eachother

  banks.forEach(function (bankObj) {
    var balance = 10000000;

    var actualBank = bank(X, bankObj);

    var root = accountTree[0];

    cashIn(X, actualBank.bank, actualBank.shadow, balance);

    var virtuals = virtualAccounts(root);

    var amount = Math.floor(balance / virtuals.length);

    virtuals.forEach(function (v) {
      transfer(X, actualBank.shadow, v, amount);
    });
  });

  X.accountDAO.close();
  X.transactionDAO.close();
  X.liquiditySettingsDAO.close();
}

if ( lit ) main();
