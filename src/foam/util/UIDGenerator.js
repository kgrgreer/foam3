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
    'foam.core.X',
    'foam.nanos.logger.Logger',
    'java.net.InetAddress',
    'java.net.UnknownHostException',
    'static foam.util.UIDSupport.*'
  ],

  javaCode: `
  public UIDGenerator(X x, String salt) {
    setX(x);
    setSalt(salt);
  }
  `,

  constants: [
    {
      documentation: 'Epoch of this feature - 2021 Nov 1',
      name: 'EPOCH',
      type: 'Long',
      value: 1635739200000
    }
  ],

  properties: [
    {
      name: 'seqNo',
      class: 'Int'
    },
    {
      name: 'lastSecondCalled',
      class: 'Long',
      javaFactory: 'return (System.currentTimeMillis() - EPOCH) / 1000;'
    },
    {
      name: 'salt',
      class: 'String'
    },
    {
      name: 'machineId',
      class: 'Int',
      javaFactory: `
        try {
          return Integer.parseInt(System.getProperty("MACHINE_ID"));
        } catch ( Exception e ) {
          try {
            var ipAddress = InetAddress.getLocalHost();
            var bytes     = ipAddress.getAddress();
            var length    = bytes.length;
            return (bytes[length - 1] & 0xff) +
                   (bytes[length - 2] & 0xff) * (1<<8);
          } catch ( UnknownHostException ex ) {
            System.err.println("Unable to determine machine ID");
            Logger logger = (Logger) getX().get("logger");
            if ( logger != null ) logger.error(ex);
          }
        }
        return 0;
      `
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
      documentation: `Support generating up to 4096 uids per second (3 hex digits, 16^3 = 4096).
                      Use getNextString if throughput is expected to be higher.`,
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
      type: 'String',
      documentation: `
        Generate a Unique ID. The Unique ID consists of :
        8 hexits timestamp(s) + at least 2 hexits sequence inside second + 2 hexits machine ID + 3 hexits checksum.

        After the checksum is added, the ID is permutated based on the
        permutationSeq. In most cases, the generated ID should be 13 digits long.
      `,
      javaCode: `
        var id = new StringBuilder();

        // 8 bits timestamp
        long curSec = (System.currentTimeMillis() - EPOCH) / 1000;
        id.append(toHexString(curSec, 8));

        // At least 2 bits sequence
        int seqNo = 0;
        synchronized (this) {
          if ( curSec != getLastSecondCalled() ) {
            setSeqNo(0);
            setLastSecondCalled(curSec);
          }
          seqNo = getSeqNo();
          setSeqNo(seqNo + 1);
        }
        id.append(toHexString(seqNo, 2));

        // 2 bits machine id
        id.append(toHexString(getMachineId() % 0xff, 2));

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
        // Breaking the multiplication to avoid overflow before mod-ing,
        // (ab mod m) = ((a mod m) * (b mod m)) mod m.
        var idMod     = mod(mod(Long.parseLong(id, 16)) * mod(0x1000));

        return (int) (UIDSupport.CHECKSUM_MOD - idMod + targetMod);
      `
    }
  ]
})
