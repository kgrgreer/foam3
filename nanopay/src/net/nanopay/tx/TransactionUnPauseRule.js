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
  package: 'net.nanopay.tx',
  name: 'TransactionUnPauseRule',
  implements: ['foam.nanos.ruler.RuleAction'],

  documentation: `Sets transaction to completed if parent completes while paused.`,

  javaImports: [
    'foam.dao.DAO',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.model.TransactionStatus',
  ],
  methods: [
    {
      name: 'applyAction',
      javaCode: ` 

      Transaction txn = (Transaction) obj;
      DAO txnDAO = (DAO) x.get("localTransactionDAO");
      Transaction parent = (Transaction) txnDAO.find(txn.getParent());

      if ( parent.getStatus() == TransactionStatus.COMPLETED ) {
        txn.setStatus(TransactionStatus.COMPLETED);
      }
      `
    }
  ]
 });
