foam.CLASS({
  package: 'net.nanopay.liquidity.ui',
  name: 'Dashboard',
  imports: [
    'accountDAO'
  ],
  properties: [
    {
      class: 'foam.dao.DAOProperty',
      name: 'accounts',
      documentation: `
        This is just a test property for now.
      `,
      expression: function(accountDAO) {
        return accountDAO;
      }
    }
  ]
});
