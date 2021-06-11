/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.util',
  name: 'UIdGenerator',
  flags: ['java'],

  javaImports: [
    'java.util.concurrent.ThreadLocalRandom',
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
        String id  = Long.toHexString(currTime);
        String seqStr = Integer.toHexString(seqNo);
        if ( seqStr.length() % 2 != 0 ) seqStr = "0" + seqStr;
        String checksum = calcChecksum(currTime);
        id = id + seqStr + checksum;
        id = permutate(id);
        setSeqNo(seqNo + 1);
        return id;
      `
    },
    {
      name: 'calcChecksum',
      type: 'String',
      args: [
        { name: 'currTime', type: 'long' }
      ],
      javaCode: `
        int checksum = 0;
        while ( currTime > 0 ) {
          checksum += currTime % 256;
          currTime = currTime / 256;
        }
        int seqNo = getSeqNo();
        while ( seqNo > 0) {
          checksum += seqNo % 256;
          seqNo = seqNo / 256;
        }
        checksum = 256 - (checksum % 256);
        return Integer.toHexString(checksum);
      `
    },
    {
      name: 'permutate',
      type: 'String',
      args: [
        { name: 'idStr', type: 'String' }
      ],
      javaCode: `
        char[] id = idStr.toCharArray();
        Random r = ThreadLocalRandom.current();
        for ( int i = id.length - 1; i > 0; i-- )
        {
          int newI = r.nextInt(i + 1);
          char c = id[newI];
          id[newI] = id[i];
          id[i] = c;
        }
        return String.valueOf(id);
      `
    }
  ]
})
