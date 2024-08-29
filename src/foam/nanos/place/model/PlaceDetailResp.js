/**
* @license
* Copyright 2024 The FOAM Authors. All Rights Reserved.
* http://www.apache.org/licenses/LICENSE-2.0
*/

foam.CLASS({
  package: 'foam.nanos.place.model',
  name: 'PlaceDetailResp',
  
  properties: [
    {
      name: "result",
      shortName: 'result',
      class: "FObjectProperty",
      of: "foam.nanos.place.model.PlaceDetailResult"
    }
  ]
})