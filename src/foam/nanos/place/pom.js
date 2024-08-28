/**
 * @license
 * Copyright 2024 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.POM({
  name: "place",

  files: [
    { 
      name: "PlaceService",
      flags: "js|java" 
    },
    { 
      name: "ClientPlaceService",
      flags: "js" 
    },
    { 
      name: "GooglePlaceService",
      flags: "java" 
    },
    { 
      name: "configure/GooglePlaceServiceConfigure",
      flags: "js|java" 
    },
    { 
      name: "model/PlaceDetail",
      flags: "js|java" 
    },
    { 
      name: "model/PlaceDetailReq",
      flags: "js|java" 
    },
    { 
      name: "model/PlaceAutocomplete",
      flags: "js|java" 
    },
    { 
      name: "model/PlaceAutocompleteItem",
      flags: "js|java" 
    },
    { 
      name: "model/PlaceAutocompleteReq",
      flags: "js|java" 
    },
  ],

  javaDependencies: [
    'com.google.maps:google-maps-places:0.11.0',
  ],
})