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
        return permutate(id);
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
        var targetMod = Math.abs(getSalt().hashCode()) % 997;
        var idMod     = Long.parseLong(id + "000", 16) % 997;
        return (int) (997 - idMod + targetMod);
      `
    },
    {
      name: 'getPermutationSeq',
      visibility: 'protected',
      type: 'int[]',
      documentation: `
        A hard coded array used as permutation sequence. It only supports
        permutation of a string less than 30 digits. The part of a string over
        30 digits will not be involved in permutation.
      `,
      javaCode: `
        int[] permutationSeq = new int[] {
          11,  3,  7,  9,  5,  6,  2, 8,  1,  9,
          11, 10,  8, 12,  6, 14,  6, 5, 16,  3,
          17,  2, 20, 18, 24, 17, 25, 3, 16, 12
        };
        return permutationSeq;
      `
    },
    {
      name: 'permutate',
      type: 'String',
      args: [
        { name: 'idStr', type: 'StringBuilder' }
      ],
      javaCode: `
        int l = idStr.length();
        char[] id = new char[l];
        idStr.getChars(0, l, id, 0);
        int[] permutationSeq = getPermutationSeq();
        for ( int i = 0 ; i < l ; i++ ) {
          int newI = permutationSeq[i];
          char c = id[newI];
          id[newI] = id[i];
          id[i] = c;
        }
        return String.valueOf(id);
      `
    },
    {
      name: 'undoPermutate',
      type: 'String',
      args: [
        { name: 'idStr', type: 'String' }
      ],
      javaCode: `
        int l = idStr.length();
        char[] id = idStr.toCharArray();
        int[] permutationSeq = getPermutationSeq();
        for ( int i = l - 1 ; i >= 0; i-- ) {
          int newI = permutationSeq[i];
          char c = id[newI];
          id[newI] = id[i];
          id[i] = c;
        }
        return String.valueOf(id);
      `
    }
  ]
})
