/**
 * @license
 * Copyright 2024 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.place.google',
  name: 'GooglePlaceService',
  documentation: `
    Implement PlaceService using Google Place Service API.
  `,

  implements: [
    'foam.nanos.place.PlaceService'
  ],

  javaImports: [
    'foam.dao.DAO',
    'foam.nanos.session.Session',
    'foam.nanos.pm.PM',
    'static foam.mlang.MLang.EQ',
    'foam.nanos.logger.Loggers',
    'foam.nanos.place.model.*',
    'org.apache.http.client.utils.URIBuilder',
    'java.util.Arrays',
    'java.util.ArrayList',
    'foam.lib.json.JSONParser',
    'org.apache.http.HttpEntity',
    'org.apache.http.HttpHeaders',
    'org.apache.http.client.methods.CloseableHttpResponse',
    'org.apache.http.client.methods.HttpGet',
    'org.apache.http.impl.client.CloseableHttpClient',
    'org.apache.http.impl.client.HttpClients',
    'org.apache.http.util.EntityUtils',
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
      async: true,
      args: 'Context x, String input, String preferCountry',
      type: 'foam.nanos.place.model.PlaceAutocompleteResp',
      javaCode: `
        var pm = PM.create(x, "GooglePlaceService_placeAutocomplete");
        Session session = x.get(Session.class);
        var ret = new PlaceAutocompleteResp();
        try {
          var config = getConfigure(x);
          var countries = config.getPlaceAutocompleteRegionCodes().clone();
          var validCountries = Arrays.asList(countries);
          if ( preferCountry != null ) {
            preferCountry = preferCountry.toLowerCase();
            if ( validCountries.contains(preferCountry) )
              countries = new String[]{preferCountry};
          }
          for (int i = 0; i < countries.length; i++) {
            countries[i] = "country:" + countries[i]; 
          }
          Loggers.logger(x, this).debug("placeAutocomplete url2", Arrays.asList(countries));
          var uri = new URIBuilder("https://maps.googleapis.com/maps/api/place/autocomplete/json")
                      .addParameter("input", input)
                      .addParameter("language", "en")
                      .addParameter("components", String.join("|", countries))
                      .addParameter("types", String.join("|", config.getPlaceAutocompleteTypes()))
                      .addParameter("sessiontoken", session != null ? session.getId() : "")
                      .addParameter("key", config.getApiKey());

          Loggers.logger(x, this).debug("placeAutocomplete url", uri.toString());
          HttpGet request = new HttpGet(uri.toString());

          try (CloseableHttpClient httpClient = HttpClients.createDefault();
              CloseableHttpResponse response = httpClient.execute(request)) {

            HttpEntity entity = response.getEntity();
            if (entity != null) {
                String rawResponse = EntityUtils.toString(entity);
                JSONParser jsonParser = x.create(JSONParser.class);
                var resp = (PlaceAutocompleteResp) jsonParser.parseString(rawResponse, PlaceAutocompleteResp.class);
                if ( resp == null ) {
                  throw new RuntimeException("json parse error with \`" +rawResponse + "\`");
                }
                ret = resp;
            }

          }
        } catch ( Exception e ) {
          Loggers.logger(x, this).error("placeAutocomplete", e);
        } finally {
          pm.log(getX());
        }

        return ret;
      `
    },
    {
      // Maybe replace with the geocoding api as it is cheaper 
      // https://developers.google.com/maps/documentation/places/web-service/autocomplete#cost_best_practices
      name: 'placeDetail',
      async: true,
      args: 'Context x, String placeId',
      type: 'PlaceDetailResp',
      javaCode: `
        var pm = PM.create(x, "GooglePlaceService_placeDetail");
        var ret = new PlaceDetailResp();
        Session session = x.get(Session.class);
        try {
          var config = getConfigure(x);

          var uri = new URIBuilder("https://maps.googleapis.com/maps/api/place/details/json")
                      .addParameter("language", "en")
                      .addParameter("place_id", placeId)
                      .addParameter("sessiontoken", session != null ? session.getId() : "")
                      .addParameter("fields", String.join(",", config.getPlaceDetailFields()))
                      .addParameter("key", config.getApiKey());

          Loggers.logger(x, this).debug("placeDetail url", uri.toString());
          HttpGet request = new HttpGet(uri.toString());

          try (CloseableHttpClient httpClient = HttpClients.createDefault();
              CloseableHttpResponse response = httpClient.execute(request)) {

            HttpEntity entity = response.getEntity();
            if (entity != null) {
                String rawResponse = EntityUtils.toString(entity);
                JSONParser jsonParser = x.create(JSONParser.class);
                var resp = (PlaceDetailResp) jsonParser.parseString(rawResponse, PlaceDetailResp.class);
                if ( resp == null ) {
                  throw new RuntimeException("json parse error with \`" +rawResponse + "\`");
                }
                ret = resp;
            }

          }
        } catch ( Exception e ) {
          Loggers.logger(x, this).error("placeAutocomplete", e);
        } finally {
          pm.log(getX());
        }

        return ret;
      `
    }
  ]
})