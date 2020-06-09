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
  name: 'CurrencyBalanceRecord',

  documentation: 'Represents a currency balance record',

  properties: [
    {
      class: 'String',
      name: 'asOfDate',
      documentation: 'Statement date, i.e. previous accounting date, format is YYYMMDD'
    },
    {
      class: 'String',
      name: 'currency',
      documentation: 'Currency type'
    },
    {
      class: 'Float',
      name: 'balance',
      documentation: 'Currency balance'
    }
  ]
});
