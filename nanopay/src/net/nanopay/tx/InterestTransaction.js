foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'InterestTransaction',
  extends: 'net.nanopay.tx.model.Transaction',

  documentation: `Transaction to be created specifically for adding Interest to LoanAccounts, enforces source/destination to always be Loan and LoanedTotalAccount`,

  javaImports: [
    'foam.nanos.logger.Logger',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.account.LoanAccount',
    'java.util.List',
    'java.util.ArrayList',
    'net.nanopay.account.LoanedTotalAccount'
  ],

  methods: [
    {
      documentation: `interest transactions can always be executed`,
      name: 'canTransfer',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'oldTxn',
          type: 'net.nanopay.tx.model.Transaction'
        }
      ],
      type: 'Boolean',
      javaCode: `
        return true;
      `
    },
    {
      name: 'executeBeforePut',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'oldTxn',
          type: 'net.nanopay.tx.model.Transaction'
        }
      ],
      type: 'net.nanopay.tx.model.Transaction',
      javaCode: `
      Transaction tx = super.executeBeforePut(x, oldTxn);
      if( ! ( tx.findSourceAccount(x) instanceof LoanAccount ) ) {
        ((Logger)getX().get("logger")).error("Transaction must include a Loan Account as a Source Account");
        throw new RuntimeException("Transaction must include a Loan Account as a Source Account");
      }
      if( ! ( tx.findDestinationAccount(x) instanceof LoanedTotalAccount ) ) {
        ((Logger)getX().get("logger")).error("Transaction must include a LoanedTotalAccount as a Destination Account");
        throw new RuntimeException("Transaction must include a LoanedTotalAccount as a Destination Account");
      }
      return tx;
    `
    },
    {
      name: 'createTransfers',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'oldTxn',
          type: 'net.nanopay.tx.model.Transaction'
        }
      ],
      type: 'net.nanopay.tx.Transfer[]',
      javaCode: `
        List all = new ArrayList();
        all.add(new Transfer.Builder(x).setAccount(getSourceAccount()).setAmount(-getTotal()).build());
        all.add(new Transfer.Builder(x).setAccount(getDestinationAccount()).setAmount(getTotal()).build());
        return (Transfer[]) all.toArray(new Transfer[0]);
      `
    }
  ]
});
