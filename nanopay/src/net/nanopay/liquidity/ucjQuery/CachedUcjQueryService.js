/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'net.nanopay.liquidity.ucjQuery',
  name: 'CachedUcjQueryService',

  documentation: 'A cached implementation of the UcjQueryService interface.',

  properties: [
    {
      class: 'Map',
      name: 'cache'
    },
    {
      class: 'Int',
      name: 'ttl',
      value: 5000
    }
  ],
});
