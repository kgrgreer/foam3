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
  package: 'net.nanopay.fx.lianlianpay.model',
  name: 'ReconciliationRecord',

  documentation: 'Represents a reconciliation record',

  properties: [
    {
      class: 'String',
      name: 'orderId',
      documentation: 'Merchant unique instruction number'
    },
    {
      class: 'String',
      name: 'sourceCurrency',
      documentation: 'Source currency'
    },
    {
      class: 'Float',
      name: 'sourceAmount',
      documentation: 'Source amount'
    },
    {
      class: 'String',
      name: 'targetCurrency',
      documentation: 'Target currency'
    },
    {
      class: 'Float',
      name: 'targetAmount',
      documentation: 'Target amount'
    },
    {
      class: 'String',
      name: 'paymentCurrency',
      documentation: 'Payment currency'
    },
    {
      class: 'Float',
      name: 'paymentAmount',
      documentation: 'Payment amount'
    },
    {
      class: 'Float',
      name: 'rate',
      documentation: 'Settlement rate'
    },
    {
      class: 'String',
      name: 'result',
      documentation: 'Payment result',
    }
  ]
});
