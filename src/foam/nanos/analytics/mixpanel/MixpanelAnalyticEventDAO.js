/**
 * @license
 * Copyright 2024 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.analytics.mixpanel',
  name: 'MixpanelAnalyticEventDAO',
  extends: 'foam.dao.ProxyDAO',
  documentation: 'Decorate AnalyticEventDAO to send event data to Mixpanel',

  javaImports: [
    'com.mixpanel.mixpanelapi.ClientDelivery',
    'com.mixpanel.mixpanelapi.MessageBuilder',
    'com.mixpanel.mixpanelapi.MixpanelAPI',

    'foam.dao.DAO',
    'foam.nanos.analytics.AnalyticEvent',
    'foam.nanos.auth.AuthService',
    'foam.nanos.auth.User',
    'foam.nanos.logger.Loggers',
    'foam.util.SafetyUtil',

    'java.io.IOException',

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
      name: 'put_',
      javaCode: `
        AnalyticEvent event = (AnalyticEvent) super.put_(x, obj);
        String trackingId = event.getSessionId();

        MessageBuilder messageBuilder = new MessageBuilder(this.PROJECT_TOKEN);
        MixpanelAPI mixpanel = new MixpanelAPI();

        // build message
        messageBuilder = new MessageBuilder(this.PROJECT_TOKEN);
        JSONObject props = new JSONObject(event.toJSON());
        JSONObject sentEvent = messageBuilder.event(trackingId, event.getName(), props);

        ClientDelivery delivery = new ClientDelivery();
        delivery.addMessage(sentEvent);

        try {
          mixpanel.deliver(delivery);
        } catch (IOException e) {
          Loggers.logger(x, this).error("Failed sending analyticEvent:", event.getId(), "Can't communicate with Mixpanel");
        }
        return event;
      `
    }
  ]
});