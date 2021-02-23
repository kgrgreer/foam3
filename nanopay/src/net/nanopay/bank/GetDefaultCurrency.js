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
    name: 'GetDefaultCurrency',
  
    documentation: 'A request to GetDefaultCurrencyDAO.',
  
    properties: [
      { 
        class: 'Long',
        name: 'contactId',
        documentation: `
          The DAO will find the contact associated to the given contact id
          and search the contact's verified bank accounts to return a default
          currency for payments to the contact.
        `,
        required: true
      },
      {
        class: 'String',
        name: 'response',
        documentation: `
          The server will set this to the denomination of the contact's verified
          bank account.
        `
      },
    ]
  });
  