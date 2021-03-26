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
  package: 'net.nanopay.tx.billing',
  name: 'CreateBillsRule',
  implements: ['foam.nanos.ruler.RuleAction'],

  documentation: `Creates bills when a transaction has failed.`,

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'net.nanopay.tx.model.Transaction'
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        agency.submit(x, new ContextAgent() {
          @Override
          public void execute(X x) {
            Transaction txn = (Transaction) obj;
            BillingServiceInterface billingService = (BillingServiceInterface) x.get("billingService");
            billingService.createBills(x, txn);
          }
        }, "Create Bills Rule");
      `
    }
  ]
});
