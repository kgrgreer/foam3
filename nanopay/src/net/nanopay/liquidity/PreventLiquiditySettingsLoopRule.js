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
  package: 'net.nanopay.liquidity',
  name: 'PreventLiquiditySettingsLoopRule',
  extends: 'net.nanopay.liquidity.PreventAccountLiquidityLoopRule',

  documentation: `When a liquidity settings is created or updated this rule prevents money 
    from infinitely looping through multiple accounts via Liquidity Settings.`,

  implements: [
    'foam.nanos.ruler.RuleAction'
  ],

  javaImports: [
    'foam.dao.DAO',
    'foam.dao.ArraySink',
    'net.nanopay.account.DigitalAccount',
    'net.nanopay.liquidity.LiquiditySettings'
  ],

  properties: [
    {
      class: 'String',
      name: 'message'
    }
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        LiquiditySettings liquiditySetting = (LiquiditySettings) obj;
        DAO accountDAO = (DAO) x.get("localAccountDAO");

        ArraySink sink = (ArraySink) accountDAO.where(
          foam.mlang.MLang.EQ(DigitalAccount.LIQUIDITY_SETTING, liquiditySetting.getId())
        ).select(new ArraySink());

        for ( int i = 0; i < sink.getArray().size(); i++ ) {
          DigitalAccount account = (DigitalAccount) sink.getArray().get(i);
          checkLiquidityLoop(x, account, true, liquiditySetting, this.getMessage());
          checkLiquidityLoop(x, account, false, liquiditySetting, this.getMessage());
        }
      `
    }
  ]
});
