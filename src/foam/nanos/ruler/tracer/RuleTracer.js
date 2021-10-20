/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.INTERFACE({
  package: 'foam.nanos.ruler.tracer',
  name: 'RuleTracer',

  documentation: `
    A model should implement this interface if it is to act as a Rule Tracer, meaning it is
    called upon by the rule engine during certain operations.
  `,

  methods: [
    {
      name: 'preExecute',
      documentation: `
        This method happens when the rule permission is checked
      `,
      args: [
        { name: 'x', type: 'Context' }
      ]
    },
    {
      name: 'postExecute',
      documentation: `
        This method happens when the rule permission is checked
      `,
      args: [
        { name: 'x', type: 'Context' }
      ]
    },
    {
      name: 'preRule',
      documentation: `
        This method happens when the rule permission is checked
      `,
      args: [
        { name: 'rule', type: 'foam.nanos.ruler.Rule' },
        { name: 'obj', type: 'foam.core.FObject' },
        { name: 'oldObj', type: 'foam.core.FObject' }
      ]
    },
    {
      name: 'postRule',
      documentation: `
        This method happens when the rule permission is checked
      `,
      args: [
        { name: 'rule', type: 'foam.nanos.ruler.Rule' },
        { name: 'obj', type: 'foam.core.FObject' },
        { name: 'oldObj', type: 'foam.core.FObject' }
      ]
    },
    {
      name: 'tracePermission',
      documentation: `
        This method happens when the rule permission is checked
      `,
      args: [
        { name: 'user', type: 'foam.nanos.auth.User' },
        { name: 'result', type: 'Boolean' }
      ]
    },
    {
      name: 'tracePredicate',
      documentation: `
        This method happens after the rule predicate is checked
      `,
      args: [
        { name: 'result', type: 'Boolean' }
      ]
    },
    {
      name: 'traceActive',
      documentation: `
        This method happens after the rule active field is checked
      `,
      args: [
        { name: 'result', type: 'Boolean' }
      ]
    },
    {
      name: 'traceAction',
      documentation: `
        This method happens when the rule permission is checked
      `
    },
  ]
});
