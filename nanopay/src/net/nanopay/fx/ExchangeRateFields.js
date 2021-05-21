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
  package: 'net.nanopay.fx',
  name: 'ExchangeRateFields',

  properties: [
      {
        class: 'Double',
        name: 'rate'
      },
      {
        class: 'String',
        name: 'dealReferenceNumber',
      },
      {
        class: 'String',
        name: 'fxStatus',
      },
      {
        class: 'DateTime',
        name: 'expirationTime'
      },
      {
        class: 'DateTime',
        name: 'valueDate'
      },
      {
        class: 'Reference',
        of: 'foam.core.Currency',
        name: 'sourceCurrency'
      },
      {
        class: 'Reference',
        of: 'foam.core.Currency',
        name: 'targetCurrency'
      },
      {
        class: 'Double',
        name: 'sourceAmount',
        value: 0
      },
      {
        class: 'Double',
        name: 'targetAmount',
        value: 0
      }
  ]
});
