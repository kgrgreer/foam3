foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'PayerTransactionDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: `Determine source account based on payer, when account is not provided.`,

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
    'foam.nanos.auth.User',
  ],

  implements: [
    'foam.mlang.Expressions',
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
        if ( txn.findSourceAccount(x) == null ) {
          User user = (User) ((DAO) x.get("localUserDAO")).find_(x,txn.getPayerId());
          if ( user == null ) {
             PlanTransaction plan = new PlanTransaction.Builder(x).build();
             ErrorTransaction error = new ErrorTransaction.Builder(x).setErrorMessage("Payer not found").setErrorTransaction(txn).build();
             plan.add(x, error);
             quote.setPlan(plan);
             return quote;
          } else {
            DigitalAccount digitalAccount = DigitalAccount.findDefault(x, user, txn.getSourceCurrency());
            txn = (Transaction) obj.fclone();
            txn.setSourceAccount(digitalAccount.getId());
          }
        }
        return getDelegate().put_(x, quote);
`
    },
  ],

  axioms: [
    {
      buildJavaClass: function(cls) {
        cls.extras.push(`
public PayerTransactionDAO(foam.core.X x, foam.dao.DAO delegate) {
  System.err.println("Direct constructor use is deprecated. Use Builder instead.");
  setDelegate(delegate);
}
        `);
      },
    },
  ]
});
