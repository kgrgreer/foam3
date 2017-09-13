require('../src/foam/files.js');

var classes = [
  'foam.dao.crypto.EncryptedObject',

  'net.nanopay.model.AccountInfo',
  'net.nanopay.model.Account',
  'net.nanopay.model.Bank',
  'net.nanopay.model.BankAccountInfo',
  'net.nanopay.model.PadAccount',
  'net.nanopay.model.Phone',
  'net.nanopay.model.UserAccountInfo',
  'net.nanopay.model.AccountLimit',
  'net.nanopay.fx.ExchangeRateInterface',
  'net.nanopay.fx.model.ExchangeRate',
  'net.nanopay.fx.model.ExchangeRateQuote',
  'net.nanopay.tx.TransactionService',
  'net.nanopay.tx.model.Transaction',
  'net.nanopay.tx.model.TransactionPurpose'
];

var abstractClasses = [
];

var skeletons = [
  'net.nanopay.fx.ExchangeRateInterface',
  'net.nanopay.tx.TransactionService'
];

var proxies = [
];

module.exports = {
    classes: classes,
    abstractClasses: abstractClasses,
    skeletons: skeletons,
    proxies: proxies
}
