/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */
 foam.CLASS({
  package: 'net.nanopay.fx',
  name: 'SecurityPrice',

  documentation: 'Exchange rate information pertaining to security and currencies',
  ids: ['security','currency'],

  properties: [
    {
      class: 'Reference',
      of: 'net.nanopay.exchangeable.Security',
      name: 'security'
    },
    {
      class: 'Reference',
      of: 'foam.core.Currency',
      name: 'currency'
    },
    {
      class: 'Double',
      name: 'price'
    }
  ]
});
