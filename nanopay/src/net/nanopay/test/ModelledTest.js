foam.CLASS({
  package: 'net.nanopay.test',
  name: 'ModelledTest',
  extends: 'foam.nanos.test.Test',

  methods: [
    {
      name: 'runTest',
      type: 'Void',
      javaCode: `
      test(1 == 1, "This works!");
      test(1 == 2, "This fails!");
      `
    }
  ]
});
