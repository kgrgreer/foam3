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
    'org.apache.http.impl.client.HttpClients',
    'org.apache.http.client.utils.URIBuilder',
    'java.util.Arrays',
    'java.util.ArrayList',
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
      args: 'Context x, PlaceAutocompleteReq req',
      type: 'PlaceAutocompleteResp',
      async: true,
      javaCode: `
        var ret = new PlaceAutocompleteResp();
        try {
          var config = getConfigure(x);
          var input = req.getAddress1() +  ", " + req.getAddress2() + ", " + req.getCity() + ", " + req.getRegion() + ", " + req.getCountry() + ", " + req.getPostalCode();

          var uri = new URIBuilder("https://maps.googleapis.com/maps/api/place/autocomplete/json")
                      .addParameter("input", input)
                      .addParameter("key", config.getApiKey());

          HttpGet request = new HttpGet(uri.toString());

          try (CloseableHttpClient httpClient = HttpClients.createDefault();
              CloseableHttpResponse response = httpClient.execute(request)) {

            HttpEntity entity = response.getEntity();
            if (entity != null) {
                String rawResponse = EntityUtils.toString(entity);
            }

          }
        } catch ( Exception e ) {
          Loggers.logger(x, this).error("placeAutocomplete", e);
        }

        return ret;
      `
    }
  ]
})