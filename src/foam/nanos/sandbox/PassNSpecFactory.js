foam.CLASS({
  package: 'foam.nanos.sandbox',
  name: 'PassNSpecFactory',
  extends: 'foam.nanos.sandbox.AbstractNSpecFactory',

  methods: [
    {
      name: 'create',
      type: 'Object',
      args: [ { name: 'x', type: 'Context' } ],
      javaCode: `
        return getHostX().get(getNSpec().getName());
      `
    }
  ]
});
