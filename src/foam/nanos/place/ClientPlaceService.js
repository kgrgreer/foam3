/**
 * @license
 * Copyright 2024 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.place',
  name: 'ClientPlaceService',

  implements: [
    'foam.nanos.place.PlaceService'
  ],

  properties: [
    {
      class: 'Stub',
      of: 'foam.nanos.place.PlaceService',
      name: 'delegate'
    }
  ]
});
