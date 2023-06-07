/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 *     http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.om',
  name: 'OMRuleAction',

  documentation: `
    Rule action for logging an OM for a specific predicate match
  `,

  javaImports: [
    'foam.core.X',
    'foam.util.SafetyUtil',
    'java.util.StringJoiner'
  ],

  implements: ['foam.nanos.ruler.RuleAction'],

  properties: [
    {
      class: 'String',
      name: 'spid',
      documentation: 'Text to display to agent'
    },
    {
      class: 'String',
      name: 'group',
      documentation: 'Text to display to agent'
    },
    {
      class: 'String',
      name: 'name',
      documentation: 'Text to display to agent',
      required: true
    }
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
OMLogger omLogger = getLogger(x);
StringJoiner omName = new StringJoiner(".");

// Spid
if ( ! SafetyUtil.isEmpty(getSpid()) ) {
  omName.add(getSpid());
}

// Group
if ( ! SafetyUtil.isEmpty(getGroup()) ) {
  omName.add(getGroup());
}

// Name
omName.add(getName());

omLogger.log(omName);
      `
    },
    {
      name: 'getLogger',
      args: [ { name: 'x', type: 'X' } ],
      type: 'OMLogger',
      javaCode: `return (OMLogger) x.get("OMLogger");`
    }
  ]
});
