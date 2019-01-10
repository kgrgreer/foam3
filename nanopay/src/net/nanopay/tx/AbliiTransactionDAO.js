foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'AbliiTransactionDAO',
  extends: 'foam.dao.ProxyDAO',

  javaImports: [
    'foam.nanos.auth.User',
    'foam.nanos.logger.Logger',
    'foam.util.SafetyUtil',

    'net.nanopay.account.Account',
    'net.nanopay.account.DigitalAccount',
    'net.nanopay.account.TrustAccount',
    'net.nanopay.tx.TransactionQuote',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.bank.BankAccount'
  ],

  methods: [
    {
      name: 'put_',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'obj',
          type: 'foam.core.FObject'
        }
      ],
      type: 'foam.core.FObject',
      javaCode: `
      TransactionQuote quote = (TransactionQuote) obj;
      Transaction request = (Transaction) quote.getRequestTransaction().fclone();
      if ( ! ( request instanceof AbliiTransaction ) ) return getDelegate().put_(x, obj);
      Account destAcc = request.findDestinationAccount(getX());
      if ( destAcc instanceof DigitalAccount ) {
        destAcc = BankAccount.findDefault(getX(), destAcc.findOwner(getX()), request.getDestinationCurrency() );
        request.setDestinationAccount(destAcc.getId());
        quote.setRequestTransaction(request);
      }
      return getDelegate().put_(x, quote);
      `
    },
  ]
});
