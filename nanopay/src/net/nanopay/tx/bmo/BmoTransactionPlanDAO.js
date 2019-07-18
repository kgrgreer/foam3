foam.CLASS({
  package: 'net.nanopay.tx.bmo',
  name: 'BmoTransactionPlanDAO',
  extends: 'foam.dao.ProxyDAO',

  javaImports: [
    'net.nanopay.bank.BankAccountStatus',
    'foam.nanos.auth.User',
    'foam.nanos.logger.Logger',
    'foam.mlang.sink.Count',
    'net.nanopay.account.Account',
    'net.nanopay.account.DigitalAccount',
    'net.nanopay.account.TrustAccount',
    'net.nanopay.bank.BankAccount',
    'net.nanopay.bank.CABankAccount',
    'net.nanopay.tx.ETALineItem',
    'net.nanopay.tx.TransactionLineItem',
    'net.nanopay.tx.TransactionQuote',
    'net.nanopay.tx.Transfer',
    'net.nanopay.tx.model.Transaction',
    'static foam.mlang.MLang.*',
    'foam.dao.DAO',

    'net.nanopay.tx.alterna.*',
    'net.nanopay.tx.bmo.cico.*'
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
    Logger logger = (Logger) x.get("logger");

    TransactionQuote quote = (TransactionQuote) obj;
    Transaction request = (Transaction) quote.getRequestTransaction();

    Account sourceAccount = quote.getSourceAccount();
    Account destinationAccount = quote.getDestinationAccount();

    if ( sourceAccount instanceof CABankAccount &&
      destinationAccount instanceof DigitalAccount ) {

      if ( ((CABankAccount) sourceAccount).getStatus() != BankAccountStatus.VERIFIED ) {
        logger.warning("Bank account needs to be verified for cashin for bank account id: " + sourceAccount.getId() +
              " and transaction id: " + request.getId());
        throw new RuntimeException("Bank account needs to be verified for cashin");
      };

      BmoCITransaction t = new BmoCITransaction.Builder(x).build();
      t.copyFrom(request);

      // TODO: use EFT calculation process
      t.addLineItems( new TransactionLineItem[] { new ETALineItem.Builder(x).setEta(/* 1 days */ 864800000L).build()}, null);
      t.setIsQuoted(true);
      quote.addPlan(t);
    } else if ( destinationAccount instanceof CABankAccount &&
      sourceAccount instanceof DigitalAccount ) {

      if ( ((CABankAccount) destinationAccount).getStatus() != BankAccountStatus.VERIFIED ) { 
        logger.warning("Bank account needs to be verified for cashout for bank account id: " + sourceAccount.getId() +
              " and transaction id: " + request.getId());
        throw new RuntimeException("Bank account needs to be verified for cashout"); 
      }

      BmoCOTransaction t = new BmoCOTransaction.Builder(x).build();
      t.copyFrom(request);

      // TODO: use EFT calculation process
      t.addLineItems(new TransactionLineItem[] { new ETALineItem.Builder(x).setEta(/* 1 days */ 864800000L).build()}, null);
      t.setIsQuoted(true);
      quote.addPlan(t);
    }

    return getDelegate().put_(x, quote);
    `
    },
  ]
});
