/**
 * @license
 * Copyright 2024 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.place.model',
  name: 'PlaceAutocompleteItem',
  documentation: `
    Model hold info from Google place autocomplete response.
  `,

  properties: [
    {
      class: 'String',
      name: 'description'
    },
    {
      class: 'String',
      name: 'placeId'
    }
  ]
})