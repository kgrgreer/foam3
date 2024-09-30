/**
 * @license
 * Copyright 2024 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.place.google',
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
        Client can pass in a preferred country to narrow down to but that country must be present here otherwise it is ignored
        See: https://developers.google.com/maps/documentation/places/web-service/autocomplete#components
      `,
      javaFactory: `
        return new String[]{
          "ca", "pk"
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
          "address"
        };
      `
    },
    {
      class: 'StringArray',
      name: 'placeDetailFields',
      documentation: `
        Cost saving.
        Fields are divided into three billing categories: Basic, Contact, and Atmosphere. 
        See: https://developers.google.com/maps/documentation/places/web-service/details#fields
      `,
      javaFactory: `
        return new String[]{
          "address_components", "formatted_address"
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