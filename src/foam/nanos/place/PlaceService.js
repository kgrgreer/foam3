/**
 * @license
 * Copyright 2024 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.INTERFACE({
  package: 'foam.nanos.place',
  name: 'PlaceService',

  skeleton: true,

  methods: [
    {
      name: 'placeAutocomplete',
      async: true,
      args: 'Context x, foam.nanos.place.model.PlaceAutocompleteReq req',
      type: 'foam.nanos.place.model.PlaceAutocomplete',
    }
  ]
})