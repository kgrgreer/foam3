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
    'foam.mlang.order.Comparator',
    'static foam.util.UIDSupport.*'
  ],

  javaCode: `
  public NUIDGenerator(X x, String salt, DAO dao, PropertyInfo pInfo) {
    setX(x);
    setSalt(salt);
    setDao(dao);
    setPropertyInfo(pInfo);
    init_();
  }

  public NUIDGenerator(X x, String salt, DAO dao, PropertyInfo pInfo, Comparator comparator) {
    setX(x);
    setSalt(salt);
    setDao(dao);
    setPropertyInfo(pInfo);
    setComparator(comparator);
    init_();
  }
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
    },
    {
      documentation: 'order select by comparator so first entry has max sequence number',
      class: 'FObjectProperty',
      of: 'foam.mlang.order.Comparator',
      name: 'comparator'
    },
    {
      class: 'Int',
      name: 'value'
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
        int seqNo = 0;
        synchronized (this) {
          seqNo = getLastSeqNo() + 1;
        }
        id.append(toHexString(seqNo, 2));
      `
    },
    {
      name: 'getLastSeqNo',
      type: 'Integer',
      javaCode: `
        DAO dao = getDao();
        if ( getComparator() != null ) {
          dao = dao.orderBy(getComparator()).limit(1);
        }
        dao.select(new AbstractSink() {
          @Override
          public void put(Object obj, Detachable sub) {
            var id = (long) getPropertyInfo().get(obj);
            if ( id > 0x1000000 ) {
              var hex   = undoPermute(Long.toHexString(id));
              var seqNo = Integer.parseInt(hex.substring(0, hex.length() - 5), 16);
              if ( getValue() < seqNo ) {
                setValue(seqNo);
              }
            }
          }
        });
        return getValue();
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
