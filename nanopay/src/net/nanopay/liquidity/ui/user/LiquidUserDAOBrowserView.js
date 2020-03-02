foam.CLASS({
  package: 'foam.nanos.auth',
  name: 'UserDAOBrowserView',
  extends: 'foam.comics.v2.DAOBrowserView',

  exports: [ 'searchColumns' ],

  properties: [
    {
      name: 'searchColumns',
      value: [
        'firstName',
        'lastName',
        'organization'
      ]
    }
  ],
});
