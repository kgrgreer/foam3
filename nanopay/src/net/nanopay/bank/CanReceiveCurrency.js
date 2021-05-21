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
  package: 'net.nanopay.bank',
  name: 'CanReceiveCurrency',

  documentation: 'A request to canAcceptCurrencyDAO.',

  properties: [
    {
      class: 'Long',
      name: 'userId',
      documentation: `
        Set this to a user's id. The DAO will check if this user is able to
        receive money in the currency with id currencyId.
      `,
      required: true
    },
    {
      class: 'String',
      name: 'currencyId',
      documentation: `currencyId is the id of Currency`,
      required: true
    },
    {
      class: 'Long',
      name: 'payerId',
      documentation: `
      Set this to the payer's id. The DAO will check if this user is able to
      send money in the currency with id currencyId.
      `
    },
    {
      class: 'Boolean',
      name: 'isRecievable',
      documentation: `
      Determines is we check the user's ability to pay(false) or the payer's ablility to pay(true).
      `
    },
    {
      class: 'Boolean',
      name: 'response',
      documentation: `
        The server will set this to true when you put it if the user can
        receive the currency.
      `
    },
    {
      class: 'String',
      name: 'message',
      documentation: `
        Response message to the client.
      `
    },
    {
      class: 'Long',
      name: 'accountChoice'
    }
  ]
});
