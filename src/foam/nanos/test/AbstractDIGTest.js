/**
 * @license
 * Copyright 2023 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.test',
  name: 'AbstractDIGTest',
  abstract: true,
  extends: 'foam.nanos.test.Test',

  documentation: 'Base class for tests using DIG',

  javaImports: [
    'foam.core.Detachable',
    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.dao.Sink',
    'foam.lib.json.JSONParser',
    'static foam.mlang.MLang.AND',
    'static foam.mlang.MLang.EQ',
    'static foam.mlang.MLang.TRUE',
    'foam.nanos.crunch.UserCapabilityJunction',
    'foam.nanos.dig.DUGLoopback',
    'foam.nanos.logger.Logger',
    'foam.nanos.logger.Loggers',
    'foam.util.SafetyUtil'
  ],

  properties: [
    {
      name: 'requestTimeout',
      class: 'Long',
      value: 3600
    },
    {
      documentation: 'last recieved dug object',
      name: 'dugData',
      class: 'FObjectProperty'
    },
    {
      name: 'dugMaxWaitTime',
      class: 'Long',
      value: 1000
    }
  ],

  javaCode: `
  protected Object dugLock_ = new Object();
  `,

  methods: [
    {
      name: 'setup',
      args: 'X x',
      javaCode: `
      // pull http from context to ensure it's started.
      test ( x.get("http") != null, "http initialized" );
      test ( x.get("dugLoopback") != null, "dugLoopback initialized");
      DAO dugLoopbackDAO = (DAO) x.get("dugLoopbackDAO");
      dugLoopbackDAO.listen(new Sink() {
        public void put(Object obj, Detachable sub) {
          DUGLoopback loopback = (DUGLoopback) obj;
          String data = loopback.getData();
          if ( ! SafetyUtil.isEmpty(data) ) {
            // TODO: thread local parser
            synchronized ( dugLock_ ) {
              setDugData((FObject) new JSONParser().parseString(data));
              dugLock_.notify();
            }
          }
        }
        public void remove(Object obj, Detachable sub) {}
        public void eof() {}
        public void reset(Detachable sub) {}
      }, TRUE);
      `
    },
    {
      name: 'teardown',
      args: 'X x',
      javaCode: `

      `
    },
    {
      name: 'getDUGContent',
      args: 'X x',
      type: 'FObject',
      javaCode: `
      long waited = 0L;
      long waitTime = 100L;
      FObject data = null;
      synchronized ( dugLock_ ) {
        while ( data == null ) {
          data = getDugData();
          if ( data != null ) {
            DUG_DATA.clear(this);
            break;
          }
          try {
            if ( waited >= getDugMaxWaitTime() ) {
              Loggers.logger(x, this).warning("DUG timeout");
              break;
            }
            dugLock_.wait(waitTime);
            waited += waitTime;
          } catch (InterruptedException e) {
            break;
          }
        }
      }
      return data;
      `
    },
    {
      name: 'findUCJ',
      args: 'Context x, long sourceId, String targetId',
      type: 'foam.nanos.crunch.UserCapabilityJunction',
      javaCode: `
      return (UserCapabilityJunction) ((DAO) x.get("userCapabilityJunctionDAO")).find(
        AND(
          EQ(UserCapabilityJunction.SOURCE_ID, sourceId),
          EQ(UserCapabilityJunction.TARGET_ID, targetId)
        ));
      `
    },
  ]
})
