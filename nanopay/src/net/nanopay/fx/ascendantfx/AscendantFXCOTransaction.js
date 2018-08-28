foam.CLASS({
  package: 'net.nanopay.fx.ascendantfx',
  name: 'AscendantFXCOTransaction',
  extends: 'net.nanopay.tx.cico.COTransaction',

  javaImports: [
    'java.util.HashMap',
    'net.nanopay.tx.model.TransactionStatus',
    'net.nanopay.tx.Transfer'
  ],

  methods: [
    {
      name: 'mapTransfers',
      javaReturns: 'HashMap<String, Transfer[]>',
      javaCode: `
      HashMap<String, Transfer[]> hm = new HashMap<String, Transfer[]>();
      if ( getStatus() == TransactionStatus.PENDING ) {
        hm.put(getSourceCurrency(), new Transfer[]{
          new Transfer(getSourceAccount(), -getTotal())
        });
      } else if ( getStatus() == TransactionStatus.DECLINED ) {
        hm.put(getSourceCurrency(), new Transfer[]{
          new Transfer(getSourceAccount(), getTotal())
        });
      }
      return hm;
      `
    }
  ]
});
