foam.CLASS({
  package: 'net.nanopay.liquidity.ui.transaction',
  name: 'TransactionDAOBrowserView',
  extends: 'foam.comics.v2.DAOBrowserView',

  exports: [ 'searchColumns' ],

  properties: [
    {
      name: 'searchColumns',
      value: [
        'type',
        'status',
        'sourceAccount',
        'destinationAccount',
        'created'
      ]
    }
  ],
});
