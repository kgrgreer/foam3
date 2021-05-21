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
  name: 'GetFXQuote',

  documentation: 'API to get FX Quote',

  properties: [
    {
      class: 'String',
      name: 'valueDate'
    },
    {
      class: 'String',
      name: 'sourceCurrency'
    },
    {
      class: 'String',
      name: 'targetCurrency'
    },
    {
      class: 'Long',
      name: 'sourceAmount',
      value: 0
    },
    {
      class: 'Long',
      name: 'targetAmount',
      value: 0
    },
    {
        class: 'String',
        name: 'fxDirection'
    }
  ]
});
