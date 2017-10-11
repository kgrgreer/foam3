global.FOAM_FLAGS.src = __dirname + '/../src/';
require('../src/net/nanopay/files.js');

var classes = [
  'net.nanopay.dao.crypto.EncryptedObject',
  'net.nanopay.cico.model.BaseServiceProvider',
  'net.nanopay.cico.model.ServiceProvider',
  'net.nanopay.cico.model.TransactionStatus',
  'net.nanopay.cico.model.TransactionType',
  'net.nanopay.cico.spi.alterna.AlternaFormat',
  'net.nanopay.model.AccountInfo',
  'net.nanopay.model.Account',
  'net.nanopay.model.Branch',
  'net.nanopay.model.BankAccountInfo',
  'net.nanopay.model.Broker',
  'net.nanopay.model.BusinessSector',
  'net.nanopay.model.BusinessType',
  'net.nanopay.model.Currency',
  'net.nanopay.model.PadAccount',
  'net.nanopay.model.Phone',
  'net.nanopay.model.UserAccountInfo',
  'net.nanopay.model.AccountLimit',
  'net.nanopay.model.Identification',
  'net.nanopay.model.DateAndPlaceOfBirth',
  'net.nanopay.invoice.model.RecurringInvoice',
  'net.nanopay.invoice.model.Invoice',
  'net.nanopay.fx.ExchangeRateInterface',
  'net.nanopay.fx.model.ExchangeRate',
  'net.nanopay.fx.model.ExchangeRateQuote',
  'net.nanopay.tx.model.Transaction',
  'net.nanopay.tx.model.TransactionPurpose',
  'net.nanopay.retail.model.DeviceType',
  'net.nanopay.retail.model.DeviceStatus',
  'net.nanopay.retail.model.Device'
];

var abstractClasses = [
];

var skeletons = [
  'net.nanopay.fx.ExchangeRateInterface'
];

var proxies = [
];

module.exports = {
    classes: classes,
    abstractClasses: abstractClasses,
    skeletons: skeletons,
    proxies: proxies
}
