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
  package: 'net.nanopay.liquidity.ruler',
  name: 'AccountLSValidationPredicate',
  extends: 'foam.mlang.predicate.AbstractPredicate',
  implements: ['foam.core.Serializable'],

  documentation: 'Returns true if high and low liquidity push pull accounts are equal to the id of the account',

  javaImports: [
    'foam.core.X',
    'foam.dao.DAO',
    'foam.core.FObject',
    'foam.util.SafetyUtil',
    'static foam.mlang.MLang.*',
    'net.nanopay.account.DigitalAccount',
    'net.nanopay.liquidity.LiquiditySettings'
  ],

  methods: [
    {
      name: 'f',
      javaCode: `
        FObject nu  = (FObject) NEW_OBJ.f(obj);
        if ( ! (nu instanceof DigitalAccount) ) return false;
        if ( SafetyUtil.isEmpty(((DigitalAccount) nu).getLiquiditySetting()) ) return false;
        LiquiditySettings ls = ((DigitalAccount) nu).findLiquiditySetting((X) obj);

        if (ls.getHighLiquidity().getRebalancingEnabled() == true)
          if ( EQ(ls.getHighLiquidity().getPushPullAccount(), ((DigitalAccount) nu).getId()).f(nu) )
            return true;
        if (ls.getLowLiquidity().getRebalancingEnabled() == true)
          if ( EQ(ls.getLowLiquidity().getPushPullAccount(), ((DigitalAccount) nu).getId()).f(nu) )
            return true;

        return false;
      `
    }
  ]
});
