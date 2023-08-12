/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.ruler',
  name: 'FindRuledCommand',

  javaCode: `
    public FindRuledCommand(String ruleGroup) {
      this(ruleGroup, null);
    }
  `,

  properties: [
    {
      class: 'Reference',
      of: 'foam.nanos.ruler.RuleGroup',
      name: 'ruleGroup'
    },
    {
      class: 'FObjectProperty',
      name: 'target'
    }
  ]
})

foam.CLASS({
  package: 'foam.nanos.ruler',
  name: 'SelectRuledCommand',
  extends: 'foam.nanos.ruler.FindRuledCommand',

  javaCode: `
    public SelectRuledCommand(String ruleGroup) {
      this(ruleGroup, null);
    }
  `
})
