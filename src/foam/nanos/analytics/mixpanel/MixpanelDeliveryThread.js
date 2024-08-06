/**
 * @license
 * Copyright 2024 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.analytics.mixpanel',
  name: 'MixpanelDeliveryThread',

  documentation: `
    poll from queue maintained my mixpanelservice every 30 seconds
    and send message to mixpanel in batch
  `,

  implements: [
    'foam.nanos.NanoService'
  ],

  javaImports: [
    'com.mixpanel.mixpanelapi.ClientDelivery',
    'com.mixpanel.mixpanelapi.MixpanelAPI',

    'foam.core.X',
    'foam.nanos.logger.Loggers',

    'java.io.IOException',
    'org.json.JSONObject'
  ],

  properties: [
    {
      class: 'String',
      name: 'projectToken'
    },
    {
      class: 'Object',
      name: 'mixpanel',
      javaType: 'MixpanelAPI',
      javaFactory: `
        return new MixpanelAPI();
      `
    }
  ],

  constants: [
    {
      name: 'SLEEP_TIME_MILLIS',
      javaType: 'int',
      value: 30000
    }
  ],

  methods: [
    {
      name: 'start',
      javaCode: `
        X x = foam.core.XLocator.get();
        Loggers.logger(x, this).info("start");

        try {
          while(true) {
            ClientDelivery clientDelivery = new ClientDelivery();
            int messageCount = 0;
            JSONObject message = null;
            do {
              message = ((MixpanelService) x.get("mixpanelService")).getDeliveryQueue().poll();
              if (message != null) {
                if ( clientDelivery.isValidMessage(message) ) {
                  messageCount = messageCount + 1;
                  clientDelivery.addMessage(message);
                } else {
                  Loggers.logger(x, this).error("Invalid mixpanel message:", message.toString());
                }
              }
            } while(message != null);

            getMixpanel().deliver(clientDelivery);

            Loggers.logger(x, this).info("Sent " + messageCount + " messages.");
            Thread.sleep(SLEEP_TIME_MILLIS);
          }
        } catch (IOException e) {
          Loggers.logger(x, this).error("Can't communicate with Mixpanel.", e.getMessage());
          throw e;
        } catch (InterruptedException e) {
          Loggers.logger(x, this).error("Message process interrupted");
        } finally {
        }
      `
    }
  ]
});