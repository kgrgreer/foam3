/**
 * @license
 * Copyright 2024 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.util',
  name: 'GeolocationSupport',

  documentation: 'Geolocation support methods',

  javaImports: [
    'com.maxmind.geoip2.DatabaseReader',
    'com.maxmind.geoip2.exception.GeoIp2Exception',
    'com.maxmind.geoip2.model.CityResponse',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.logger.Loggers',
    'java.io.File',
    'java.io.IOException',
    'java.net.InetAddress',
    'java.net.UnknownHostException',
  ],

  properties: [
    {
      class: 'Object',
      javaType: 'CityResponse',
      name: 'cityResponse',
    }
  ],

  javaCode: `
    private final static GeolocationSupport instance__ = new GeolocationSupport();
    public static GeolocationSupport instance() {
      var ret = instance__;
      init(foam.core.XLocator.get(), ret);
      return ret;
    }
  `,

  methods: [
    {
      name: 'getCity',
      javaType: 'String',
      javaCode: `
        return getCityResponse().getCity().getNames().get("en");
      `
    },
    {
      name: 'getCountry',
      javaType: 'String',
      javaCode: `
        return getCityResponse().getCountry().getIsoCode();
      `
    },
    {
      name: 'getPostalCode',
      javaType: 'String',
      javaCode: `
        return getCityResponse().getPostal().getCode();
      `
    }
    
  ],

  static: [
    {
      name: 'init',
      static: true,
      visibility: 'private',
      args: 'X x, GeolocationSupport support',
      javaCode: `
        try {
          var ipStr = IPSupport.instance().getRemoteIp(x);
          var ip = InetAddress.getByName(ipStr);
          File database = new File("./foam3/GeoLite2-City/GeoLite2-City.mmdb");
          try {
            DatabaseReader dbReader = new DatabaseReader.Builder(database).build();
            try {
              CityResponse response = dbReader.city(ip);
              if ( response == null ) {
                Loggers.logger(x).error("GeolocationSupport", "Cannot find location");
                return;
              }
              support.setCityResponse(response);
            } catch (GeoIp2Exception e) {
              Loggers.logger(x).error("GeolocationSupport", "Failed getting location response", "GeoIp2Exception", e.getMessage());
            }
          } catch (IOException e) {
            Loggers.logger(x).error("GeolocationSupport", "Failed reading location db", "IOException", e.getMessage());
          }
        } catch (UnknownHostException e) {
          Loggers.logger(x).error("GeolocationSupport", "Failed getting ip", "UnknownHostException", e.getMessage());
        }
      `
    }
  ]
});
