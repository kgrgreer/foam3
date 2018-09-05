foam.CLASS({
  package: 'net.nanopay.tx.alterna',
  name: 'AlternaCITransaction',
  extends: 'net.nanopay.tx.cico.CITransaction',

  javaImports: [
    'java.util.HashMap',
    'net.nanopay.tx.model.TransactionStatus',
    'net.nanopay.tx.Transfer'
  ],

  properties: [
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
      name: 'referenceNumber',
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
      name: 'createTransfers',
      javaReturns: 'Transfer[]',
      javaCode: `
      if ( getStatus() == TransactionStatus.COMPLETED ) {
        return new Transfer[]{
          new Transfer.Builder(getX()).setAccount(getDestinationAccount()).setAmount(getTotal()).build()
        };
      } else if ( getStatus() == TransactionStatus.DECLINED ) {
        return new Transfer[]{
          new Transfer.Builder(getX()).setAccount(getDestinationAccount()).setAmount(-getTotal()).build()
        };
      }else return new Transfer[] {};
      `
    }
  ]
});
