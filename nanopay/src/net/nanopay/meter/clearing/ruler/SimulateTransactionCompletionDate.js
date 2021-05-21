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
  package: 'net.nanopay.meter.clearing.ruler',
  name: 'SimulateTransactionCompletionDate',
  implements: [
    'foam.nanos.ruler.RuleAction'
  ],

  documentation: 'Estimates transaction completionDate according to a 5 minute clearing time.',

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.dao.DAO',
    'java.util.Date',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.meter.clearing.ClearingTimesTrait',
    'static foam.mlang.MLang.*',
    'org.apache.commons.lang.time.DateUtils'
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        agency.submit(x, new ContextAgent() {
          @Override
          public void execute(X x) {
            DAO dao = (DAO) x.get("localTransactionDAO");
            if ( obj instanceof ClearingTimesTrait) {
              Transaction t = (Transaction) obj.fclone();
              Date completionDate = DateUtils.addMinutes(new Date(), 1);
              ((ClearingTimesTrait) t).setEstimatedCompletionDate(completionDate);
              dao.put(t);
            }
          }
        }, "Simulate Transaction Completion Date");
      `
    }
  ]
});
