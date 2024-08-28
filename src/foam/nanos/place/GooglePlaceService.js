/**
 * @license
 * Copyright 2024 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.place',
  name: 'GooglePlaceService',
  documentation: `
    Implement PlaceService using Google Place Service API.
  `,

  implements: [
    'foam.nanos.place.PlaceService'
  ],

  javaImports: [
    'foam.dao.DAO',
    'static foam.mlang.MLang.EQ',
    'foam.nanos.logger.Loggers',
    'foam.nanos.place.model.*',
    'foam.nanos.place.configure.GooglePlaceServiceConfigure',
    'com.google.maps.places.v1.AutocompletePlacesRequest',
    'com.google.maps.places.v1.AutocompletePlacesResponse',
    'com.google.maps.places.v1.PlacesClient',
    'java.util.Arrays',
    'java.util.ArrayList'
  ],

  methods: [
    {
      name: 'getConfigure',
      args: 'Context x',
      type: 'GooglePlaceServiceConfigure',
      javaCode: `
        var spid = x.get("spid");
        var configureDAO = (DAO) x.get("googlePlaceServiceConfigureDAO");
        var configure = (GooglePlaceServiceConfigure) configureDAO.find(EQ(GooglePlaceServiceConfigure.SPID, spid));
        if ( configure == null ) {
          throw new RuntimeException("GooglePlaceService don't find configure with spid \`" + spid + "\`");
        }
        return configure;
      `
    },
    {
      name: 'placeAutocomplete',
      args: 'Context x, PlaceAutocompleteReq req',
      type: 'PlaceAutocomplete',
      async: true,
      javaCode: `
        var ret = new PlaceAutocomplete();
        System.out.println("aaaaa");
        try (PlacesClient placesClient = PlacesClient.create()) {
          var config = getConfigure(x);
          var input = req.getAddress1() +  ", " + req.getAddress2() + ", " + req.getCity() + ", " + req.getRegion() + ", " + req.getCountry() + ", " + req.getPostalCode();
          AutocompletePlacesRequest request =
          AutocompletePlacesRequest.newBuilder()
              .setInput(input)
              // .setLocationBias(AutocompletePlacesRequest.LocationBias.newBuilder().build())
              // .setLocationRestriction(
              //     AutocompletePlacesRequest.LocationRestriction.newBuilder().build())
              .addAllIncludedPrimaryTypes(Arrays.asList(config.getPlaceAutocompleteTypes()))
              .addAllIncludedRegionCodes(Arrays.asList(config.getPlaceAutocompleteRegionCodes()))
              .setLanguageCode("en")
              .setRegionCode(req.getCountry().toUpperCase())
              // .setOrigin(LatLng.newBuilder().build())
              // .setInputOffset(1010406056)
              // .setIncludeQueryPredictions(true)
              .setSessionToken(req.getSessionToken())
              .build();
      
          AutocompletePlacesResponse response = placesClient.autocompletePlaces(request);
          var suggestions = response.getSuggestionsList();
          var items = new ArrayList<PlaceAutocompleteItem>(suggestions.size());
          for ( var suggestion : suggestions ) {
            if ( suggestion.hasPlacePrediction() ) {
              var placePrediction = suggestion.getPlacePrediction();
              var description = placePrediction.getPlace();
              if (placePrediction.hasText()) description = placePrediction.getText().getText();
              items.add(new PlaceAutocompleteItem(description, placePrediction.getPlaceId()));
            }
          }
          ret.setResults(items.toArray(new PlaceAutocompleteItem[0]));
        } catch ( Exception e ) {
          Loggers.logger(x, this).error("placeAutocomplete", e);
        }

        return ret;
      `
    }
  ]
})