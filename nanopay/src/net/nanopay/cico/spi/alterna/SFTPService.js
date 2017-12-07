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
