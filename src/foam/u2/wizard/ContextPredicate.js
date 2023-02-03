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
      name: 'contextKey',
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
      var objToCheck = x[this.contextKey];

      if ( ! objToCheck )
        throw new Error(`Unable to find ${this.contextKey} in this context`);

      if ( ! this.valuePath && ! foam.util.equals(valueToCheck, this.matchValue) )
        throw new Error(`Predicate check failed.`);

      var valueToCheck = this.valuePath.f(objToCheck);
    
      if ( ! foam.util.equals(valueToCheck, this.matchValue) )
        throw new Error(`Predicate check failed.`);

      return true;
    }
  ]
});
