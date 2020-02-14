foam.CLASS({
  package: 'net.nanopay.tx.alterna',
  name: 'AlternaTransactionPlanner',
  extends: 'net.nanopay.tx.cico.CABankTransactionPlanner',

  javaImports: [
    'foam.nanos.logger.Logger',
    'net.nanopay.account.Account',
    'net.nanopay.account.DigitalAccount',
    'net.nanopay.bank.BankAccount',
    'net.nanopay.bank.BankAccountStatus',
    'net.nanopay.bank.CABankAccount',
    'net.nanopay.tx.ETALineItem',
    'net.nanopay.tx.TransactionLineItem',
    'net.nanopay.tx.TransactionQuote',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.cico.VerificationTransaction',
    'net.nanopay.payment.PaymentProvider',
    'java.util.ArrayList',
    'net.nanopay.payment.PADTypeLineItem'
  ],

  constants: [
    {
      name: 'PROVIDER_ID',
      type: 'String',
      value: 'Alterna'
    },
    {
      name: 'institutionNumber',
      type: 'String',
      value: '842'
    }
  ],

  methods: [
    {
      name: 'plannerLogic',
      javaCode: `

      Logger logger = (Logger) x.get("logger");
      
      if ( requestTxn instanceof AlternaVerificationTransaction ) {
        requestTxn.setIsQuoted(true);
        return requestTxn;
      } else if ( requestTxn instanceof VerificationTransaction ) {
        return null;
      }
      
      Account sourceAccount = quote.getSourceAccount();
      Account destinationAccount = quote.getDestinationAccount();
      if ( sourceAccount instanceof CABankAccount &&
        destinationAccount instanceof DigitalAccount && sourceAccount.getOwner() == destinationAccount.getOwner() ) {
        
        if ( ! usePaymentProvider(x, PROVIDER_ID, (BankAccount) sourceAccount, false) ) return null;
        
        if ( ((CABankAccount) sourceAccount).getStatus() != BankAccountStatus.VERIFIED ) {
          logger.error("Bank account needs to be verified for cashin " + sourceAccount.getId());
          throw new RuntimeException("Bank account needs to be verified for cashin");
        }
        AlternaCITransaction t = new AlternaCITransaction.Builder(x).build();
        t.copyFrom(requestTxn);
        t.setInstitutionNumber(institutionNumber);
        t.setTransfers(createCITransfers(t, institutionNumber));
        // TODO: use EFT calculation process
        t.addLineItems( new TransactionLineItem[] { new ETALineItem.Builder(x).setEta(/* 2 days */ 172800000L).build()}, null);
        if ( PADTypeLineItem.getPADTypeFrom(x, t) == null ) {
          PADTypeLineItem.addEmptyLineTo(t);
        }
        t.setIsQuoted(true);
        return t;
      } else if ( sourceAccount instanceof DigitalAccount &&
                  destinationAccount instanceof CABankAccount &&
                  sourceAccount.getOwner() == destinationAccount.getOwner() ) {
      
        if ( ! usePaymentProvider(x, PROVIDER_ID, (BankAccount) destinationAccount, false) ) return null;

        if ( ((CABankAccount) destinationAccount).getStatus() != BankAccountStatus.VERIFIED ) {
          logger.error("Bank account needs to be verified for cashout");
          throw new RuntimeException("Bank account needs to be verified for cashout");
        }
        AlternaCOTransaction t = new AlternaCOTransaction.Builder(x).build();
        t.copyFrom(requestTxn);
        t.setInstitutionNumber(institutionNumber);
        t.setTransfers(createCOTransfers(t, institutionNumber));
        // TODO: use EFT calculation process
        t.addLineItems(new TransactionLineItem[] { new ETALineItem.Builder(x).setEta(/* 2 days */ 172800000L).build()}, null);
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
