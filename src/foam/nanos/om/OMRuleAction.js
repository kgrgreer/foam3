/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 *     http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.om',
  name: 'OMRuleAction',

  implements: [ 'foam.nanos.ruler.RuleAction' ],

  documentation: `
    Rule action for logging an OM for a specific predicate match
  `,

  methods: [
    {
      name: 'applyAction',
      args: 'String spid, String group, String name',
      javaCode: `
//OMLogger omLogger = (OMLogger) x.get("OMLogger");
      `
    }
  ]

});
