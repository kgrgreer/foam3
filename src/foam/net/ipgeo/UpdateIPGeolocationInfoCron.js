/**
 * @license
 * Copyright 2024 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.net.ipgeo',
  name: 'UpdateIPGeolocationInfoCron',
  implements: [ 'foam.core.ContextAgent' ],
  documentation: 'Update DAO with new data from Maxmind every Tuesday and Friday.',

  javaImports: [
    'com.maxmind.geoip2.DatabaseReader',
    'com.maxmind.geoip2.exception.GeoIp2Exception',
    'com.maxmind.geoip2.model.CityResponse',
    'foam.core.ContextAgent',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.nanos.logger.Loggers',
    'java.io.IOException',
    'java.net.InetAddress',
    'java.net.UnknownHostException',
    'java.util.List'
  ],
  methods: [
    {
      name: 'execute',
      args: 'Context x',
      javaCode: `
        DAO infoDAO = (DAO) x.get("ipGeolocationInfoDAO");
        DatabaseReader dbReader = GeolocationSupport.instance().getDbReader();

        if ( dbReader == null ) 
          Loggers.logger(x).error("Failed to update ipGeolocationInfoDAO : cannot read location db");

        List<IPGeolocationInfo> infoList = (List<IPGeolocationInfo>) ((ArraySink) infoDAO.select(new ArraySink())).getArray();
        for ( IPGeolocationInfo info : infoList ) {
          try {
            var ip = InetAddress.getByName(info.getIp());
            CityResponse response = dbReader.city(ip);

            if ( response == null ) {
              Loggers.logger(x).warning("GeolocationSupport", "Cannot find location for", ip, "removing entry from dao");
              infoDAO.remove_(x, info);
            }
            info.setCity(response.getCity().getNames().get("en"));
            info.setPostalCode(response.getPostal().getCode());
            info.setCountry(response.getCountry().getIsoCode());
            infoDAO.put_(x, info);
          } catch (IOException e) {
            Loggers.logger(x).error("UpdateIPGeolocationInfoCron", "Failed reading location db for", info.getIp(), e);
          } catch (GeoIp2Exception e) {
            Loggers.logger(x).error("UpdateIPGeolocationInfoCron", "Failed getting location response for", info.getIp(), "GeoIp2Exception", e.getMessage());
          }
        }
        
      `
    }
  ]
});