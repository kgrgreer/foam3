/**
 * @license
 * Copyright 2024 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.util.geo',
  name: 'GeolocationSupport',

  documentation: 'Geolocation support methods',

  javaImports: [
    'com.maxmind.geoip2.DatabaseReader',
    'com.maxmind.geoip2.exception.GeoIp2Exception',
    'com.maxmind.geoip2.model.CityResponse',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.logger.Loggers',
    'foam.net.IPSupport',
    'foam.net.ip.IPGeolocationInfo',
    'java.io.File',
    'java.io.IOException',
    'java.net.InetAddress',
    'java.net.UnknownHostException',
  ],

  properties: [
    {
      class: 'Object',
      javaType: 'IPGeolocationInfo',
      name: 'ipGeolocationInfo',
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
        return getIpGeolocationInfo() == null ? "" : getIpGeolocationInfo().getCity();
      `
    },
    {
      name: 'getCountry',
      javaType: 'String',
      javaCode: `
        return getIpGeolocationInfo() == null ? "" : getIpGeolocationInfo().getCountry();
      `
    },
    {
      name: 'getPostalCode',
      javaType: 'String',
      javaCode: `
        return getIpGeolocationInfo() == null ? "" : getIpGeolocationInfo().getPostalCode();
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
          
          // lookup ipGeolocationInfoDAO
          var ipGeolocationInfoDAO = (DAO) x.get("ipGeolocationInfoDAO");
          var info = (IPGeolocationInfo) ipGeolocationInfoDAO.find(ipStr);
          if ( info != null ) {
            support.setIpGeolocationInfo(info);
            return;
          }

          var ip = InetAddress.getByName(ipStr);
          var jrlhome = System.getenv("JOURNAL_OUT");
          File database = new File(jrlhome + "/GeoLite2-City/GeoLite2-City.mmdb");
          try {
            DatabaseReader dbReader = new DatabaseReader.Builder(database).build();
            try {
              CityResponse response = dbReader.city(ip);
              if ( response == null ) {
                Loggers.logger(x).error("GeolocationSupport", "Cannot find location");
                return;
              }
              info = new IPGeolocationInfo.Builder(x)
                .setCity(response.getCity().getNames().get("en"))
                .setPostalCode(response.getPostal().getCode())
                .setCountry(response.getCountry().getIsoCode())
                .setIp(ipStr)
                .build();
              support.setIpGeolocationInfo(info);
              ipGeolocationInfoDAO.put(info);
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
