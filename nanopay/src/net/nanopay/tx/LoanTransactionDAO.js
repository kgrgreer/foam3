foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'LoanTransactionDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: `Updates loan account.`,

  javaImports: [
  'foam.dao.DAO',
  'foam.nanos.auth.User',
  'net.nanopay.tx.model.Transaction',
  'net.nanopay.account.LoanAccount'
  ],

  methods: [
  {
  name: 'put_',
  javaCode: `
      Transaction txn = (Transaction)obj;
      if( txn.getDestinationAccount() instanceof LoanAccount ) throw new RuntimeException("Can not directly transfer into a loan account");
      if( txn.getSourceAccount() instanceof LoanAccount ) throw new RuntimeException("Can not directly transfer from a loan account");
      `
  }
  ],

  axioms: [
  {
  buildJavaClass: function(cls) {
  cls.extras.push(`
   public SaveChainedTransactionDAO(foam.core.X x, foam.dao.DAO delegate) {
     System.err.println("Direct constructor use is deprecated. Use Builder instead.");
     setDelegate(delegate);
   }
           `);
  },
  },
  ]
  });
