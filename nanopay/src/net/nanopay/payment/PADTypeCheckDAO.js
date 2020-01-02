foam.CLASS({
  package: 'net.nanopay.payment',
  name: 'PADTypeCheckDAO',
  extends: 'foam.dao.ProxyDAO',

  javaImports: [
    'foam.dao.DAO',
    'static foam.mlang.MLang.*',
    'foam.mlang.sink.Count',
    'foam.nanos.auth.AuthorizationException',
    'foam.nanos.auth.AuthService',
    'foam.nanos.auth.User',
    'foam.nanos.logger.Logger',
    'net.nanopay.account.Account',
    'net.nanopay.account.DigitalAccount',
    'net.nanopay.account.TrustAccount',
    'net.nanopay.bank.CABankAccount',
    'net.nanopay.bank.BankAccount',
    'net.nanopay.bank.BankAccountStatus',
    'net.nanopay.model.Branch',
    'net.nanopay.payment.Institution',
    'net.nanopay.payment.PaymentProvider',
    'net.nanopay.payment.PADType',
    'net.nanopay.payment.PADTypeLineItem',
    'net.nanopay.tx.alterna.*',
    'net.nanopay.tx.bmo.cico.*',
    'net.nanopay.tx.cico.VerificationTransaction',
    'net.nanopay.tx.ETALineItem',
    'net.nanopay.tx.TransactionLineItem',
    'net.nanopay.tx.TransactionQuote',
    'net.nanopay.tx.Transfer',
    'net.nanopay.tx.model.Transaction',
    'java.util.ArrayList',
    'java.util.List'
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
  Transaction transaction = (Transaction) obj;
  DAO dao = (DAO) x.get("padTypeDAO");

  PADType padType = PADTypeLineItem.getPADTypeFrom(x, transaction);

  if ( padType != null && padType.getId() > 0 ) {
    PADType padTypeFind = (PADType) dao.inX(x).find(EQ(PADType.ID, padType.getId()));
    if ( padTypeFind == null ) {
      throw new RuntimeException("Unsupported PAD type code: " + padType.getId() );
    }
  }
  
  return super.put_(x, obj);
    `
    }
  ]
});
