global.FOAM_FLAGS.src = __dirname + '/../src/';
require('../src/net/nanopay/files.js');

var classes = [
  'net.nanopay.auth.token.Token',
  'net.nanopay.auth.token.TokenService',
  'net.nanopay.auth.token.ClientTokenService',
  'net.nanopay.auth.token.AbstractTokenService',
  'net.nanopay.auth.email.EmailTokenService',
  'net.nanopay.auth.sms.AuthyTokenService',
  'net.nanopay.auth.password.ResetPasswordTokenService',
  'net.nanopay.dao.crypto.EncryptedObject',
  'net.nanopay.cico.model.ServiceProvider',
  'net.nanopay.cico.model.TransactionStatus',
  'net.nanopay.cico.model.TransactionType',
  'net.nanopay.cico.spi.alterna.AlternaFormat',
  'net.nanopay.cico.spi.alterna.SFTPService',
  'net.nanopay.cico.spi.alterna.client.ClientAlternaSFTPService',
  'net.nanopay.cico.service.BankAccountVerificationInterface',
  'net.nanopay.model.Account',
  'net.nanopay.model.Branch',
  'net.nanopay.model.BankAccount',
  'net.nanopay.model.Broker',
  'net.nanopay.model.BusinessSector',
  'net.nanopay.model.BusinessType',
  'net.nanopay.model.Currency',
  'net.nanopay.model.PadAccount',
  'net.nanopay.model.Identification',
  'net.nanopay.model.DateAndPlaceOfBirth',
  'net.nanopay.model.Threshold',
  'net.nanopay.model.ThresholdResolve',
  'net.nanopay.model.BalanceAlert',
  'net.nanopay.model.Liquidity',
  'net.nanopay.invoice.model.PaymentStatus',
  'net.nanopay.invoice.model.RecurringInvoice',
  'net.nanopay.invoice.model.Invoice',
  'net.nanopay.fx.ExchangeRateInterface',
  'net.nanopay.fx.model.ExchangeRate',
  'net.nanopay.fx.model.ExchangeRateQuote',
  'net.nanopay.tx.UserTransactionLimit',
  'net.nanopay.tx.client.ClientUserTransactionLimitService',
  'net.nanopay.tx.model.Fee',
  'net.nanopay.tx.model.FeeInterface',
  'net.nanopay.tx.model.FeeType',
  'net.nanopay.tx.model.InformationalFee',
  'net.nanopay.tx.model.FixedFee',
  'net.nanopay.tx.model.PercentageFee',
  'net.nanopay.tx.model.Transaction',
  'net.nanopay.tx.model.TransactionLimit',
  'net.nanopay.tx.model.TransactionLimitTimeFrame',
  'net.nanopay.tx.model.TransactionLimitType',
  'net.nanopay.tx.model.TransactionPurpose',
  'net.nanopay.retail.model.DeviceType',
  'net.nanopay.retail.model.DeviceStatus',
  'net.nanopay.retail.model.Device',
  'net.nanopay.s2h.model.S2HInvoice'
];

var abstractClasses = [
];

var skeletons = [
  'net.nanopay.auth.token.TokenService',
  'net.nanopay.cico.service.BankAccountVerificationInterface',
  'net.nanopay.cico.spi.alterna.SFTPService',
  'net.nanopay.fx.ExchangeRateInterface',
  'net.nanopay.tx.UserTransactionLimit'
];

var proxies = [
];

module.exports = {
    classes: classes,
    abstractClasses: abstractClasses,
    skeletons: skeletons,
    proxies: proxies
}
