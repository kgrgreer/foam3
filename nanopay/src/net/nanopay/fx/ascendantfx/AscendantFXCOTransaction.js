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
      name: 'createTransfers',
      javaReturns: 'Transfer[]',
      javaCode: `
      if ( getStatus() == TransactionStatus.PENDING ) {
        return new Transfer[]{
          new Transfer.Builder(getX()).setAmount(-getTotal()).setAmount(getSourceAccount()).build()
        };
      } else if ( getStatus() == TransactionStatus.DECLINED ) {
        return new Transfer[]{
          new Transfer.Builder(getX()).setAmount(getTotal()).setAmount(getSourceAccount()).build()
        };
      } else return new Transfer[] {};
      `
    }
  ]
});
