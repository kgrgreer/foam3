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
          of: 'foam.core.X'
        },
        {
          name: 'obj',
          of: 'foam.core.FObject'
        }
      ],
      javaReturns: 'foam.core.FObject',
      javaCode: `
        TransactionQuote quote = (TransactionQuote) obj;
        Transaction request = (Transaction) quote.getRequestTransaction().fclone();

        if ( ! ( request instanceof AbliiTransaction ) ) {
          return super.put_(x, obj);
        }

        Account destAcc = request.findDestinationAccount(x);

        if ( destAcc instanceof DigitalAccount ) {
          destAcc = BankAccount.findDefault(x, destAcc.findOwner(x), request.getDestinationCurrency());

          if ( destAcc == null ) {
            throw new RuntimeException("Contact does not have a " + request.getDestinationCurrency() + " bank account.");
          }

          request.setDestinationAccount(destAcc.getId());
          quote.setRequestTransaction(request);
        }

        return super.put_(x, quote);
      `
    },
  ]
});
