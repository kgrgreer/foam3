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
    name: 'SummaryTransactionAfterPutRule',

    documentation: 'Summary transaction after put rule.',

    implements: [
      'foam.nanos.ruler.RuleAction'
    ],

    javaImports: [
      'foam.core.ContextAgent',
      'foam.core.X',
      'foam.dao.*',
      'net.nanopay.tx.SummarizingTransaction',
      'net.nanopay.tx.model.Transaction',
      'net.nanopay.tx.model.TransactionStatus'
    ],

    methods: [
      {
        name: 'applyAction',
        javaCode: `
        agency.submit(x, new ContextAgent() {
          @Override
          public void execute(X x) {
            Transaction oldTxn  = (Transaction) oldObj;
            Transaction txn     = (Transaction) obj;
            Transaction root    = txn.findRoot(x);

            if (root instanceof SummarizingTransaction &&
                root.getStatus() == TransactionStatus.COMPLETED &&
               (oldTxn == null || oldTxn.getStatus() != txn.getStatus()))
            {
              // Update the transient fields of the summary transaction
              SummarizingTransaction summary = (SummarizingTransaction) root.fclone();
              summary.calculateTransients(x, (Transaction) summary);

              // Put the summary transaction
              ((DAO) x.get("summaryTransactionDAO")).put(root);
            }
          }
        }, "Summary Transaction After Put Logic");
        `
      }
    ]
  });
