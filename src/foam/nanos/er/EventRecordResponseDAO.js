/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.er',
  name: 'EventRecordResponseDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: `Add EventRecordResponse reference to EventRecord`,

  javaImports: [
    'foam.dao.DAO',
    'foam.dao.ArraySink',
    'foam.dao.Sink',
    'foam.log.LogLevel',
    'static foam.mlang.MLang.AND',
    'static foam.mlang.MLang.EQ',
    'static foam.mlang.MLang.OR',
    'foam.nanos.logger.Logger',
    'foam.nanos.logger.Loggers',
    'java.util.ArrayList',
    'java.util.List'
  ],

  methods: [
    {
      name: 'find_',
      javaCode: `
        EventRecord er = (EventRecord) getDelegate().find_(x, id);
        if ( er == null ) return er;

        DAO dao = (DAO) x.get("eventRecordResponseDAO");
        // TODO: create predicate then add if not null
        dao = dao.where(
          OR(
            AND(
              EQ(EventRecordResponse.CODE, er.getCode()),
              EQ(EventRecordResponse.PARTNER, er.getPartner())
            ),
            AND(
              EQ(EventRecordResponse.CODE, er.getCode()),
              EQ(EventRecordResponse.EVENT, er.getEvent())
            ),
            AND(
              EQ(EventRecordResponse.EVENT, er.getEvent()),
              EQ(EventRecordResponse.PARTNER, er.getPartner())
            )
          )
        );
        List<EventRecordResponse> responses = (List) ((ArraySink) dao.select(new ArraySink())).getArray();
        if ( responses.size() > 0 ) {
          EventRecordResponse err = responses.get(0);
          er = (EventRecord) er.fclone();
          er.setEventRecordResponse(err);
        } else if ( er.getSeverity().getOrdinal() > LogLevel.INFO.getOrdinal() ) {
          Loggers.logger(x, this).warning("EventRecordResponse Not found", er.toSummary());
        }

        return er;
      `
    }
  ]
});
