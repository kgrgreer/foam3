foam.CLASS({
  package: 'net.nanopay.meter.test',
  name: 'IdentityMindIntegrationTest',
  extends: 'foam.nanos.test.Test',

  methods: [
    {
      name: 'runTest',
      javaCode: `
        test(true, "Test the truth.");
      `
    }
  ]
});
