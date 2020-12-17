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
  name: 'ParentCompleteToPendingRule',

  documentation: `changes PENDING_PARENT_COMPLETED to PENDING`,

  implements: ['foam.nanos.ruler.RuleAction'],

  javaImports: [
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.model.TransactionStatus',

  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
      Transaction tx = (Transaction) obj;
      Transaction oldTx = (Transaction) oldObj;
        if( oldTx.getStatus() == TransactionStatus.PAUSED && tx.getStatus() == TransactionStatus.PENDING_PARENT_COMPLETED && ((Transaction) tx.findParent(x)).getStatus() == TransactionStatus.COMPLETED)
          tx.setStatus(tx.getInitialStatus());

      `
    }
  ]
});
