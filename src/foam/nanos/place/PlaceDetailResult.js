/**
* @license
* Copyright 2024 The FOAM Authors. All Rights Reserved.
* http://www.apache.org/licenses/LICENSE-2.0
*/

foam.CLASS({
  package: 'foam.nanos.place',
  name: 'PlaceDetailResult',
  
  properties: [
    {
      name: "formattedAddress",
      shortName: "formatted_address",
      class: "String"
    },
    {
      name: "addressComponents",
      shortName: 'address_components',
      class: "FObjectArray",
      of: "foam.nanos.place.PlaceDetailAddressComponent"
    }
  ]
})