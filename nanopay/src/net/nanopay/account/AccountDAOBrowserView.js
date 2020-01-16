foam.CLASS({
  package: 'net.nanopay.account',
  name: 'AccountDAOBrowserView',
  extends: 'foam.comics.v2.DAOBrowserView',

  exports: [ 'searchColumns' ],

  properties: [
    {
      name: 'searchColumns',
      value: [
        'id',
        'name',
        'denomination',
        'type'
      ]
    }
  ],
});

