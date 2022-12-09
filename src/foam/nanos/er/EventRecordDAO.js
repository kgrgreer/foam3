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
    'foam.nanos.logger.Loggers'
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
        Logger logger = (Logger) x.get("logger");
        EventRecord er = (EventRecord) obj;
        try {
          er = (EventRecord) getDelegate().put_(x, obj);
        } catch (Throwable t) {
          Loggers.logger(x, this).error(t);
        }
        // TODO: add to Logger ability to pass severity
        switch ( er.getSeverity().getOrdinal() ) {
          case 3 :
            if ( er.getException() != null ) {
              logger.error(er.toSummary(), (Exception) er.getException());
            } else {
              logger.error(er.toSummary());
            }
            break;
          case 2 :
            if ( er.getException() != null ) {
              logger.warning(er.toSummary(), (Exception) er.getException());
            } else {
              logger.warning(er.toSummary());
            }
            break;
          case 1 :
            if ( er.getException() != null ) {
              logger.info(er.toSummary(), (Exception) er.getException());
            } else {
              logger.info(er.toSummary());
            }
            break;
          default :
            if ( er.getException() != null ) {
              logger.debug(er.toSummary(), (Exception) er.getException());
            } else {
              logger.debug(er.toSummary());
            }
        }
        return er;
      `
    }
  ]
});
