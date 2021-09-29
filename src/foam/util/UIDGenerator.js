/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.util',
  name: 'UIDGenerator',
  flags: ['java'],

  javaImports: [
    'static foam.util.UIDSupport.*'
  ],

  properties: [
    {
      name: 'seqNo',
      class: 'Int'
    },
    {
      name: 'lastSecondCalled',
      class: 'Long',
      javaFactory: 'return System.currentTimeMillis() / 1000;'
    },
    {
      name: 'salt',
      class: 'String'
    }
  ],

  methods: [
    {
      name: 'getNextString',
      type: 'String',
      javaCode: `
        return String.valueOf(getNextLong());
      `
    },
    {
      name: 'getNextLong',
      type: 'Long',
      javaCode: `
        // TODO: When a ID is longer than 15 digits, it might overflow the long type. Need to figure out what to do in the overflow case.
        try {
          long id = Long.parseLong(generate(), 16);
          return id;
        } catch (Exception e) {
          e.printStackTrace();
          setSeqNo(0);
          long id = Long.parseLong(generate(), 16);
          return id;
        }
      `
    },
    {
      name: 'generate',
      synchronized: true,
      type: 'String',
      documentation: `
        Generate a Unique ID. The Unique ID consists of :
        8 hexits timestamp(s) + at least 2 hexits sequence inside second + 3 hexits checksum.

        After the checksum is added, the ID is permutated based on the
        permutationSeq. In most cases, the generated ID should be 13 digits long.
      `,
      javaCode: `
        var id = new StringBuilder();

        // 8 bits timestamp
        long curSec = System.currentTimeMillis() / 1000;
        id.append(toHexString(curSec));

        // 2 bits sequence
        if ( curSec != getLastSecondCalled() ) {
          setSeqNo(0);
          setLastSecondCalled(curSec);
        }
        int seqNo = getSeqNo();
        id.append(toHexString(seqNo, 2));
        setSeqNo(seqNo + 1);

        // 3 bits checksum
        var checksum = toHexString(calcChecksum(id.toString()), 3);
        id.append(checksum);

        // permutation
        return permutate(id.toString());
      `
    },
    {
      name: 'calcChecksum',
      visibility: 'protected',
      type: 'Integer',
      args: [
        { name: 'id', type: 'String' }
      ],
      javaCode: `
        var targetMod = mod(getSalt());
        var idMod     = mod(Long.parseLong(id + "000", 16));

        return (int) (UIDSupport.CHECKSUM_MOD - idMod + targetMod);
      `
    }
  ]
})
