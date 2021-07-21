/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

 foam.CLASS({
    package: 'foam.nanos.ruler',
    name: 'NullRulerAction',
  
    implements: ['foam.nanos.ruler.RuleAction'],
  
    documentation: 'RuleAction that does nothing.',
  
    methods: [
      {
        name: 'applyAction',
        javaCode: `
          //noop
        `
      }
    ]
  });
  