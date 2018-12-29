foam.CLASS({
  package: 'net.nanopay.tx.alterna',
  name: 'AlternaCITransaction',
  extends: 'net.nanopay.tx.cico.CITransaction',

  javaImports: [
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.account.Account',
    'net.nanopay.account.TrustAccount',
    'net.nanopay.tx.model.TransactionStatus',
    'net.nanopay.tx.Transfer',
    'java.util.Arrays',
    'foam.dao.DAO',
    'net.nanopay.bank.BankAccount',
    'net.nanopay.bank.BankAccountStatus',
    'foam.util.SafetyUtil'
  ],

  properties: [
    {
      class: 'List',
      name: 'updatableProps',
      javaType: 'java.util.ArrayList<foam.core.PropertyInfo>',
      javaFactory: `
      java.util.ArrayList<foam.core.PropertyInfo> list = new java.util.ArrayList();
      list.add(Transaction.INVOICE_ID);
      list.add(Transaction.STATUS);
      list.add(this.RETURN_TYPE);
      return list;`,
      visibility: 'HIDDEN',
      transient: true
    },
    {
      class: 'String',
      name: 'confirmationLineNumber',
      visibility: foam.u2.Visibility.RO
    },
    {
      class: 'String',
      name: 'returnCode',
      visibility: foam.u2.Visibility.RO
    },
    {
      class: 'String',
      name: 'returnDate',
      visibility: foam.u2.Visibility.RO
    },
    {
      class: 'String',
      name: 'returnType',
      visibility: foam.u2.Visibility.RO
    },
    {
      class: 'String',
      name: 'padType'
    },
    {
      class: 'String',
      name: 'txnCode'
    },
    {
      class: 'String',
      name: 'description',
      swiftName: 'description_',
      visibility: foam.u2.Visibility.RO
    },
  ],

  methods: [
    {
      name: 'isActive',
      javaReturns: 'boolean',
      javaCode: `
         return
           getStatus().equals(TransactionStatus.COMPLETED);
      `
    },
    {
      name: `validate`,
      args: [
        { name: 'x', javaType: 'foam.core.X' }
      ],
      javaReturns: 'void',
      javaCode: `
      super.validate(x);

      if ( BankAccountStatus.UNVERIFIED.equals(((BankAccount)findSourceAccount(x)).getStatus())) {
        throw new RuntimeException("Bank account must be verified");
      }

      if ( ! SafetyUtil.isEmpty(getId()) ) {
        Transaction oldTxn = (Transaction) ((DAO) x.get("localTransactionDAO")).find(getId());
        if ( oldTxn.getStatus().equals(TransactionStatus.DECLINED) || oldTxn.getStatus().equals(TransactionStatus.REVERSE) || 
          oldTxn.getStatus().equals(TransactionStatus.REVERSE_FAIL) ||
          oldTxn.getStatus().equals(TransactionStatus.COMPLETED) && ! getStatus().equals(TransactionStatus.DECLINED) ) {
          throw new RuntimeException("Unable to update CITransaction, if transaction status is accepted or declined. Transaction id: " + getId());
        }
      }
      `
    },
  ]
});
