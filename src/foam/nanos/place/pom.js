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
      name: "google/GooglePlaceService",
      flags: "java" 
    },
    { 
      name: "google/GooglePlaceServiceConfigure",
      flags: "js|java" 
    },
    { 
      name: "PlaceDetailResp",
      flags: "js|java" 
    },
    { 
      name: "PlaceDetailResult",
      flags: "js|java" 
    },
    { 
      name: "PlaceDetailAddressComponent",
      flags: "js|java" 
    },
    { 
      name: "PlaceAutocompleteResp",
      flags: "js|java" 
    },
    { 
      name: "PlaceAutocompletePrediction",
      flags: "js|java" 
    }
  ],
})