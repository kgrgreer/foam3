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
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.nanos.analytics.AnalyticEvent',
    'foam.util.geo.GeolocationSupport',
    'java.util.Iterator',
    'org.json.JSONException',
    'org.json.JSONObject'
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        agency.submit(x, new ContextAgent() {
          @Override
          public void execute(X x) {
            AnalyticEvent event = (AnalyticEvent) obj;
    
            // build message
            JSONObject props = new JSONObject();
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
            ((MixpanelService) x.get("mixpanelService")).sendMixpanelEvent(x, event, props);
          }
        }, "Send message to mixpanel");
      `
    }
  ]
});