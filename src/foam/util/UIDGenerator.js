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
    'java.util.Arrays',
    'java.util.List'
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
        return generate();
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
        StringBuilder id = new StringBuilder();

        // 8 bits timestamp
        long curSec = System.currentTimeMillis() / 1000;
        id.append(Long.toHexString(curSec));

        // 2 bits sequence
        if ( curSec != getLastSecondCalled() ) {
          setSeqNo(0);
          setLastSecondCalled(curSec);
        }
        int seqNo = getSeqNo();
        if ( seqNo < 16 ) {
          id.append('0');
        }
        id.append(Integer.toHexString(seqNo));
        setSeqNo(seqNo + 1);

        // 3 bits checksum
        int checksum = calcChecksum(id.toString());
        if ( checksum < 16 ) {
          id.append("00");
        } else if ( checksum < 256 ) {
          id.append('0');
        }
        id.append(Integer.toHexString(checksum));

        // permutation
        return UIDSupport.getInstance().permutate(id);
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
        var support   = UIDSupport.getInstance();
        var targetMod = support.mod(getSalt());
        var idMod     = support.mod(Long.parseLong(id + "000", 16));

        return (int) (UIDSupport.MOD - idMod + targetMod);
      `
    }
  ]
})
