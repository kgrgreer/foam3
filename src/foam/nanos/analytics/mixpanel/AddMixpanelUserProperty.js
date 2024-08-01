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
    'foam.core.ContextAgent',
    'foam.core.PropertyInfo',
    'foam.core.X',
    'foam.nanos.auth.User',
    'org.json.JSONObject'
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

            JSONObject userProps = new JSONObject();
            userProps.put(getMixpanelUserProp(), getProp(x, user));

            ((MixpanelService) x.get("mixpanelService")).sendUserProperties(x, user, userProps);
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
