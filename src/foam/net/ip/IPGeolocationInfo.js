/**
 * @license
 * Copyright 2024 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */


foam.CLASS({
  package: 'foam.net.ip',
  name: 'IPGeolocationInfo',
  ids: ['ip'],

  properties: [
    {
      class: 'String',
      name: 'ip'
    },
    {
      class: 'String',
      name: 'city',
      documentation: `City related to IP Address`
    },
    {
      class: 'String',
      name: 'country',
      documentation: `Country name associated to IP Address`
    },
    {
      class: 'String',
      name: 'postalCode',
      documentation: `postalCode associated to IP Address`
    }
  ]
});