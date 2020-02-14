foam.CLASS({
  package: 'net.nanopay.tx.bmo',
  name: 'BmoTransactionPlanner',
  extends: 'net.nanopay.tx.cico.CABankTransactionPlanner',

  javaImports: [
    'foam.dao.DAO',
    'static foam.mlang.MLang.*',
    'foam.nanos.logger.Logger',
    'net.nanopay.account.Account',
    'net.nanopay.account.DigitalAccount',
    'net.nanopay.bank.CABankAccount',
    'net.nanopay.bank.BankAccount',
    'net.nanopay.bank.BankAccountStatus',
    'net.nanopay.payment.PaymentProvider',
    'net.nanopay.payment.PADTypeLineItem',
    'net.nanopay.tx.alterna.*',
    'net.nanopay.tx.bmo.cico.*',
    'net.nanopay.tx.cico.VerificationTransaction',
    'net.nanopay.tx.ETALineItem',
    'net.nanopay.tx.TransactionLineItem',
    'net.nanopay.tx.TransactionQuote',
    'net.nanopay.tx.model.Transaction',
    'java.util.ArrayList'
  ],

  constants: [
    {
      name: 'PROVIDER_ID',
      type: 'String',
      value: 'BMO'
    },
    {
      name: 'institutionNumber',
      type: 'String',
      value: '001'
    },
  ],

  methods: [
    {
      name: 'plannerLogic',
      javaCode: `
        
    Logger logger = (Logger) x.get("logger");;
    
    if ( requestTxn instanceof BmoVerificationTransaction ) {
        requestTxn.setIsQuoted(true);
        return requestTxn;
      } else if ( requestTxn instanceof VerificationTransaction ) {
        return null;
      }

    Account sourceAccount = quote.getSourceAccount();
    Account destinationAccount = quote.getDestinationAccount();

    if ( sourceAccount instanceof CABankAccount &&
      destinationAccount instanceof DigitalAccount  && sourceAccount.getOwner() == destinationAccount.getOwner() ) {
      
      if ( ! usePaymentProvider(x, PROVIDER_ID, (BankAccount) sourceAccount, true /* default */ ) ) return null;

      if ( ((CABankAccount) sourceAccount).getStatus() != BankAccountStatus.VERIFIED ) {
        logger.warning("Bank account needs to be verified for cashin for bank account id: " + sourceAccount.getId() +
              " and transaction id: " + requestTxn.getId());
        throw new RuntimeException("Bank account needs to be verified for cashin");
      };

      BmoCITransaction t = new BmoCITransaction.Builder(x).build();
      t.copyFrom(requestTxn);
      t.setInstitutionNumber(institutionNumber);
      t.setTransfers(createCITransfers(t, institutionNumber));

      // TODO: use EFT calculation process
      t.addLineItems( new TransactionLineItem[] { new ETALineItem.Builder(x).setEta(/* 1 days */ 864800000L).build()}, null);
      if ( PADTypeLineItem.getPADTypeFrom(x, t) == null ) {
        PADTypeLineItem.addEmptyLineTo(t);
      }
      t.setIsQuoted(true);
      return t;
    } else if ( sourceAccount instanceof DigitalAccount &&
                destinationAccount instanceof CABankAccount &&
                sourceAccount.getOwner() == destinationAccount.getOwner() ) {

      if ( ! usePaymentProvider(x, PROVIDER_ID, (BankAccount) destinationAccount, true /* default */) ) return null;

      if ( ((CABankAccount) destinationAccount).getStatus() != BankAccountStatus.VERIFIED ) { 
        logger.warning("Bank account needs to be verified for cashout for bank account id: " + sourceAccount.getId() +
              " and transaction id: " + requestTxn.getId());
        throw new RuntimeException("Bank account needs to be verified for cashout"); 
      }

      BmoCOTransaction t = new BmoCOTransaction.Builder(x).build();
      t.copyFrom(requestTxn);
      t.setInstitutionNumber(institutionNumber);
      t.setTransfers(createCOTransfers(t, institutionNumber));
      // TODO: use EFT calculation process - ClearingTimeService
      t.addLineItems(new TransactionLineItem[] { new ETALineItem.Builder(x).setEta(/* 1 days */ 864800000L).build()}, null);
      if ( PADTypeLineItem.getPADTypeFrom(x, t) == null ) {
        PADTypeLineItem.addEmptyLineTo(t);
      }
      t.setIsQuoted(true);
      return t;
    }

    return null;
    `
    }
  ]
});
