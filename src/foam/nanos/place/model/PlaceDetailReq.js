/**
 * @license
 * Copyright 2024 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.place.model',
  name: 'PlaceDetailReq',
  documentation: `
    Model that using by 'placeAutocomplete' method in PlaceService 
  `,

  properties: [
    {
      class: 'String',
      name: 'sessionToken'
    },
    {
      class: 'String',
      name: 'placeId'
    }
  ]
})