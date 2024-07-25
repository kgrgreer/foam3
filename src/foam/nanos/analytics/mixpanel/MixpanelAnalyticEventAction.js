/**
 * @license
 * Copyright 2024 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.analytics.mixpanel',
  name: 'MixpanelAnalyticEventAction',
  implements: [ 'foam.nanos.ruler.RuleAction' ],
  documentation: 'Rule to send analyticEvent data to Mixpanel',

  javaImports: [
    'com.maxmind.geoip2.DatabaseReader',
    'com.maxmind.geoip2.exception.GeoIp2Exception',
    'com.maxmind.geoip2.model.CityResponse',
    'com.mixpanel.mixpanelapi.ClientDelivery',
    'com.mixpanel.mixpanelapi.MessageBuilder',
    'com.mixpanel.mixpanelapi.MixpanelAPI',

    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.analytics.AnalyticEvent',
    'foam.nanos.auth.AuthService',
    'foam.nanos.auth.User',
    'foam.nanos.logger.Loggers',
    'foam.net.IPSupport',
    'foam.util.SafetyUtil',

    'java.io.File',
    'java.io.IOException',
    'java.net.InetAddress',
    'java.net.UnknownHostException',

    'org.json.JSONObject'
  ],

  constants: [
    {
      type: 'String',
      name: 'PROJECT_TOKEN',
      value: '2cf01d4604ecf0ba8038c7034fe7851d'
    }
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        agency.submit(x, new ContextAgent() {
          @Override
          public void execute(X x) {
            AnalyticEvent event = (AnalyticEvent) obj;
            String trackingId = event.getSessionId();

            MessageBuilder messageBuilder = new MessageBuilder(PROJECT_TOKEN);
            MixpanelAPI mixpanel = new MixpanelAPI();

            // build message
            JSONObject props = new JSONObject();
            // setLocation(x, props);
            props.put("$event_id", event.getId());
            props.put("time", event.getTimestamp());
            props.put("$os", event.getUserAgent());
            props.put("$ip", event.getIp());
            props.put("$event_extras", event.getExtra());
            JSONObject sentEvent = messageBuilder.event(trackingId, event.getName(), props);

            ClientDelivery delivery = new ClientDelivery();
            delivery.addMessage(sentEvent);

            try {
              mixpanel.deliver(delivery);
            } catch (IOException e) {
              Loggers.logger(x, this).error("Failed sending analyticEvent:", event.getId(), "Can't communicate with Mixpanel");
            }
          }
        }, "Send message to mixpanel");
      `
    },
    {
      name: 'setLocation',
      args: 'X x, JSONObject props',
      javaCode: `
      try {

        var ipStr = IPSupport.instance().getRemoteIp(x);
        var ip = InetAddress.getByName(ipStr);
        File database = new File("./foam3/GeoLite2-City/GeoLite2-City.mmdb");
        try {
          DatabaseReader dbReader = new DatabaseReader.Builder(database).build();
          try {
            CityResponse response = dbReader.city(ip);
            props.put("$ip", ipStr);
            props.put("mp_country_code", response.getCountry().getIsoCode());
            props.put("$city", response.getCity().getNames().get("en"));
          } catch (GeoIp2Exception e) {
            Loggers.logger(x, this).error("Failed setting mixpanel event location", "GeoIp2Exception", e.getMessage());
          }
        } catch (IOException e) {
          Loggers.logger(x, this).error("Failed setting mixpanel event location", "IOException", e.getMessage());
        }
      } catch (UnknownHostException e) {
          Loggers.logger(x, this).error("Failed setting mixpanel event location", "UnknownHostException", e.getMessage());
      }
      `
    }
  ]
});