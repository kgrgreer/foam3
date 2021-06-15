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
    'java.util.concurrent.ThreadLocalRandom',
    'java.util.ArrayList',
    'java.util.Random'
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
      javaType: 'ArrayList<Integer>',
      javaFactory: `
        Random r = new Random();
        ArrayList<Integer> randInts =  new ArrayList<>();
        long seed = 1;
        r.setSeed(seed);
        int lowerbound = 12;
        int upperbound = 30;
        for ( int i = 0; i < upperbound; i++ )
        {
          randInts.add(r.nextInt(Math.max(i, lowerbound - 1)));
        }
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
        if ( seqNo == 0 ) {
          id.append("00");
        } else {
          int seqNoLength = (int) (Math.log(seqNo) / Math.log(16));
          if ( seqNoLength % 2 == 0 ) { id.append("0"); }
        }
        int seqNoAndCks = seqNo * 256 + calcChecksum(currTime, seqNo);
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
        while ( seqNo > 0) {
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
        ArrayList<Integer> randInts = getRandInts();
        for ( int i = id.length - 1; i > 0; i-- )
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
