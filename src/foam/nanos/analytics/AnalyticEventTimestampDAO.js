/**
 * @license
 * Copyright 2023 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

// server side delegate that sets the timestamp on an event
// why is it updating an existing event?

foam.CLASS({
  package: 'foam.nanos.analytics',
  name: 'AnalyticEventTimestampDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: 'Set analytics event timestamp',

  javaImports: [
    'java.util.Date'
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
        var event = (AnalyticEvent) obj;
        var old = (AnalyticEvent) getDelegate().find_(x, obj);

        if ( old != null )
          event.setTimestamp(old.getTimestamp());
        else if ( event.getTimestamp() == null )
          event.setTimestamp(new Date());

        return getDelegate().put_(x, event);
      `
    }
  ]
});
