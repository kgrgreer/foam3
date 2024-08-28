/**
 * @license
 * Copyright 2024 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.place.model',
  name: 'PlaceDetail',

  properties: [
    {
      class: 'String',
      name: 'address1'
    },
    {
      class: 'String',
      name: 'address2'
    },
    {
      class: 'String',
      name: 'city'
    },
    {
      class: 'String',
      name: 'region'
    },
    {
      class: 'String',
      name: 'country'
    },
    {
      class: 'String',
      name: 'postalCode'
    }
  ]
})