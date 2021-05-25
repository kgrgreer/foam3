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
  package: 'net.nanopay.tx.ruler',
  name: 'CascadingCancelAction',

  documentation: 'Gets the children transactions, sets their status to canceled and submits them to the dao.',

  implements: ['foam.nanos.ruler.RuleAction'],

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'java.util.List',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.model.TransactionStatus',
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
         agency.submit(x, new ContextAgent() {
            @Override
            public void execute(X x) {
              Transaction tx = (Transaction) obj;
              List children = ((ArraySink) tx.getChildren(x).select(new ArraySink())).getArray();
              DAO localTransactionDAO = ((DAO) x.get("localTransactionDAO"));

              for ( Object o : children ) {
                Transaction t = (Transaction) o;
                t.setStatus(TransactionStatus.CANCELLED);
                t.setErrorCode(10002);
                localTransactionDAO.put(t);
              }
            }
         },"Cancel children transactions");
      `
    }
  ]
});
