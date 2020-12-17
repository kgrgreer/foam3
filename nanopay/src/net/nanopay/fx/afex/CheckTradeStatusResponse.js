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
  package: "net.nanopay.fx.afex",
  name: "CheckTradeStatusResponse",
  properties: [
    {
      class: 'String',
      name: "TradeNumber"
    },
    {
      class: 'Double',
      name: "Amount"
    },
    {
      class: 'Double',
      name: "RemainingBalance"
    },
    {
      class: 'Double',
      name: "Rate"
    },
    {
      class: 'String',
      name: "BeneficiaryName"
    },
    {
      class: 'String',
      name: "TradeCcy"
    },
    {
      class: 'Double',
      name: "SettlementAmt"
    },
    {
      class: 'String',
      name: "SettlementCcy"
    },
    {
      class: 'String',
      name: "TradeDate"
    },
    {
      class: 'String',
      name: "ValueDate"
    },
    {
      class: 'String',
      name: "Status"
    },
    {
      class: 'String',
      name: "Funded"
    },
    {
      class: 'String',
      name: "Note"
    }
  ]
});
