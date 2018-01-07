global.FOAM_FLAGS.src = __dirname + '/../src/';
require('../src/net/nanopay/files.js');

var classes = [
  'net.nanopay.auth.email.EmailTokenService',
  'net.nanopay.auth.sms.AuthyTokenService',
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
  'net.nanopay.liquidity.model.Threshold',
  'net.nanopay.liquidity.model.ThresholdResolve',
  'net.nanopay.liquidity.model.BalanceAlert',
  'net.nanopay.liquidity.model.Liquidity',
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
  'net.nanopay.s2h.model.S2HInvoice',
  //Flinks Rest model
  'net.nanopay.flinks.model.FlinksCall',
  'net.nanopay.flinks.model.FlinksRequest',
  'net.nanopay.flinks.model.FlinksAuthRequest',
  'net.nanopay.flinks.model.FlinksTransactionRequest',
  'net.nanopay.flinks.model.FlinksAccountRequest',
  'net.nanopay.flinks.model.FlinksAccountSummaryRequest',
  'net.nanopay.flinks.model.RefreshDeltaModel',
  'net.nanopay.flinks.model.FlinksAccountDetailRequest',
  'net.nanopay.flinks.model.FlinksMulAuthRequest',
  'net.nanopay.flinks.model.FlinksResponse',
  'net.nanopay.flinks.model.SecurityChallengeModel',
  'net.nanopay.flinks.model.LoginModel',
  'net.nanopay.flinks.model.FlinksInvalidResponse',
  'net.nanopay.flinks.model.FlinksAuthResponse',
  'net.nanopay.flinks.model.FlinksMFAResponse',
  'net.nanopay.flinks.model.BalanceModel',
  'net.nanopay.flinks.model.AccountModel',
  'net.nanopay.flinks.model.AddressModel',
  'net.nanopay.flinks.model.HolderModel',
  'net.nanopay.flinks.model.AccountTransactionModel',
  'net.nanopay.flinks.model.AccountWithDetailModel',
  'net.nanopay.flinks.model.AccountStatementModel',
  'net.nanopay.flinks.model.AccountStatementContainerModel',
  'net.nanopay.flinks.model.FlinksAccountsDetailResponse',
  'net.nanopay.flinks.model.FlinksAccountsSummaryResponse',
  //flinks frontend request model
  'net.nanopay.flinks.model.FlinksRespMsg',
  'net.nanopay.flinks.model.FlinksAccount',
  //Institution model
  'net.nanopay.model.Institution',
  //flinks service
  'net.nanopay.flinks.FlinksAuth',
  'net.nanopay.flinks.ClientFlinksAuthService',
  'net.nanopay.fx.ascendantfx.AscendantFX',
  'net.nanopay.fx.lianlianpay.LianLianPay',
  'net.nanopay.fx.lianlianpay.model.ResultCode',
  'net.nanopay.fx.lianlianpay.model.DistributionMode',
  'net.nanopay.fx.lianlianpay.model.InstructionType',
  'net.nanopay.fx.lianlianpay.model.CurrencyBalanceRecord',
  'net.nanopay.fx.lianlianpay.model.InstructionCombined',
  'net.nanopay.fx.lianlianpay.model.InstructionCombinedRequest',
  'net.nanopay.fx.lianlianpay.model.InstructionCombinedSummary',
  'net.nanopay.fx.lianlianpay.model.PreProcessResult',
  'net.nanopay.fx.lianlianpay.model.PreProcessResultResponse',
  'net.nanopay.fx.lianlianpay.model.PreProcessResultSummary',
  'net.nanopay.fx.lianlianpay.model.Reconciliation',
  'net.nanopay.fx.lianlianpay.model.ReconciliationRecord',
  'net.nanopay.fx.lianlianpay.model.Statement',
  'net.nanopay.fx.lianlianpay.model.StatementRecord'
];

var abstractClasses = [
];

var skeletons = [
  'net.nanopay.cico.service.BankAccountVerificationInterface',
  'net.nanopay.cico.spi.alterna.SFTPService',
  'net.nanopay.fx.ExchangeRateInterface',
  'net.nanopay.tx.UserTransactionLimit',
  //flinks
  'net.nanopay.flinks.FlinksAuth'
];

var proxies = [
];

module.exports = {
    classes: classes,
    abstractClasses: abstractClasses,
    skeletons: skeletons,
    proxies: proxies
}
