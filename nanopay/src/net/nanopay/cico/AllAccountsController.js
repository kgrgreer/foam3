foam.CLASS({
  package: 'net.nanopay.cico',
  name: 'AllAccountsController',
  extends: 'foam.comics.DAOController',

  documentation: 'A custom DAOController for all accounts view to have cash in and cash out.',

  requires: [
    'net.nanopay.cico.ui.CicoBorder'
  ],

  properties: [
    {
      name: 'border',
      factory: function() {
        return this.CicoBorder.create();
      }
    }
  ]
});