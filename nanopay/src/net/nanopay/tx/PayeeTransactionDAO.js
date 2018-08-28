foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'PayeeTransactionDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: `Determine destination account based on payee, when account is not provided.`,

  javaImports: [
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.account.DigitalAccount',
    'foam.dao.DAO',
    'foam.nanos.auth.User'
  ],

  imports: [
    'localUserDAO'
  ],

  requires: [
    'foam.nanos.auth.User'
  ],

  implements: [
    'foam.mlang.Expressions'
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
        if ( ! ( obj instanceof QuoteTransaction ) ) {
          return getDelegate().put_(x, obj);
        }
        QuoteTransaction quote = (QuoteTransaction) obj;
        Transaction txn = quote.getRequestTransaction();
        if ( txn.findDestinationAccount(x) == null ) {
          User user = (User) ((DAO) x.get("localUserDAO")).find_(x,txn.getPayeeId());
          if ( user == null ) {
             PlanTransaction plan = new PlanTransaction.Builder(x).build();
             ErrorTransaction error = new ErrorTransaction.Builder(x).setErrorMessage("Payee not found").setErrorTransaction(txn).build();
             plan.add(x, error);
             quote.setPlan(plan);
             return quote;
          } else {
            DigitalAccount digitalAccount = DigitalAccount.findDefault(x, user, txn.getDestinationCurrency());
            txn = (Transaction) obj.fclone();
            txn.setDestinationAccount(digitalAccount.getId());
          }
        }
        return getDelegate().put_(x, txn);
`
    },
  ],

  axioms: [
    {
      buildJavaClass: function(cls) {
        cls.extras.push(`
public PayeeTransactionDAO(foam.core.X x, foam.dao.DAO delegate) {
  System.err.println("Direct constructor use is deprecated. Use Builder instead.");
  setDelegate(delegate);
}
        `);
      },
    },
  ]
});
