/**
 * @license
 * Copyright 2024 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.place.model',
  name: 'PlaceDetailAddressComponent',

  properties: [
    {
      class: 'String',
      shortName: 'long_name',
      name: 'longName'
    },
    {
      class: 'String',
      shortName: 'short_name',
      name: 'shortName'
    },
    {
      class: 'StringArray',
      name: 'types'
    }
  ]
})