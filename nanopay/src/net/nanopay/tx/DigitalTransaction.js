foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'DigitalTransaction',
  extends: 'net.nanopay.tx.model.Transaction',

  javaImports: [
    'foam.dao.DAO',
    'foam.nanos.auth.User',
    'foam.nanos.logger.Logger',
    
    'net.nanopay.admin.model.ComplianceStatus',
    'net.nanopay.model.Business',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.model.TransactionStatus',
    'java.util.List',
    'java.util.ArrayList'
],

  properties: [
    {
      name: 'name',
      factory: function() {
        return 'Digital Transfer';
      },
      javaFactory: `
    return "Digital Transfer";
      `,
    },
    {
      name: 'statusChoices',
      hidden: true,
      documentation: 'Returns available statuses for each transaction depending on current status',
      factory: function() {
        return [
          'No status to choose.'
        ];
      }
    }
  ],

  methods: [
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
        TransactionLineItem[] lineItems = getLineItems();
        for ( int i = 0; i < lineItems.length; i++ ) {
          TransactionLineItem lineItem = lineItems[i];
          Transfer[] transfers = lineItem.createTransfers(x, oldTxn, this, getStatus() == TransactionStatus.REVERSE);
          for ( int j = 0; j < transfers.length; j++ ) {
            all.add(transfers[j]);
          }
        }
        Transfer[] transfers = getTransfers();
        for ( int i = 0; i < transfers.length; i++ ) {
          all.add(transfers[i]);
        }
        all.add(new Transfer.Builder(x).setAccount(getSourceAccount()).setAmount(-getTotal()).build());
        all.add(new Transfer.Builder(x).setAccount(getDestinationAccount()).setAmount(getTotal()).build());
        return (Transfer[]) all.toArray(new Transfer[0]);
      `
    },
    {
      name: `validate`,
      args: [
        { name: 'x', type: 'Context' }
      ],
      type: 'Void',
      javaCode: `
      super.validate(x);

      User sourceOwner = findSourceAccount(x).findOwner(x);
      if ( sourceOwner instanceof Business
        && ! sourceOwner.getCompliance().equals(ComplianceStatus.PASSED)
      ) {
        throw new RuntimeException("Sender needs to pass business compliance.");
      }

      User destinationOwner = findDestinationAccount(x).findOwner(x);
      if ( destinationOwner.getCompliance().equals(ComplianceStatus.FAILED) ) {
        // We throw when the destination account owner failed compliance however
        // we obligate to not expose the fact that the user failed compliance.
        throw new RuntimeException("Receiver needs to pass compliance.");
      }

      Transaction oldTxn = (Transaction) ((DAO) x.get("localTransactionDAO")).find(getId());
      if ( oldTxn != null && oldTxn.getStatus() == TransactionStatus.COMPLETED ) {
        ((Logger) x.get("logger")).error("instanceof DigitalTransaction cannot be updated.");
        throw new RuntimeException("instanceof DigitalTransaction cannot be updated.");
      }
      `
    },
  ]
});
