/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

 foam.CLASS({
  package: 'foam.nanos.ruler.tracer',
  name: 'LoggingTracer',
  documentation: 'Rule Tracer, which logs everything that happens during rule evaluation',

  implements: [
    'foam.nanos.ruler.tracer.RuleTracer'
  ],

  javaImports: [
    'foam.nanos.logger.Logger',
    'java.lang.StringBuilder',

  ],
  properties: [
    {
      class: 'Object',
      name: 'log',
      javaType: 'java.lang.StringBuilder',
      javaFactory: 'return new StringBuilder();',
    }
  ],

  methods: [
    {
      name: 'preExecute',
      args: [
        { name: 'x', type: 'Context' }
      ],
      javaCode: `
        setLog(getLog().append("\\nPerforming Rule Debug on DAO: "));
      `
    },
    {
      name: 'postExecute',
      args: [
        { name: 'x', type: 'Context' }
      ],
      javaCode: `
        Logger logger = (Logger) x.get("logger");
        logger.log(getLog().toString());
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
        { name: 'result', type: 'Boolean' },
      ],
      type: 'Boolean',
      javaCode: `
        return result;
      `
    },
    {
      name: 'tracePredicate',
      args: [
        { name: 'result', type: 'Boolean' },
      ],
      type: 'Boolean',
      javaCode: `
        return result;
      `
    },
    {
      name: 'traceActive',
      args: [
        { name: 'result', type: 'Boolean' },
      ],
      type: 'Boolean',
      javaCode: `
        return result;
      `
    },
    {
      name: 'traceAction',
      javaCode: `
        //NOP
      `
    }
  ]
});
