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
  name: 'RepayDebtOnCIRule',
  extends: 'net.nanopay.meter.compliance.AbstractComplianceRuleAction',

  documentation: 'repays debt after a cashIn during FastPay',

  implements: ['foam.nanos.ruler.RuleAction'],

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.dao.DAO',
    'net.nanopay.tx.model.TransactionStatus',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.cico.CITransaction',
    'foam.nanos.auth.User',
    'net.nanopay.model.Business',
    'net.nanopay.account.DebtAccount',
    'net.nanopay.account.OverdraftAccount',
    'net.nanopay.account.Account'
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        if ( obj instanceof CITransaction ) {
          CITransaction cashIn = (CITransaction) obj;
          CITransaction oldCashIn = (CITransaction) oldObj;
          User user = cashIn.findDestinationAccount(x).findOwner(x);
          if( user instanceof Business || user.getGroup().endsWith("-sme") ) { // <- maybe should be part of predicate
            if( cashIn.getStatus() == TransactionStatus.COMPLETED && oldCashIn.getStatus() != TransactionStatus.COMPLETED ) {
              Account OD = (Account) cashIn.findDestinationAccount(x);
              if ( OD != null && OD instanceof OverdraftAccount ) {
                DebtAccount DA = ((OverdraftAccount) OD).findDebtAccount(x);
                if ( DA != null && DA.getLimit() > 0 && ( (long) DA.findBalance(x) ) < 0 ) {
                  agency.submit(x, new ContextAgent() {
                    @Override
                    public void execute(X x) {
                      Transaction repayment = new Transaction.Builder(x)
                      .setDestinationAccount(DA.getId())
                      .setSourceAccount(OD.getId())
                      .setAmount(cashIn.getAmount())
                      .build();
                      ((DAO) x.get("localTransactionDAO")).put(repayment);
                    }
                  }, "Repay Debt On CI Rule");
                }
              }
            }
          }
        }
      `
    }
  ]
});
