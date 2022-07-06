/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.util',
  name: 'AUIDGenerator',
  extends: 'foam.util.UIDGenerator',
  flags: ['java'],

  documentation: 'Alpha-numeric unique ID generator',

  javaImports: [
    'foam.core.X',
    'static foam.util.UIDSupport.*'
  ],

  javaCode: `
  public AUIDGenerator(X x, String salt) {
    setX(x);
    setSalt(salt);
  }
  `,

  constants: [
    {
      documentation: 'Epoch of this feature - 2021 Nov 1',
      name: 'EPOCH',
      type: 'Long',
      value: 1635739200000
    }
  ],

  properties: [
    {
      name: 'seqNo',
      class: 'Int'
    },
    {
      name: 'lastSecondCalled',
      class: 'Long',
      javaFactory: 'return (System.currentTimeMillis() - EPOCH) / 1000;'
    }
  ],

  methods: [
    {
      name: 'getNext',
      args: [ 'java.lang.Class type' ],
      type: 'Object',
      javaCode: 'return getNextString();'
    },
    {
      name: 'getNextLong',
      javaCode: `
        throw new UnsupportedOperationException("AUIDGenerator: long uid generation not supported.");
      `
    },
    {
      name: 'generate_',
      documentation: `
        Generate alpha-numeric unique ID based on timestamp and seqNo:
        8 hexits timestamp(s) + at least 2 hexits sequence inside second + 2 hexits machine ID + 3 hexits checksum.

        In most cases, the generated AUID should be 15 hex digits long.
      `,
      javaCode: `
        long curSec = 0;
        int seqNo   = 0;

        synchronized (this) {
          curSec = (System.currentTimeMillis() - EPOCH) / 1000;
          if ( curSec != getLastSecondCalled() ) {
            setSeqNo(0);
            setLastSecondCalled(curSec);
          }
          seqNo = getSeqNo();
          setSeqNo(seqNo + 1);
        }

        // 8 bits timestamp
        id.append(toHexString(curSec, 8));
        // At least 2 bits sequence
        id.append(toHexString(seqNo, 2 + Math.max(0, getMinLength() - 15)));
      `
    }
  ]
});
