/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

 foam.CLASS({
  package: 'foam.u2.wizard',
  name: 'ContextPredicate',
  documentation: `
    Predicate to check if (or property of) a context object matches some value.
  `,

  properties: [
    {
      class: 'String',
      name: 'loadFromContext',
      documentation: 'Name of context object to check'
    },
    {
      class: 'foam.u2.wizard.PathProperty',
      name: 'valuePath',
      documentation: 'Optional path of value on obj to be checked'
    },
    {
      class: 'Object',
      name: 'matchValue',
      documentation: 'Value to match in order to pass predicate'
    }
  ],

  methods: [
    function execute(x) {
      var objToCheck = x[this.loadFromContext];

      if ( ! objToCheck )
        throw new Error(`Unable to find ${this.loadFromContext} in this context`);

      objToCheck = this.valuePath.f(objToCheck);
      if ( ! objToCheck )
        throw new Error(`Unable to find path ${this.valuePath} on Context Object ${this.loadFromContext}`)
    
      if ( ! foam.Object.equals(objToCheck, this.matchValue) )
        throw new Error(`Predicate check failed.`)

      return true;
    }
  ]
});
