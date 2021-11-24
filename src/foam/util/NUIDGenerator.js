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
    'static foam.util.UIDSupport.*'
  ],

  javaCode: `
  public NUIDGenerator(X x, String salt) {
    setX(x);
    setSalt(salt);
  }
  `,

  properties: [
    {
      name: 'salt',
      javaPostSet: 'setDao((DAO) getX().get(getSalt()));'
    },
    {
      class: 'Object',
      name: 'dao',
      javaType: 'foam.dao.DAO',
      javaPostSet: 'assertLongId();'
    },
    {
      class: 'Int',
      name: 'value'
    }
  ],

  methods: [
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
        getDao().select(new AbstractSink() {
          @Override
          public void put(Object obj, Detachable sub) {
            var id = (long) ((FObject) obj).getProperty("id");
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
        var id = (PropertyInfo) getDao().getOf().getAxiomByName("id");
        if ( id.getValueClass() != long.class ) {
          throw new UnsupportedOperationException(
            "NUIDGenerator: not support " + getSalt() + " with id of type: " + id.getValueClass().getSimpleName());
        }
      `
    }
  ]
})
