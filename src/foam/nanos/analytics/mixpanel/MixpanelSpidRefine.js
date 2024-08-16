/**
 * @license
 * Copyright 2024 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.analytics.mixpanel',
  name: 'MixpanelSpidRefine',
  refines: 'foam.nanos.auth.ServiceProvider',

  properties: [
    {
      class: 'StringArray',
      name: 'mixpanelWhitelist',
      documentation: 'list of whitelisted analyticevents to send to mixpanel'
    }
  ]
});
