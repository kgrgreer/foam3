/**
 * @license
 * Copyright 2024 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.analytics.mixpanel',
  name: 'AddMixpanelUserProperty',
  implements: [ 'foam.nanos.ruler.RuleAction' ],
  documentation: `
    When a specified user property has been set, add the user property to its
    corresponding mixpanel profile.
  `,

  javaImports: [
    'com.mixpanel.mixpanelapi.MessageBuilder',
    'com.mixpanel.mixpanelapi.MixpanelAPI',
    'foam.core.ContextAgent',
    'foam.core.PropertyInfo',
    'foam.core.X',
    'foam.nanos.auth.AuthService',
    'foam.nanos.auth.User',
    'foam.nanos.logger.Loggers',
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

  properties: [
    {
      class: 'Array',
      of: 'PropertyInfo',
      name: 'userProp'
    },
    {
      class: 'String',
      name: 'mixpanelUserProp'
    }
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        agency.submit(x, new ContextAgent() {
          @Override
          public void execute(X x) {
            User user = (User) obj;
            String trackingId = user.getTrackingId();

            MessageBuilder messageBuilder = new MessageBuilder(PROJECT_TOKEN);
            MixpanelAPI mixpanel = new MixpanelAPI();

            // create user profile
            AuthService auth = (AuthService) x.get("auth");
            var isAdmin = user != null
                && (user.getId() == User.SYSTEM_USER_ID
                || user.getGroup().equals("admin")
                || user.getGroup().equals("system"));
            var isAnonymous = user != null && auth.isUserAnonymous(x, user.getId());

            if ( ! isAdmin && ! isAnonymous ) {
              JSONObject userProps = new JSONObject();
              userProps.put(getMixpanelUserProp(), getProp(x, user));
              JSONObject updateProfile = messageBuilder.set(trackingId, userProps);

              try {
                mixpanel.sendMessage(updateProfile);
              } catch (IOException e) {
                Loggers.logger(x, this).error("Failed sending user data:", user.getId(), "Can't communicate with Mixpanel");
              }
            }
          }
        }, "Update Mixpanel user property");
      `
    },
    {
      name: 'getProp',
      args: 'X x, User user',
      javaType: 'String',
      javaCode: `
        Object ret = (Object) user;
        for ( int i = 0; i < this.getUserProp().length; i++ ) {
          ret = (Object) ((PropertyInfo) this.getUserProp()[i]).f(ret);
        }
        return ret.toString();
      `
    }
  ]
});
