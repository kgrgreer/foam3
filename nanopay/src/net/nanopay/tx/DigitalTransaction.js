/**
 * NANOPAY CONFIDENTIAL
 *
 * [2020] nanopay Corporation
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of nanopay Corporation.
 * The intellectual and technical concepts contained
 * herein are proprietary to nanopay Corporation
 * and may be covered by Canadian and Foreign Patents, patents
 * in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from nanopay Corporation.
 */

foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'DigitalTransaction',
  extends: 'net.nanopay.tx.model.Transaction',

  implements: [
    'net.nanopay.tx.ValueMovementTransaction'
  ],

  javaImports: [
    'foam.core.ValidationException',
    'foam.dao.DAO',
    'foam.nanos.auth.LifecycleState',
    'foam.nanos.auth.User',
    'foam.nanos.logger.Logger',
    'net.nanopay.admin.model.ComplianceStatus',
    'net.nanopay.contacts.Contact',
    'net.nanopay.model.Business',
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

        // Don't allow updating a DigitalTransaction that is already COMPLETED,
        // except when the old lifecycleState=PENDING.
        Transaction oldTxn = (Transaction) ((DAO) x.get("localTransactionDAO")).find(getId());
        if ( oldTxn != null
          && oldTxn.getStatus() == TransactionStatus.COMPLETED
          && oldTxn.getLifecycleState() != LifecycleState.PENDING
        ) {
          ((Logger) x.get("logger")).error("DigitalTransaction cannot be updated.");
          throw new ValidationException("DigitalTransaction cannot be updated.");
        }

        // Check source account owner compliance
        User sourceOwner = findSourceAccount(x).findOwner(x);
        if ( sourceOwner instanceof Business &&
           ! sourceOwner.getCompliance().equals(ComplianceStatus.PASSED)
        ) {
          throw new ValidationException("Sender needs to pass business compliance.");
        }

        // Check destination account owner compliance
        User destinationOwner = findDestinationAccount(x).findOwner(x);
        if ( destinationOwner.getCompliance().equals(ComplianceStatus.FAILED) ) {
          // We throw when the destination account owner failed compliance, however
          // we are obligated to not expose this fact to the user.
          throw new ValidationException("Receiver needs to pass compliance.");
        }
      `
    },
  ]
});
