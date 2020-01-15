foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'DigitalTransaction',
  extends: 'net.nanopay.tx.model.Transaction',

  javaImports: [
    'foam.dao.DAO',
    'foam.nanos.auth.LifecycleState',
    'foam.nanos.logger.Logger',
    'net.nanopay.model.Business',
    'foam.nanos.auth.User',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.model.TransactionStatus',
    'net.nanopay.admin.model.ComplianceStatus'
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
      name: `validate`,
      args: [
        { name: 'x', type: 'Context' }
      ],
      type: 'Void',
      javaCode: `
      super.validate(x);

      // Don't allow updating a DigitalTransaction that is already COMPLETED
      // except when changing lifecycleState from PENDING to ACTIVE.
      Transaction oldTxn = (Transaction) ((DAO) x.get("localTransactionDAO")).find(getId());
      if ( oldTxn != null
        && oldTxn.getStatus() == TransactionStatus.COMPLETED
        && ! ( oldTxn.getLifecycleState() == LifecycleState.PENDING
          && getLifecycleState() == LifecycleState.ACTIVE )
      ) {
        ((Logger) x.get("logger")).error("instanceof DigitalTransaction cannot be updated.");
        throw new RuntimeException("instanceof DigitalTransaction cannot be updated.");
      }

      // Check source account owner compliance
      User sourceOwner = findSourceAccount(x).findOwner(x);
      if ( sourceOwner instanceof Business
        && ! sourceOwner.getCompliance().equals(ComplianceStatus.PASSED)
      ) {
        throw new RuntimeException("Sender needs to pass business compliance.");
      }

      // Check destination account owner compliance
      User destinationOwner = findDestinationAccount(x).findOwner(x);
      if ( destinationOwner.getCompliance().equals(ComplianceStatus.FAILED) ) {
        // We throw when the destination account owner failed compliance however
        // we obligate to not expose the fact that the user failed compliance.
        throw new RuntimeException("Receiver needs to pass compliance.");
      }
      `
    },
  ]
});
