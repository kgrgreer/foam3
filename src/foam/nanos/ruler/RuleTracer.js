/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.INTERFACE({
  package: 'foam.nanos.ruler',
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
        {
          name: 'x', type: 'Context'
        }
      ]
    },
    {
      name: 'postExecute',
      documentation: `
        This method happens when the rule permission is checked
      `,
      args: [
        {
          name: 'x', type: 'Context'
        }
      ]
    },
    {
      name: 'preRule',
      documentation: `
        This method happens when the rule permission is checked
      `,
      args: [
        {
          name: 'x', type: 'Context'
        }
      ]
    },
    {
      name: 'postRule',
      documentation: `
        This method happens when the rule permission is checked
      `,
      args: [
        {
          name: 'x', type: 'Context'
        }
      ]
    },
    {
      name: 'tracePermission',
      documentation: `
        This method happens when the rule permission is checked
      `,
      args: [
        {
          name: 'x', type: 'Context'
        }
      ]
    },
    {
      name: 'tracePredicate',
      documentation: `
        This method happens when the rule permission is checked
      `,
      args: [
        {
          name: 'x', type: 'Context'
        }
      ]
    },
    {
      name: 'traceActive',
      documentation: `
        This method happens when the rule permission is checked
      `,
      args: [
        {
          name: 'x', type: 'Context'
        }
      ]
    },
    {
      name: 'traceAction',
      documentation: `
        This method happens when the rule permission is checked
      `,
      args: [
        {
          name: 'x', type: 'Context'
        }
      ]
    },
  ]
});
