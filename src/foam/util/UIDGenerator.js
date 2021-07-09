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
        Generate a Unique ID. The Unique ID consists of : 8 hexits timestamp(s) + at least 2 hexits sequence inside second 
        + 2 hexits checksum. After the checksum is added, the ID is permutated based on the permutationSeq. In most cases, 
        the generated ID should be 12 digits long.
      `,
      javaCode: `
        long curSec = System.currentTimeMillis() / 1000;
        if ( curSec != getLastSecondCalled() ) {
          setSeqNo(0);
          setLastSecondCalled(curSec);
        }
        int seqNo = getSeqNo();
        StringBuilder id = new StringBuilder(Long.toHexString(curSec));
        int seqNoAndCks = seqNo * 256 + calcChecksum(curSec, seqNo);
        if ( seqNoAndCks == 0 ) {
          id.append("0000");
        } else {
          int l = (int) (Math.log(seqNoAndCks) / Math.log(16)) + 1;
          if ( l <= 2 ) { id.append("00"); } 
          if ( l % 2 != 0 ) { id.append('0'); }
        }
        id.append(Integer.toHexString(seqNoAndCks));
        setSeqNo(seqNo + 1);
        return permutate(id);
      `
    },
    {
      name: 'calcChecksum',
      visibility: 'protected',
      type: 'int',
      args: [
        { name: 'curSec', type: 'long' },
        { name: 'seqNo', type: 'int' }
      ],
      javaCode: `
        int checksum = 0;
        while ( curSec > 0 ) {
          checksum += curSec % 256;
          curSec = curSec / 256;
        }
        while ( seqNo > 0 ) {
          checksum += seqNo % 256;
          seqNo = seqNo / 256;
        }
        checksum = 256 - (checksum % 256);
        return checksum;
      `
    },
    {
      name: 'getPermutationSeq',
      visibility: 'protected',
      type: 'int[]',
      documentation: `
        A hard coded array used as permutation sequence. It only supports permutation of a string less than 30 digits. 
        The part of a string over 30 digits will not be involved in permutation.
      `,
      javaCode: `
        int[] permutationSeq = new int[] {11, 3, 7, 9, 5, 6, 2, 8, 1, 9, 11, 10, 8, 12, 6, 14, 6, 5, 16, 3, 17, 2, 20, 18, 24, 17, 25, 3, 16, 12};
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
