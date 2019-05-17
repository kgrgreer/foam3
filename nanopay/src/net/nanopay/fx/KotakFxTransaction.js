foam.CLASS({
  package: 'net.nanopay.fx',
  name: 'KotakFxTransaction',
  extends: 'net.nanopay.fx.FXTransaction',

   javaImports: [
    'java.util.ArrayList',
    'java.util.List',
    'net.nanopay.tx.TransactionLineItem',
    'net.nanopay.tx.model.TransactionStatus',
    'net.nanopay.tx.Transfer'
  ],

   documentation: `Kotak transaction that stays in pending until a manual transaction rate is entered`,

   properties: [
    {
      class: 'Double',
      name: 'rate'
    },
  ],

   methods: [
    {
      name: 'createTransfers',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'oldTxn',
          type: 'net.nanopay.tx.model.Transaction'
        }
      ],
      type: 'net.nanopay.tx.Transfer[]',
      javaCode: `
        List all = new ArrayList();
        TransactionLineItem[] lineItems = getLineItems();
        for ( int i = 0; i < lineItems.length; i++ ) {
          TransactionLineItem lineItem = lineItems[i];
          Transfer[] transfers = lineItem.createTransfers(x, oldTxn, this, getStatus() == TransactionStatus.REVERSE);
          for ( int j = 0; j < transfers.length; j++ ) {
            all.add(transfers[j]);
          }
        }
        Transfer[] transfers = getTransfers();
        for ( int i = 0; i < transfers.length; i++ ) {
          all.add(transfers[i]);
        }
        return (Transfer[]) all.toArray(new Transfer[0]);
      `
    }
  ]
});
