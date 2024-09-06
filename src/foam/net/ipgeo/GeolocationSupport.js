/**
 * @license
 * Copyright 2024 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.net.ipgeo',
  name: 'GeolocationSupport',

  documentation: 'Geolocation support methods',

  javaImports: [
    'com.maxmind.geoip2.DatabaseReader',
    'com.maxmind.geoip2.exception.GeoIp2Exception',
    'com.maxmind.geoip2.model.CityResponse',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.fs.ResourceStorage',
    'foam.nanos.fs.Storage',
    'foam.nanos.logger.Loggers',
    'foam.net.IPSupport',
    'foam.net.ipgeo.IPGeolocationInfo',
    'foam.util.SafetyUtil',
    'java.io.File',
    'java.io.IOException',
    'java.net.InetAddress',
    'java.net.UnknownHostException',
  ],

  properties: [
    {
      class: 'Object',
      javaType: 'IPGeolocationInfo',
      name: 'ipGeolocationInfo'
    },
    {
      class: 'Object',
      javaType: 'DatabaseReader',
      name: 'dbReader'
    }
  ],

  javaCode: `
    private final static GeolocationSupport instance__ = new GeolocationSupport();
    public static GeolocationSupport instance() {
      var ret = instance__;
      X x = foam.core.XLocator.get();

      // Load database
      if ( ret.getDbReader() == null ) {
        if ( ! SafetyUtil.isEmpty(System.getProperty("resource.journals.dir")) ) {
          x = x.put(Storage.class, new ResourceStorage(System.getProperty("resource.journals.dir")));
        }

        var database = x.get(Storage.class).getInputStream("GeoLite2-City/GeoLite2-City.mmdb");
        try {
          ret.setDbReader(new DatabaseReader.Builder(database).build());
        } catch ( Exception e ) {
          Loggers.logger(x).error("GeolocationSupport", "Failed to load location db", e);
        }
      }

      resolveLocation(x, ret);
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
      name: 'resolveLocation',
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
          if ( support.getDbReader() != null ) {
            try {
              CityResponse response = support.getDbReader().city(ip);
              if ( response == null ) {
                Loggers.logger(x).warning("GeolocationSupport", "Cannot find location", ip);
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
            } catch (IOException e) {
              Loggers.logger(x).error("GeolocationSupport", "Failed reading location db", e);
            } catch (GeoIp2Exception e) {
              Loggers.logger(x).error("GeolocationSupport", "Failed getting location response", "GeoIp2Exception", e.getMessage());
            }
          }
        } catch (UnknownHostException e) {
          Loggers.logger(x).error("GeolocationSupport", "Failed getting ip", "UnknownHostException", e.getMessage());
        }
      `
    }
  ]
});
