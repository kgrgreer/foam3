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
    'foam.util.SafetyUtil',
    'foam.util.geo.GeolocationSupport',

    'java.io.IOException',
    'java.util.Iterator',

    'org.json.JSONException',
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
            JSONObject props = new JSONObject(event.toJSON());
            props.put("$event_id", event.getId());
            props.put("time", event.getTimestamp());
            props.put("$os", event.getUserAgent());
            props.put("$ip", event.getIp());

            // add event extras
            JSONObject eventExtras;
            try {
              eventExtras = new JSONObject(event.getExtra());
              Iterator<String> keys = eventExtras.keys();
              while(keys.hasNext()) {
                String key = keys.next();
                props.put(key, eventExtras.get(key));
              }
            } catch ( JSONException e) {
              eventExtras = new JSONObject();
              props.put("$event_extra", event.getExtra());
            }

            GeolocationSupport location = GeolocationSupport.instance();
            props.put("mp_country_code", location.getCountry());
            props.put("$city", location.getCity());

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
    }
  ]
});