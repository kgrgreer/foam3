/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

// Server side OM reporting on how many times an analytic event fires
foam.CLASS({
  package: 'foam.nanos.analytics',
  name: 'AnalyticEventOMDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: 'Create OM each on event',

  javaImports: [
    'foam.nanos.om.OMLogger'
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
      AnalyticEvent event = (AnalyticEvent) getDelegate().put_(x, obj);
      ((OMLogger) x.get("OMLogger")).log("analytic.event", event.getName());
      return event;
      `
    }
  ]
});
