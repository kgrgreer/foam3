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

var optionalDoubleCSVMapping = `
  foam.core.PropertyInfo prop = this;
  map.put(getName(), new foam.lib.csv.FromCSVSetter() {
    public void set(foam.core.FObject obj, String str) {
      if ( "".equals(str) ) str = "0";
      prop.set(obj, fromString(str));
    }
  });
`;

foam.CLASS({
  package: 'net.nanopay.tx.gs',
  name: 'GsTxCsvRow',
  properties: [
    {
      class: 'Long',
      name: 'id'
    },
    {
      class: 'String',
      name: 'TransactionId'
    },
    {
      class: 'String',
      name: 'OriginSys'
    },
    {
      class: 'String',
      name: 'originSysRef'
    },
    {
      class: 'String',
      name: 'SettleDate'
    },
    {
      class: 'String',
      name: 'TimeStamp'
    },
    {
      class: 'String',
      name: 'TimeZone'
    },
    {
      class: 'String',
      name: 'BankName'
    },
    {
      class: 'String',
      name: 'BankBranch'
    },
    {
      class: 'String',
      name: 'BankId'
    },
    {
      class: 'String',
      name: 'Currency'
    },
    {
      class: 'String',
      name: 'Company'
    },
    {
      class: 'Double',
      name: 'CashQty'
    },
    {
      class: 'Double',
      name: 'CashUSD'
    },
    {
      class: 'String',
      name: 'ClrAgent'
    },
    {
      class: 'String',
      name: 'Account'
    },
    {
      class: 'Double',
      name: 'SecQty',
      javaFromCSVLabelMapping: optionalDoubleCSVMapping
    },
    {
      class: 'String',
      name: 'ProductId'
    },
    {
      class: 'Double',
      name: 'MarketValueLocal'
    },
    {
      class: 'String',
      name: 'MarketValueCCy'
    },
    {
      class: 'Double',
      name: 'MarketValue'
    },
    {
      class: 'String',
      name: 'SettleType'
    },
    {
      class: 'String',
      name: 'IsInternal'
    },
    {
      class: 'String',
      name: 'DescriptionTag'
    },
    {
      class: 'String',
      name: 'Proto_Liquidity_Hierarchy2'
    },
    {
      class: 'String',
      name: 'Proto_Liquidity_Hierarchy3'
    },
    {
      class: 'String',
      name: 'Proto_Liquidity_Hierarchy4'
    },
    {
      class: 'String',
      name: 'ProductType'
    },
    {
      class: 'String',
      name: 'ProductCurrency'
    },
    {
      class: 'String',
      name: 'LiquidityBucket'
    }
  ]
});
