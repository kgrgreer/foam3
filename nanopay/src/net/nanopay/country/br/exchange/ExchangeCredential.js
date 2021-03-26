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
  package: 'net.nanopay.country.br.exchange',
  name: 'ExchangeCredential',

  properties: [
    {
      class: 'String',
       name: 'exchangeUrl'
    },
    {
      class: 'Int',
       name: 'exchangeAgencia'
    },
    {
      class: 'String',
       name: 'exchangeUsername'
    },
    {
      class: 'String',
       name: 'exchangePassword'
    },
    {
      class: 'Long',
      name: 'defaultLimit',
      value: 1000000
    }
  ]
});
