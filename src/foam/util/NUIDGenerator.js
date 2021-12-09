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

  javaCode: `
  public NUIDGenerator(foam.core.X x, String salt) {
    super(x);
    setSalt(salt);
  }
  `,

  properties: [
    {
      documentation: `Number of hex digits used from the timestamp.
      Long UIDs are constrained and therefore would use less timestamp digits.
      At least 2 hexits sequence number + 2 hexits machine ID + 3 hexits checksum.`,
      name: 'timestampHexits',
      class: 'Int',
      value: 2
    }
  ],

  methods: [
    {
      name: 'getNext',
      type: 'Object',
      args: [ 'java.lang.Class type' ],
      javaCode: `
        return getNextLong();
      `
    },
    {
      name: 'getNextString',
      javaCode: `
      return String.valueOf(getNextLong());
      `
    }
  ]
});
