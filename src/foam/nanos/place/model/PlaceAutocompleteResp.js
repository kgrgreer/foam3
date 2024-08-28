/**
 * @license
 * Copyright 2024 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.place.model',
  name: 'PlaceAutocompleteResp',
  documentation: `
    Model that using by 'placeAutocomplete' method in PlaceService 
  `,

  properties: [
		{
			name: "predictions",
      shortName: 'predictions',
			class: "FObjectArray",
			of: "foam.nanos.place.model.Prediction"
		}
  ]
})