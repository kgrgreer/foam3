foam.CLASS({
  package: 'net.nanopay.tx.alterna',
  name: 'AlternaCOTransaction',
  extends: 'net.nanopay.tx.cico.COTransaction',

  javaImports: [
    'net.nanopay.tx.model.Transaction',
    'java.util.Arrays',
    'net.nanopay.account.Account',
    'net.nanopay.account.TrustAccount',
    'net.nanopay.tx.model.TransactionStatus',
    'net.nanopay.tx.Transfer'
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
      visibility: 'HIDDEN'
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
           getStatus().equals(TransactionStatus.PENDING) ||
           getStatus().equals(TransactionStatus.DECLINED);
      `
    }
  ]
});
