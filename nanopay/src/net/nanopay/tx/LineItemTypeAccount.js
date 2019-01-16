/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'LineItemTypeAccount',
  implements: ['foam.nanos.auth.EnabledAware'],

  documentation: 'Payee, LineItemType, Deposit Account association',

  properties: [
    {
      class: 'String',
      name: 'id',
      visibility: foam.u2.Visibility.RO
    },
    {
      class: 'Boolean',
      name: 'enabled',
      value: true
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'user',
      required: true
    },
    {
      class: 'Reference',
      of: 'net.nanopay.tx.LineItemType',
      name: 'type',
      required: true
    },
    {
      class: 'Reference',
      of: 'net.nanopay.account.Account',
      name: 'account',
      required: true
    },
    {
      class: 'String',
      name: 'description',
      documentation: 'Description of service or good.'
    }
  ]
});
