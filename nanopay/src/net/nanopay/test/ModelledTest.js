foam.CLASS({
  package: 'net.nanopay.test',
  name: 'ModelledTest',
  extends: 'foam.nanos.test.Test',

  methods: [
    {
      name: 'runTest',
      type: 'Void',
      javaCode: `
      int num = 1;
      test(num == 1, "This works!");
      test(num == 2, "This fails!");
      `
    }
  ]
});
