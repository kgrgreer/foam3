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
  package: 'net.nanopay.account',
  name: 'DigitalAccountServiceInterface',

  methods: [
    {
      name: 'findDefault',
      async: true,
      type: 'net.nanopay.account.DigitalAccount',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'denomination',
          type: 'String'
        },
        {
          name: 'trustAccount',
          type: 'String'
        },
      ]
    },
    {
      name: 'createDefaults',
      async: true,
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'denomination',
          type: 'String'
        },
        {
          name: 'trustAccounts',
          type: 'String[]'
        },
      ]
    }
  ]
});
