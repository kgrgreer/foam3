/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.INTERFACE({
  package: 'net.nanopay.cico.spi.alterna',
  name: 'SFTPService',
  extends: 'foam.nanos.NanoService',
  methods: [
    {
      name: 'sendCICOFile',
      javaReturns: 'void',
      returns: 'Promise',
      args: []
    }
  ]
});
