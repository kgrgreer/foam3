/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.util',
  name: 'UIDGenerator',
  abstract: true,
  flags: ['java'],

  javaImports: [
    'foam.core.X',
    'foam.nanos.logger.Loggers',
    'static foam.util.UIDSupport.*'
  ],

  properties: [
    {
      name: 'salt',
      class: 'String'
    },
    {
      name: 'machineId',
      class: 'Int',
      javaFactory: `
        int machineId = 0;
        try {
          machineId = Integer.parseInt(System.getProperty("MACHINE_ID"));
          Loggers.logger(getX(), this).debug("machineId", "MACHINE_ID", machineId);
        } catch ( Exception e ) {
          // NOTE: attempting to use IP address is not realistic from Java,
          // as InetAddress.getLocalHost and even getByName(hostname) will
          // return the loopback address (127.0.0.1).
          try {
            machineId = System.getProperty("hostname").hashCode() & 0xffff;
            Loggers.logger(getX(), this).debug("machineId", "hostname", machineId);
          } catch ( NullPointerException ex ) {
            machineId = (int) System.currentTimeMillis() & 0xffff;
            Loggers.logger(getX(), this).warning("machineId", "time", machineId, new Exception("MachineId not determined"));
          }
        }
        return machineId;
      `
    }
  ],

  methods: [
    {
      abstract: true,
      name: 'generate_',
      args: [ 'StringBuilder id' ]
    },
    {
      name: 'generate',
      type: 'String',
      documentation: `
        Generate a Unique ID. The Unique ID consists of :
        sub-class generate_(id) + 2 hexits machine ID + 3 hexits checksum.

        After the checksum is added, the ID is permuted making the next
        generated ID harder to guess.
      `,
      javaCode: `
        var id = new StringBuilder();
        generate_(id);

        // 2 bits machine id
        id.append(toHexString(getMachineId() % 0xff, 2));

        // 3 bits checksum
        var checksum = toHexString(calcChecksum(id.toString()), 3);
        id.append(checksum);

        // permutation
        return permute(id.toString());
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
        var targetMod = getHashKey();
        // Breaking the multiplication to avoid overflow before mod-ing,
        // (ab mod m) = ((a mod m) * (b mod m)) mod m.
        var idMod     = mod(mod(Long.parseLong(id, 16)) * mod(0x1000));

        return (int) (UIDSupport.CHECKSUM_MOD - idMod + targetMod);
      `
    },
    {
      name: 'getNext',
      type: 'Object',
      args: [ 'java.lang.Class type' ],
      javaCode: `
        if ( type == String.class ) return getNextString();
        if ( type == long.class   ) return getNextLong();
        throw new UnsupportedOperationException("Not support generating uid of type " + type.getSimpleName());
      `
    },
    {
      name: 'getNextString',
      type: 'String',
      javaCode: 'return generate();'
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
          foam.nanos.logger.Loggers.logger(getX(), this).error("Failed to generate numeric uid", e);
          throw e;
        }
      `
    },
    {
      name: 'getHashKey',
      type: 'Integer',
      javaCode: 'return mod(getSalt());'
    }
  ]
})
