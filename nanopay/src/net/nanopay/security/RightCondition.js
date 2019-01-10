foam.INTERFACE({
  package: 'net.nanopay.security',
  name: 'RightCondition',

  documentation: 'Interface to implement conditions for a KeyRight',

  methods: [
    {
      name: 'conditionMet',
      type: 'Boolean',
      swiftType: 'Bool',
      documentation: `A method that checks if the condition implemented by the
        child class is being met.`,
      args: [
        {
          name: 'x',
          javaType: 'foam.core.X'
        }
      ]
    }
  ]
});
