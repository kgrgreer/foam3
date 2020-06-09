/**
 * NANOPAY CONFIDENTIAL
 *
 * [2020] nanopay Corporation
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of nanopay Corporation.
 * The intellectual and technical concepts contained
 * herein are proprietary to nanopay Corporation
 * and may be covered by Canadian and Foreign Patents, patents
 * in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from nanopay Corporation.
 */

foam.CLASS({
  package: 'net.nanopay.liquidity.ui.transaction',
  name: 'LiquidSourceAccountFilterBorder',
  extends: 'foam.u2.Element',

  documentation: 'View border on source account filtering for liquid transaction.',

  imports: [
    'accountDAO',
    'user'
  ],
  exports: [ 'filteredAccountDAO as accountDAO' ],

  properties: [
    {
      name: 'filteredAccountDAO',
      factory: function() {
        var E = foam.mlang.Expressions.create();
        return this.accountDAO.where(E.OR(
          E.CLASS_OF(net.nanopay.account.DigitalAccount),
          E.AND(
            E.EQ(this.user.group, 'admin'),
            E.INSTANCE_OF(net.nanopay.account.ShadowAccount)
          )
        ));
      }
    }
  ]
});
