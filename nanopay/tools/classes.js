global.FOAM_FLAGS.src = __dirname + '/../src/';
require('../src/net/nanopay/files.js');

var classes = [
  'net.nanopay.auth.sms.AuthyTokenService',
  'net.nanopay.cico.model.TransactionType',
  'net.nanopay.cico.model.EFTReturnRecord',
  'net.nanopay.cico.model.EFTConfirmationFileRecord',
  'net.nanopay.cico.model.EFTReturnFileCredentials',
  'net.nanopay.tx.tp.TxnProcessor',
  'net.nanopay.tx.tp.TxnProcessorData',
  'net.nanopay.tx.tp.TxnProcessorUserReference',
  'net.nanopay.tx.tp.alterna.AlternaTxnProcessorData',
  'net.nanopay.tx.tp.alterna.AlternaFormat',
  'net.nanopay.tx.tp.alterna.SFTPService',
  'net.nanopay.tx.tp.alterna.AlternaSFTPService',
  'net.nanopay.tx.tp.alterna.client.ClientAlternaSFTPService',
  'net.nanopay.tx.tp.stripe.StripeTxnProcessorData',
  'net.nanopay.cico.service.BankAccountVerifier',
  'net.nanopay.cico.service.ClientBankAccountVerifierService',
  'net.nanopay.cico.paymentCard.model.PaymentCard',
  'net.nanopay.cico.paymentCard.model.PaymentCardType',
  'net.nanopay.cico.paymentCard.model.PaymentCardNetwork',
  'net.nanopay.payment.Institution',
  'net.nanopay.payment.InstitutionPurposeCode',
  'net.nanopay.account.CurrentBalance',
  'net.nanopay.model.Branch',
  'net.nanopay.model.BankAccount',
  'net.nanopay.model.BankAccountStatus',
  'net.nanopay.model.Broker',
  'net.nanopay.model.BusinessSector',
  'net.nanopay.model.BusinessType',
  'net.nanopay.model.Currency',
  'net.nanopay.model.PadAccount',
  'net.nanopay.model.PadCapture',
  'net.nanopay.model.Identification',
  'net.nanopay.model.DateAndPlaceOfBirth',
  'net.nanopay.model.Invitation',
  'net.nanopay.model.InvitationStatus',

  // Partners
  'net.nanopay.partners.ui.PartnerInvitationNotification',
  'net.nanopay.auth.PublicUserInfo',

  // invite
  'net.nanopay.admin.model.ComplianceStatus',
  'net.nanopay.admin.model.AccountStatus',
  'net.nanopay.onboarding.model.Question',
  'net.nanopay.onboarding.model.Questionnaire',
  'net.nanopay.onboarding.InvitationTokenService',
  'net.nanopay.onboarding.FirebaseInvitationTokenService',

  // invoice
  'net.nanopay.invoice.model.PaymentStatus',
  'net.nanopay.invoice.model.RecurringInvoice',
  'net.nanopay.invoice.model.Invoice',
  'net.nanopay.invoice.notification.NewInvoiceNotification',
  'net.nanopay.invoice.notification.InvoicePaymentNotification',
  'net.nanopay.invoice.xero.TokenStorage',

  // fx
  'net.nanopay.fx.ExchangeRateInterface',
  'net.nanopay.fx.client.ClientExchangeRateService',
  'net.nanopay.fx.interac.model.PayoutOptions',
  'net.nanopay.fx.interac.model.Corridor',
  'net.nanopay.fx.interac.model.RequiredUserFields',
  'net.nanopay.fx.interac.model.RequiredAddressFields',
  'net.nanopay.fx.interac.model.RequiredIdentificationFields',
  'net.nanopay.fx.interac.model.RequiredAccountFields',
  'net.nanopay.fx.interac.model.RequiredAgentFields',
  'net.nanopay.fx.interac.model.RequiredDocumentFields',
  'net.nanopay.fx.ExchangeRateStatus',
  'net.nanopay.fx.model.ExchangeRate',
  'net.nanopay.fx.model.ExchangeRateQuote',
  'net.nanopay.fx.model.FixerIOExchangeRate',
  'net.nanopay.tx.UserTransactionLimit',
  'net.nanopay.tx.client.ClientUserTransactionLimitService',
  'net.nanopay.retail.model.DeviceType',
  'net.nanopay.tx.model.CashOutFrequency',
  'net.nanopay.tx.model.Fee',
  'net.nanopay.tx.model.FeeInterface',
  'net.nanopay.tx.model.FeeType',
  'net.nanopay.tx.model.FixedFee',
  'net.nanopay.tx.model.InformationalFee',
  'net.nanopay.tx.model.LiquiditySettings',
  'net.nanopay.tx.model.LiquidityAuth',
  'net.nanopay.tx.model.PercentageFee',
  'net.nanopay.tx.model.TransactionStatus',
  'net.nanopay.tx.model.TransactionEntity',
  'net.nanopay.tx.model.Transaction',
  'net.nanopay.tx.ProxyTransaction',
  'net.nanopay.tx.model.TransactionLimit',
  'net.nanopay.tx.model.TransactionLimitTimeFrame',
  'net.nanopay.tx.model.TransactionLimitType',
  'net.nanopay.tx.TransactionPurpose',
  'net.nanopay.retail.model.DeviceStatus',
  'net.nanopay.retail.model.Device',
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
  'net.nanopay.fx.lianlianpay.model.StatementRecord',
  'foam.nanos.auth.UserUserJunction',
  'net.nanopay.fx.interac.model.ExchangerateApiModel',
  'net.nanopay.fx.interac.model.AcceptRateApiModel',
  'net.nanopay.fx.interac.model.AcceptExchangeRateFields',

  // PaymentAccountInfo
  'net.nanopay.cico.CICOPaymentType',
  'net.nanopay.cico.model.PaymentAccountInfo',
  'net.nanopay.cico.model.RealexPaymentAccountInfo',
  'net.nanopay.cico.model.MobileWallet',

  // security
  'net.nanopay.security.EncryptedObject',
  'net.nanopay.security.KeyStoreManager',
  'net.nanopay.security.FileKeyStoreManager',
  'net.nanopay.security.HashingJournal',
  'net.nanopay.security.csp.CSPViolation',
  'net.nanopay.security.csp.CSPReportWebAgent',
  'net.nanopay.security.KeyPairEntry',
  'net.nanopay.security.PrivateKeyEntry',
  'net.nanopay.security.PublicKeyEntry',
  'net.nanopay.security.KeyPairDAO',
  'net.nanopay.security.PublicKeyDAO',
  'net.nanopay.security.PrivateKeyDAO',
  'net.nanopay.security.UserKeyPairGenerationDAO',
  'net.nanopay.security.SigningJournal',
  'net.nanopay.security.SignedFObject',
  'net.nanopay.security.MessageDigest',

  // security tests
  'net.nanopay.security.HashedFObjectParserTest',
  'net.nanopay.security.HashedJSONParserTest',
  'net.nanopay.security.HashingJDAOTest',
  'net.nanopay.security.HashingJournalTest',
  'net.nanopay.security.HashingOutputterTest',

  //topnavigation
  'net.nanopay.ui.topNavigation.CurrencyChoiceView',

  // tests
  'net.test.ModeledTest',
  'net.nanopay.auth.PublicUserInfoDAOTest',
  'net.nanopay.auth.TestWidget',
];

var abstractClasses = [
  'net.nanopay.invoice.xero.AbstractXeroService'
];

var skeletons = [
  'net.nanopay.cico.service.BankAccountVerifier',
  'net.nanopay.tx.tp.alterna.SFTPService',
  'net.nanopay.fx.ExchangeRateInterface',
  'net.nanopay.tx.UserTransactionLimit',
  'net.nanopay.tx.model.LiquidityAuth'
];

var proxies = [
  'net.nanopay.cico.service.BankAccountVerifier'
];

module.exports = {
    classes: classes,
    abstractClasses: abstractClasses,
    skeletons: skeletons,
    proxies: proxies
};
