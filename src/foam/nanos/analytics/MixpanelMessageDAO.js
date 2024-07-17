/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.analytics',
  name: 'MixpanelMessageDAO',
  extends: 'foam.dao.ProxyDAO',

  javaImports: [
    'com.mixpanel.mixpanelapi.ClientDelivery',
    'com.mixpanel.mixpanelapi.MessageBuilder',
    'com.mixpanel.mixpanelapi.MixpanelAPI',

    'foam.dao.DAO',
    'foam.nanos.logger.Loggers',
    'foam.nanos.session.Session',

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
        Session session = (Session) ((DAO) x.get("sessionDAO")).find(event.getSessionId());

        MessageBuilder messageBuilder = new MessageBuilder(this.PROJECT_TOKEN);
        JSONObject props = new JSONObject(event.toJSON());
        JSONObject sentEvent = messageBuilder.event(session.getId(), event.getName(), props);

        ClientDelivery delivery = new ClientDelivery();
        delivery.addMessage(sentEvent);

        try {
          MixpanelAPI mixpanel = new MixpanelAPI();
          mixpanel.deliver(delivery);
        } catch (IOException e) {
          Loggers.logger(x, this).error("Failed sending analyticEvent:", event.getId(), "Can't communicate with Mixpanel");
        }
        return event;
      `
    }
  ]
});