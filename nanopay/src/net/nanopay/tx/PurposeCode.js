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
  package: 'net.nanopay.tx',
  name: 'PurposeCode',
  documentation: 'Purpose code for payments',

  ids: ['code'],

  properties: [
    {
      class: 'Reference',
      of: 'net.nanopay.tx.PurposeGroup',
      name: 'group'
    },
    {
      class: 'String',
      name: 'code',
      validateObj: function(code) {
        var regex = /^[PS][0-9]{4}$/;
        if ( ! regex.test(code) ) {
          return 'Please enter a purpose code.';
        }
      }
    },
    {
      class: 'String',
      name: 'description'
    },
    {
      class: 'Boolean',
      name: 'send',
      documentation: 'Whether purpose code is used in sending / receiving payment'
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.Country',
      name: 'country'
    },
    {
      class: 'Int',
      name: 'order',
      documentation: 'Used to order the list.'
    }
  ]
});
