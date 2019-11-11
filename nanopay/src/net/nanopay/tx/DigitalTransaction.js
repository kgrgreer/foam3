/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'DigitalTransaction',
  extends: 'net.nanopay.tx.model.Transaction',

  javaImports: [
    'foam.dao.DAO',
    'foam.nanos.logger.Logger',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.model.TransactionStatus'
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
