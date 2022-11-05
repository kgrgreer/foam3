/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.net.test',
  name: 'CIDRTest',
  extends: 'foam.nanos.test.Test',

  javaImports: [
    'foam.core.X',
    'foam.nanos.logger.Logger',
    'foam.nanos.logger.Loggers',
    'foam.net.CIDR'
  ],

  methods: [
    {
      name: 'runTest',
      javaCode: `
      Logger logger = Loggers.logger(x, this);

      CIDR cidr = new CIDR(x, "172.25.25.0/24");

      String address = null;
      try {
        address = "172.25.25.150";
        test( cidr.inRange(x, address), "Address allowed "+address);
      } catch (java.net.UnknownHostException t) {
        test(false, "Address allowed");
      }
      try {
        address = "172.25.26.150";
        test( ! cidr.inRange(x, address), "Address restricted "+address);
      } catch (java.net.UnknownHostException t) {
        test(false, "Address restricted "+t.getMessage());
      }
      try {
        address = "10.25.26.150";
        test( ! cidr.inRange(x, address), "Address restricted "+address);
      } catch (java.net.UnknownHostException t) {
        test(false, "Address restricted "+t.getMessage());
      }
      `
    }
  ]
});
