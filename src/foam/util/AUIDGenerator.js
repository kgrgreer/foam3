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

  javaCode: `
  public AUIDGenerator(foam.core.X x, String salt) {
    super(x);
    setSalt(salt);
  }
  `,

  properties: [
    {
      documentation: `
        Generate alpha-numeric unique ID based on timestamp and seqNo:
        8 hexits timestamp(s) + at least 2 hexits sequence inside second + 2 hexits machine ID + 3 hexits checksum.

        In most cases, the generated AUID should be 15 hex digits long.
      `,
      name: 'timestampHexits',
      class: 'Int',
      value: 8
    }
  ],

  methods: [
    {
      name: 'getNext',
      type: 'Object',
      args: [ 'java.lang.Class type' ],
      javaCode: `
        return getNextString();
      `
    },
    {
      name: 'getNextLong',
      javaCode: `
        throw new UnsupportedOperationException("AUIDGenerator: long uid generation not supported.");
      `
    }
  ]
});
