/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.util',
  name: 'NUIDGenerator',
  extends: 'foam.util.UIDGenerator',
  flags: ['java'],

  documentation: 'Numeric unique ID generator',

  javaImports: [
    'foam.core.Detachable',
    'foam.core.FObject',
    'foam.core.X',
    'foam.core.PropertyInfo',
    'foam.dao.AbstractSink',
    'foam.dao.DAO',
    'foam.nanos.logger.Logger',
    'foam.nanos.logger.Loggers',
    'static foam.util.UIDSupport.*',
    'java.util.concurrent.atomic.AtomicInteger'
  ],

  javaCode: `
  public NUIDGenerator(X x, String salt, DAO dao, PropertyInfo pInfo) {
    setX(x);
    setDao(dao);
    setSalt(salt);
    setPropertyInfo(pInfo);
    init_();
  }

  AtomicInteger seqNo_ = new AtomicInteger();
  `,

  properties: [
    {
      class: 'String',
      name: 'salt',
      javaPostSet: 'if ( getDao() == null ) setDao((DAO) getX().get(getSalt()));'
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'dao'
    },
    {
      class: 'FObjectProperty',
      name: 'propertyInfo',
      hidden: true,
      javaType: 'foam.core.PropertyInfo',
      javaInfoType: 'foam.core.AbstractObjectPropertyInfo'
    }
  ],

  methods: [
    {
      name: 'init_',
      javaCode: 'assertLongId();'
    },
    {
      name: 'getNext',
      args: [ 'java.lang.Class type' ],
      type: 'Object',
      javaCode: 'return getNextLong();'
    },
    {
      name: 'generate_',
      documentation: `
        Generate numeric unique ID based on last seqNo:
        at least 2 hexits sequence number + 2 hexits machine ID + 3 hexits checksum.

        The generated NUID should be at least 7 hex digits long thus larger than
        0x1000000.
      `,
      javaCode: `
        // At least 2 bits sequence number
        if ( seqNo_.get() == 0 ) {
          synchronized ( this ) {
            if ( seqNo_.get() == 0 ) {
              initMaxSeqNo();
            }
          }
        }
        id.append(toHexString(seqNo_.incrementAndGet(), 2));
      `
    },
    {
      name: 'initMaxSeqNo',
      javaCode: `
        Logger logger = Loggers.logger(getX(), this);
        logger.info(getSalt(), "max", "find");
        getDao().select(new AbstractSink() {
          @Override
          public void put(Object obj, Detachable sub) {
            var id = (long) getPropertyInfo().get(obj);
            if ( id > 0x1000000 ) {
              var hex   = undoPermute(Long.toHexString(id));
              var seqNo = Integer.parseInt(hex.substring(0, hex.length() - 5), 16);
              if ( seqNo > seqNo_.get() ) {
                seqNo_.set(seqNo);
              }
            }
          }
        });
        Loggers.logger(getX(), this).info(getSalt(), "max", "found", seqNo_.get());
      `
    },
    {
      name: 'assertLongId',
      javaThrows: [ 'java.lang.UnsupportedOperationException' ],
      javaCode: `
        if ( ! ( getPropertyInfo() instanceof foam.core.AbstractLongPropertyInfo ) ) {
          throw new UnsupportedOperationException(
            "NUIDGenerator: not supported on " + getSalt() + " without id property");
        }
      `
    }
  ]
});
