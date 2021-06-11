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
        String idStr  = Long.toHexString(currTime);
        if ( seqNo < 10 ) idStr = idStr + "0";
        idStr = idStr + Integer.toString(seqNo);

        // permutation
        char[] id = idStr.toCharArray();
        Random r = ThreadLocalRandom.current();
        for ( int i = id.length - 1; i > 0; i-- )
        {
          int newI = r.nextInt(i + 1);
          char c = id[newI];
          id[newI] = id[i];
          id[i] = c;
        }
        setSeqNo(seqNo + 1);
        return String.valueOf(id);
      `
    }
  ]
})
