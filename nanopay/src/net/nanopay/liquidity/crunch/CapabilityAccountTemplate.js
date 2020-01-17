foam.CLASS({
  package: 'net.nanopay.liquidity.crunch',
  name: 'CapabilityAccountTemplate',
  extends: 'net.nanopay.liquidity.crunch.AccountTemplate',

  javaImports: [
    'foam.core.X',
    'foam.dao.DAO',
    'net.nanopay.account.Account',
    'java.util.Map'
  ],

  properties: [
    {
      name: 'accounts',
      view: function(_, x) {
        return {
          class: 'net.nanopay.liquidity.crunch.CapabilityAccountTemplateMapView',
          isCapabilityAccountData: true
        };
      }
    }
  ]

});
