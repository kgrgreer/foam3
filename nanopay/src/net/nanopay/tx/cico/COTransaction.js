foam.CLASS({
  package: 'net.nanopay.tx.cico',
  name: 'COTransaction',
  extends: 'net.nanopay.tx.model.Transaction',

  javaImports: [
    'net.nanopay.bank.BankAccountStatus',
    'net.nanopay.bank.BankAccount',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.model.TransactionStatus',
    'foam.dao.DAO',
    'foam.util.SafetyUtil'
  ],

  properties: [
    {
      name: 'displayType',
      factory: function() {
        return 'Cash Out';
      }
    }
  ],

  methods: [
    {
      name: `validate`,
      args: [
        { name: 'x', javaType: 'foam.core.X' }
      ],
      javaReturns: 'void',
      javaCode: `
      super.validate(x);

      if ( BankAccountStatus.UNVERIFIED.equals(((BankAccount)findDestinationAccount(x)).getStatus())) {
        throw new RuntimeException("Bank account must be verified");
      }

      if ( ! SafetyUtil.isEmpty(getId()) ) {
        Transaction oldTxn = (Transaction) ((DAO) x.get("localTransactionDAO")).find(getId());
        if ( oldTxn.getStatus().equals(TransactionStatus.DECLINED) || oldTxn.getStatus().equals(TransactionStatus.COMPLETED) && !getStatus().equals(TransactionStatus.DECLINED) ) {
          throw new RuntimeException("Unable to update COTransaction, if transaction status is accepted or declined. Transaction id: " + getId());
        }
      }
      `
    }
  ]
});
