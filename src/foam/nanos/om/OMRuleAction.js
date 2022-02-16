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
    'java.lang.StringBuilder'
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
OMLogger omLogger = (OMLogger) x.get("OMLogger");
StringBuilder omName = new StringBuilder();

// Spid
if ( ! SafetyUtil.isEmpty(getSpid()) ) {
  omName.append(getSpid());
  omName.append(".");
}

// Group
if ( ! SafetyUtil.isEmpty(getGroup()) ) {
  omName.append(getGroup());
  omName.append(".");
}

// Name
omName.append(getName());

omLogger.log(omName);
      `
    }
  ]
});
