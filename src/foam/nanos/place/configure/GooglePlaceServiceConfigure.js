/**
 * @license
 * Copyright 2024 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.place.configure',
  name: 'GooglePlaceServiceConfigure',

  properties: [
    {
      class: 'String',
      name: 'id'
    },
    {
      class: 'String',
      name: 'apiKey',
      documentation: `API_KEY for your google place service`
    },
    {
      class: 'Int',
      name: 'maxPlaceAutocompleteLength',
      documentation: `
        The return length of placeAutocomplete service.
      `
    },
    {
      class: 'StringArray',
      name: 'placeAutocompleteRegionCodes',
      documentation: `
        A grouping of places to which you would like to restrict your results
        See: https://developers.google.com/maps/documentation/places/web-service/autocomplete#components
      `,
      javaFactory: `
        return new String[]{
          "country:ca", "country:pk"
        };
      `
    },
    {
      class: 'StringArray',
      name: 'placeAutocompleteTypes',
      documentation: `
        You can restrict results from a Place Autocomplete request to be of a certain type.
        See: https://developers.google.com/maps/documentation/places/web-service/autocomplete#types
        for more options.
        In our case, we mostly use the API for address completion to the customer home, so see
        https://developers.google.com/maps/documentation/geocoding/requests-geocoding#Types
      `,
      javaFactory: `
        return new String[]{
          "postal_code", "street_number", "route", "room", "locality"
        };
      `
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.ServiceProvider',
      name: 'spid'
    },
    {
      class: 'Boolean',
      name: 'isEnable',
      value: false
    }
  ]
})