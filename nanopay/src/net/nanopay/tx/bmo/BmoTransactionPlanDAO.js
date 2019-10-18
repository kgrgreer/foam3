foam.CLASS({
  package: 'net.nanopay.tx.bmo',
  name: 'BmoTransactionPlanDAO',
  extends: 'foam.dao.ProxyDAO',

  implements: [
    'foam.nanos.auth.EnabledAware'
  ],

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

  constants: [
    {
      name: 'PROVIDER_ID',
      type: 'String',
      value: 'BMO'
    }
  ],
  
  properties: [
    {
      name: 'enabled',
      class: 'Boolean',
      value: true
    }
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
    
    if ( ! this.getEnabled() ) {
      return getDelegate().put_(x, obj);
    }
        
    Logger logger = (Logger) x.get("logger");
    TransactionQuote quote = (TransactionQuote) obj;
    Transaction request = (Transaction) quote.getRequestTransaction();
    
    if ( request instanceof BmoVerificationTransaction ) {
        request.setIsQuoted(true);
        quote.addPlan(request);
        return quote;
      } else if ( request instanceof VerificationTransaction ) {
        return getDelegate().put_(x, obj);
      }

    Account sourceAccount = quote.getSourceAccount();
    Account destinationAccount = quote.getDestinationAccount();

    if ( sourceAccount instanceof CABankAccount &&
      destinationAccount instanceof DigitalAccount ) {
      
      if ( ! useBmoAsPaymentProvider(x, (BankAccount) sourceAccount) ) return this.getDelegate().put_(x, obj);

      if ( ((CABankAccount) sourceAccount).getStatus() != BankAccountStatus.VERIFIED ) {
        logger.warning("Bank account needs to be verified for cashin for bank account id: " + sourceAccount.getId() +
              " and transaction id: " + request.getId());
        throw new RuntimeException("Bank account needs to be verified for cashin");
      };

      BmoCITransaction t = new BmoCITransaction.Builder(x).build();
      t.copyFrom(request);
      t.setTransfers(((BankAccount) sourceAccount).createCITransfers(x, t));

      // TODO: use EFT calculation process
      t.addLineItems( new TransactionLineItem[] { new ETALineItem.Builder(x).setEta(/* 1 days */ 864800000L).build()}, null);
      t.setIsQuoted(true);
      quote.addPlan(t);
    } else if ( sourceAccount instanceof DigitalAccount &&
                destinationAccount instanceof CABankAccount &&
                sourceAccount.getOwner() == destinationAccount.getOwner() ) {

      if ( ! useBmoAsPaymentProvider(x, (BankAccount) destinationAccount) ) return this.getDelegate().put_(x, obj);

      if ( ((CABankAccount) destinationAccount).getStatus() != BankAccountStatus.VERIFIED ) { 
        logger.warning("Bank account needs to be verified for cashout for bank account id: " + sourceAccount.getId() +
              " and transaction id: " + request.getId());
        throw new RuntimeException("Bank account needs to be verified for cashout"); 
      }

      Transaction t = new BmoCOTransaction.Builder(x).build();
      t.copyFrom(request);
      t.setTransfers(((BankAccount) destinationAccount).createCOTransfers(x, t));
      // TODO: use EFT calculation process
      t.addLineItems(new TransactionLineItem[] { new ETALineItem.Builder(x).setEta(/* 1 days */ 864800000L).build()}, null);
      t.setIsQuoted(true);
      quote.addPlan(t);
    }

    return getDelegate().put_(x, quote);
    `
    },
    {
      name: 'useBmoAsPaymentProvider',
      type: 'Boolean',
      args: [
        {
          name: 'x',
          type: 'foam.core.X'
        },
        {
          name: 'bankAccount',
          type: 'net.nanopay.bank.BankAccount'
        }
      ],
      javaCode: `
      ArrayList<PaymentProvider> paymentProviders = PaymentProvider.findPaymentProvider(x, bankAccount);
      return paymentProviders.stream().filter( (paymentProvider)-> paymentProvider.getName().equals(PROVIDER_ID)).count() > 0;
      `
    }
  ]
});
