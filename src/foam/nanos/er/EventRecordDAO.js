/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.er',
  name: 'EventRecordDAO',
  extends: 'foam.dao.ProxyDAO',

  javaImports: [
    'foam.nanos.logger.Logger',
    'foam.nanos.logger.Loggers',
    'foam.nanos.om.OMLogger'
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
        Logger logger = (Logger) x.get("logger");
        EventRecord er = (EventRecord) getDelegate().put_(x, obj);
        var summary = er.toSummary();
        try {
          er = (EventRecord) getDelegate().put_(x, obj);
        } catch (Throwable t) {
          Loggers.logger(x, this).error(t);
        }

        if ( er.getException() != null ) {
          logger.log(er.getSeverity(), summary, (Exception) er.getException());
        } else {
          logger.log(er.getSeverity(), summary);
        }

        ((OMLogger) x.get("OMLogger")).log(summary);

        return er;
      `
    }
  ]
});
