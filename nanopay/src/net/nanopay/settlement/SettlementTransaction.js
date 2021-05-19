// TODO: Going to be reworked

/**
 * NANOPAY CONFIDENTIAL
 *
 * [2021] nanopay Corporation
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
  package: 'net.nanopay.settlement',
  name: 'SettlementTransaction',
  extends: 'net.nanopay.tx.DigitalTransaction',
  documentation: `This transaction subclass is ment to work with the Maldivian Planner. It is a intercepted bank to bank transaction that is digitized.`,

  javaImports: [
    'foam.nanos.logger.Logger',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.model.TransactionStatus',
    'foam.dao.DAO',
],

  properties: [
    {
      name: 'name',
      factory: function() {
        return 'Intercepted Transfer';
      },
      javaFactory: `
    return "Intercepted Transfer";
      `,
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

      Transaction oldTxn = (Transaction) ((DAO) x.get("localTransactionDAO")).find(getId());
      if ( oldTxn != null && oldTxn.getStatus() == TransactionStatus.COMPLETED ) {
        ((Logger) x.get("logger")).error("instanceof SettlementTransaction cannot be updated.");
        throw new RuntimeException("instanceof SettlementTransaction cannot be updated.");
      }
      `
    },
  ]
});
