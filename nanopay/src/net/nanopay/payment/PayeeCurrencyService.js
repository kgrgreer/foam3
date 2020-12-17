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

foam.INTERFACE({
  package: 'net.nanopay.payment',
  name: 'PayeeCurrencyService',

  documentation: `
    Returns a list of currencies that a user can send to based on their contact list.
    Also provides all currencies a contact is capable of receiving.
  `,

  methods: [
    {
      name: 'query',
      async: true,
      type: 'List',
      args: [
        {
          type: 'Context',
          name: 'x'
        }
      ]
    },
    {
      name: 'queryContact',
      async: true,
      type: 'List',
      args: [
        {
          type: 'Context',
          name: 'x'
        },
        {
          name: 'contactId',
          documentation: `contact to check receivable currencies.`
        }
      ]
    }
  ]
});
