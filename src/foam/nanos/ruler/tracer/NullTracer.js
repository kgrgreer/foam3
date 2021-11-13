/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

 foam.CLASS({
  package: 'foam.nanos.ruler.tracer',
  name: 'NullTracer',
  documentation: 'Rule Tracer, which does nothing',

  implements: [
    'foam.nanos.ruler.tracer.RuleTracer'
  ],

  axioms: [
    foam.pattern.Singleton.create()
  ],

  methods: [
    {
      name: 'preExecute',
      args: [
        { name: 'x', type: 'Context' }
      ],
      javaCode: `
        //NOP
      `
    },
    {
      name: 'postExecute',
      args: [
        { name: 'x', type: 'Context' }
      ],
      javaCode: `
        //NOP
      `
    },
    {
      name: 'preRule',
      args: [
        { name: 'rule', type: 'foam.nanos.ruler.Rule' },
        { name: 'obj', type: 'foam.core.FObject' },
        { name: 'oldObj', type: 'foam.core.FObject' }
      ],
      javaCode: `
        //NOP
      `
    },
    {
      name: 'postRule',
      args: [
        { name: 'rule', type: 'foam.nanos.ruler.Rule' },
        { name: 'obj', type: 'foam.core.FObject' },
        { name: 'oldObj', type: 'foam.core.FObject' }
      ],
      javaCode: `
        //NOP
      `
    },
    {
      name: 'tracePermission',
      args: [
        { name: 'user', type: 'foam.nanos.auth.User' },
        { name: 'result', type: 'Boolean' },
      ],
      javaCode: `
        //NOP
      `
    },
    {
      name: 'tracePredicate',
      args: [
        { name: 'result', type: 'Boolean' },
      ],
      javaCode: `
        //NOP
      `
    },
    {
      name: 'traceActive',
      args: [
        { name: 'result', type: 'Boolean' },
      ],
      javaCode: `
        //NOP
      `
    },
    {
      name: 'traceAction',
      javaCode: `
        //NOP
      `
    },
  ]
});
