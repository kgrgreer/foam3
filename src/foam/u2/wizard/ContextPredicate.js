/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

 foam.CLASS({
  package: 'foam.u2.wizard',
  name: 'ContextPredicate',
  extends: 'foam.mlang.predicate.AbstractPredicate',
  implements: ['foam.core.Serializable'],

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
    function f(x) {
      var objToCheck = x[this.contextKey];

      if ( ! objToCheck )
        throw new Error(`Unable to find ${this.contextKey} in this context`);

      if ( ! this.valuePath )
        return foam.util.equals(objToCheck, this.matchValue)

      var valueToCheck = this.valuePath.f(objToCheck);
      return foam.util.equals(valueToCheck, this.matchValue);
    }
  ]
});
