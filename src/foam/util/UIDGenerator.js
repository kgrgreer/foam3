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
    'java.util.concurrent.ThreadLocalRandom',
    'java.util.List'
  ],

  properties: [
    {
      name: 'seqNo',
      class: 'Int',
      javaFactory: 'return 0;'
    },
    {
      name: 'lastTimeCalled',
      class: 'Long',
      javaFactory: 'return System.currentTimeMillis() / 1000;'
    },
    {
      name: 'randInts',
      class: 'List',
      javaType: 'List<Integer>',
      javaFactory: `
        List<Integer> randInts = Arrays.asList(11, 3, 7, 9, 5, 6, 2, 8, 1, 9, 11, 10, 8, 12, 6,
                                  14, 6, 5, 16, 3, 17, 2, 20, 18, 24, 17, 25, 3, 16, 12);
        return randInts;
      `
    }
  ],

  methods: [
    {
      name: 'generate',
      documentation: 'Generate a Unique ID',
      synchronized: true,
      type: 'String',
      javaCode: `
        long currTime = System.currentTimeMillis() / 1000;
        if ( currTime != getLastTimeCalled() ) {
          setSeqNo(0);
          setLastTimeCalled(currTime);
        }
        int seqNo = getSeqNo();
        StringBuilder id = new StringBuilder(Long.toHexString(currTime));
        int seqNoAndCks = seqNo * 256 + calcChecksum(currTime, seqNo);
        if ( seqNoAndCks == 0 ) {
          id.append("0000");
        } else {
          int l = (int) (Math.log(seqNoAndCks) / Math.log(16)) + 1;
          if ( l <= 2 ) { id.append("00"); } 
          if ( l % 2 != 0 ) { id.append("0"); }
        }
        id.append(Integer.toHexString(seqNoAndCks));
        setSeqNo(seqNo + 1);
        return permutate(id);
      `
    },
    {
      name: 'calcChecksum',
      type: 'int',
      args: [
        { name: 'currTime', type: 'long' },
        { name: 'seqNo', type: 'int' }
      ],
      javaCode: `
        int checksum = 0;
        while ( currTime > 0 ) {
          checksum += currTime % 256;
          currTime = currTime / 256;
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
      name: 'permutate',
      type: 'String',
      args: [
        { name: 'idStr', type: 'StringBuilder' }
      ],
      javaCode: `
        int l = idStr.length();
        char[] id = new char[l];
        idStr.getChars(0, l, id, 0);
        List<Integer> randInts = getRandInts();
        for ( int i = 0 ; i < l ; i++ )
        {
          int newI = randInts.get(i);
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
        List<Integer> randInts = getRandInts();
        for ( int i = l - 1 ; i >= 0; i-- )
        {
          int newI = randInts.get(i);
          char c = id[newI];
          id[newI] = id[i];
          id[i] = c;
        }
        return String.valueOf(id);
      `
    }
  ]
})
