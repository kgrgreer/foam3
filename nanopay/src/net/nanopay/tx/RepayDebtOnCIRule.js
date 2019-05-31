foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'RepayDebtOnCIRule',
  extends: 'net.nanopay.meter.compliance.AbstractComplianceRuleAction',

  documentation: 'repays debt after a cashIn during FastPay',

  implements: ['foam.nanos.ruler.RuleAction'],

  javaImports: [
    'foam.dao.DAO',
    'net.nanopay.tx.model.TransactionStatus',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.cico.CITransaction',
    'foam.nanos.auth.User',
    'net.nanopay.model.Business',
    'net.nanopay.account.DebtAccount',
    'net.nanopay.account.OverdraftAccount',
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        if ( obj instanceof CITransaction ) {
          CITransaction cashIn = (CITransaction) obj;
          CITransaction oldCashIn = (CITransaction) oldObj;
          User user = cashIn.findDestinationAccount(x).findOwner(x);
          if( user instanceof Business || user.getGroup().equals("sme") ) { // <- maybe should be part of predicate
            if( cashIn.getStatus() == TransactionStatus.COMPLETED && oldCashIn.getStatus() != TransactionStatus.COMPLETED ) {
              OverdraftAccount OD = (OverdraftAccount) cashIn.findDestinationAccount(x);
              if ( OD != null ) {
                DebtAccount DA = OD.findDebtAccount(x);
                if ( DA != null && DA.getLimit() > 0 && ( (long) DA.findBalance(x) ) < 0 ) {
                  Transaction repayment = new Transaction.Builder(x)
                    .setDestinationAccount(DA.getId())
                    .setSourceAccount(OD.getId())
                    .setAmount(cashIn.getAmount())
                    .build();
                  ((DAO) x.get("localTransactionDAO")).put(repayment);
                }
              }
            }
          }
        }
      `
    },
    {
      name: 'applyReverseAction',
      javaCode: ` `
    },
    {
      name: 'describe',
      javaCode: ` return "Creates a debt repayment txn after a successful CI for a FastPay user."; `
    },
    {
      name: 'canExecute',
      javaCode: ` return true;`
    }
  ]
});
