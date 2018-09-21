foam.INTERFACE({
  package: 'net.nanopay.security',
  name: 'RightCondition',

  documentation: 'Interface to implement conditions for rights',

  properties: [
    {
      class: 'Int',
      name: 'weight',
      documentation: 'The weight or importance that is assigned to this condition.'
    }
  ],

  methods: [
    {
      name: 'conditionMet',
      returns: 'Boolean',
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
