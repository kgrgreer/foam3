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
  name: "CreateTradeRequest",
  properties: [
    {
      class: 'String',
      name: "clientAPIKey"
    },
    {
      class: 'String',
      name: "accountNumber"
    },
    {
      class: 'String',
      name: "amount"
    },
    {
      class: 'String',
      name: "isAmountSettlement"
    },
    {
      class: 'String',
      name: "note"
    },
    {
      class: 'String',
      name: "POPCode"
    },
    {
      class: 'String',
      name: "purposeOfPayment"
    },
    {
      class: 'String',
      name: "quoteID"
    },
    {
      class: 'String',
      name: "settlementCcy"
    },
    {
      class: 'String',
      name: "tradeCcy"
    },
    {
      class: 'String',
      name: "valueDate"
    },
    {
      class: 'String',
      name: "vendorId"
    }
  ]
});
