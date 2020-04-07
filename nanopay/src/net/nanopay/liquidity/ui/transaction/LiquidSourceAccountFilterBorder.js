foam.CLASS({
  package: 'net.nanopay.liquidity.ui.transaction',
  name: 'LiquidSourceAccountFilterBorder',
  extends: 'foam.u2.Element',

  documentation: 'View border on source account filtering for liquid transaction.',

  imports: [ 'accountDAO' ],
  exports: [ 'filteredAccountDAO as accountDAO' ],

  properties: [
    {
      name: 'filteredAccountDAO',
      factory: function() {
        var E = foam.mlang.Expressions.create();
        return this.accountDAO.where(E.OR(
          E.CLASS_OF(net.nanopay.account.DigitalAccount),
          E.AND(
            E.EQ(this.__subContext__.user.group, 'admin'),
            E.INSTANCE_OF(net.nanopay.account.ShadowAccount)
          )
        ));
      }
    }
  ]
});
