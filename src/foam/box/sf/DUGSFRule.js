/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */
foam.CLASS({
  package: 'foam.box.sf',
  name: 'DUGSFRule',
  extends: 'foam.nanos.dig.DUGRule',
  
  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.dao.AbstractSink',
    'foam.dao.DAO',
    'foam.dao.HTTPSink',
    'foam.dao.Sink',
  ],
  
  properties: [    
    {
      class: 'String',
      name: 'sfId',
    },
    {
      name: 'asyncAction',
      documentation: `All DUGRules use the same rule action, so a default one is created on demand instead of being configured`,
      section: 'dugInfo',
      view: { class: 'foam.u2.tag.TextArea' },
      javaGetter: `
        DUGSFRuleAction action = new DUGSFRuleAction(getX());
        action.setSfId(getSfId());
        return action;
      `
    },
  ],
});