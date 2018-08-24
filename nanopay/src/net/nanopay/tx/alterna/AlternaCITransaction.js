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
      name: 'mapTransfers',
      javaReturns: 'HashMap<String, Transfer[]>',
      javaCode: `
      HashMap<String, Transfer[]> hm = new HashMap<String, Transfer[]>();
      if ( getStatus() == TransactionStatus.COMPLETED ) {
        hm.put(getSourceCurrency(), new Transfer[]{
          new Transfer(getDestinationAccount(), getTotal())
        });
      } else if ( getStatus() == TransactionStatus.DECLINED ) {
        hm.put(getSourceCurrency(), new Transfer[]{
          new Transfer(getDestinationAccount(), -getTotal())
        });
      }
      return hm;
      `
    }
  ]
});
