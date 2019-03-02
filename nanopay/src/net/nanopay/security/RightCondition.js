foam.INTERFACE({
  package: 'net.nanopay.security',
  name: 'RightCondition',

  documentation: 'Interface to implement conditions for a KeyRight',

  methods: [
    {
      name: 'conditionMet',
      type: 'Boolean',
      documentation: `A method that checks if the condition implemented by the
        child class is being met.`,
      args: [
        {
          name: 'x',
          type: 'Context'
        }
      ]
    }
  ]
});
