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
  name: 'MatchCurrency',
  extends: 'foam.mlang.predicate.AbstractPredicate',
  implements: [ 'foam.core.Serializable' ],

  documentation: 'Filter TransactionApprovalRequest by the Destination currency of the associated Transaction',

  requires: [
    'foam.mlang.expr.PropertyExpr'
  ],

  javaImports: [
    'foam.core.X',
    'foam.dao.DAO',
    'foam.util.SafetyUtil',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.TransactionApprovalRequest'
  ],

  properties: [
    {
      class: 'String',
      name: 'currency'
    }
  ],

  methods: [
    {
      name: 'f',
      code: function f(obj) {
        return true;
      },
      javaCode: `
        DAO transactionDAO = (DAO) foam.core.XLocator.get().get("localTransactionDAO");
        
        TransactionApprovalRequest request = (TransactionApprovalRequest) obj;

        Transaction requestTxn = (Transaction) transactionDAO.find(request.getObjId());

        return SafetyUtil.equals(requestTxn.getDestinationCurrency(), getCurrency());
      `
    }
  ]
});
