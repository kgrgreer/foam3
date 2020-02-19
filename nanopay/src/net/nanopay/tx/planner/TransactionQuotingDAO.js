foam.CLASS({
  package: 'net.nanopay.tx.planner',
  name: 'TransactionQuotingDAO',
  extends: 'foam.dao.ProxyDAO',

  javaImports: [
    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.dao.ProxyDAO',
    'foam.nanos.logger.Logger',
    'net.nanopay.account.Account',
    'net.nanopay.account.Balance',
    'net.nanopay.account.ZeroAccount',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.TransactionQuote',
    'net.nanopay.tx.Transfer'
  ],

  properties: [
    {
      class: 'Boolean',
      name: 'enableValidation',
      value: false
    }
  ],

  axioms: [
    {
      buildJavaClass: function(cls) {
        cls.extras.push(`
      public TransactionQuotingDAO(X x, DAO delegate) {
        setX(x);
        setDelegate(delegate);
        System.err.println("Direct constructor use is deprecated. Use Builder instead.");
      }
        `);
      }
    }
  ],

  methods: [
    {
      name: 'put_',
      args: [
        { name: 'x', type: 'Context' },
        { name: 'obj', type: 'foam.core.FObject' }
      ],
      type: 'foam.core.FObject',
      javaCode: `
        Transaction txn = (Transaction) obj;
        if ( ! txn.getIsQuoted() ) {
          TransactionQuote quote = new TransactionQuote();
          quote.setRequestTransaction(txn);
          quote = (TransactionQuote) ((DAO) x.get("localTransactionPlannerDAO")).inX(x).put(quote);
          validateQuoteTransfers(x, quote);
          return getDelegate().put_(x, quote.getPlan());
        }
        return getDelegate().put_(x, obj);
      `

    },
    {
      name: 'validateQuoteTransfers',
      args: [
        { name: 'x', type: 'Context' },
        { name: 'quote', type: 'net.nanopay.tx.TransactionQuote'}
      ],
      javaCode: `
        if ( ! getEnableValidation() )
          return;

        DAO balanceDAO = (DAO) x.get("balanceDAO");
        Logger logger = (Logger) x.get("logger");

        Transaction transaction = quote.getPlan();
        Transfer[] transfers = transaction.getTransfers();

        for ( Transfer transfer : transfers ) {
          transfer.validate();
          Account account = transfer.findAccount(getX());
          if ( account == null ) {
            logger.error(this.getClass().getSimpleName(), "validateQuoteTransfers", "transfer account not found: " + transfer.getAccount(), transfer);
            throw new RuntimeException("Plan is not valid");
          }

          // Skip validation of amounts for transfers to trust accounts (zero accounts) since we don't
          // want to surface these errors to the user during quoting. The error will be caught in the
          // TransactionDAO during validation of transfers there if the trust account doesn't have enough
          // value at that point.
          if ( ! ( account instanceof ZeroAccount ) ) {
            account.validateAmount(x, (Balance) balanceDAO.find(account.getId()), transfer.getAmount());
          }
        }
      `
    }
  ]

});
