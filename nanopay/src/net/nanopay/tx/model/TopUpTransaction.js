foam.CLASS({
  package: 'net.nanopay.tx.model',
  name: 'TopUpTransaction',
  extends: 'net.nanopay.tx.model.Transaction',
  javaImports: [
    'net.nanopay.tx.Transfer',
    'java.util.*'
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(foam.java.Code.create({
          data: `
            public HashMap<String, Transfer[]> mapTransfers() {

              HashMap<String, Transfer[]> hm = new HashMap<String, Transfer[]>();
              if ( ! isActive() ) return hm;
              hm.put(getSourceCurrency(), new Transfer[]{
                new Transfer.Builder(getX()).setAccount(getDestinationAccount()).setAmount(getTotal()).build()
              });
              return hm;
            }
        `}));
      }
    }
  ]
})
