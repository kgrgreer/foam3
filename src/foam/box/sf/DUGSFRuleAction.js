/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */
foam.CLASS({
  package: 'foam.box.sf',
  name: 'DUGSFRuleAction',
  extends: 'foam.nanos.dig.DUGRuleAction',
  
  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.dao.AbstractSink',
    'foam.dao.DAO',
    'foam.dao.HTTPSink',
    'foam.dao.Sink',
    'foam.nanos.logger.Loggers'
  ],
  
  properties: [
    {
      class: 'String',
      name: 'sfId',
    }
  ],
  
  methods: [
    {
      name: 'getDelegateSink',
      args: 'X agencyX, foam.nanos.ruler.Rule rule',
      type: 'foam.dao.Sink',
      javaCode: `
        SFManager sfManager = (SFManager) agencyX.get("sfManager");
        Sink sink = (Sink) sfManager.getSfs().get(getSfId());
        if ( sink == null ) {
          Loggers.logger(agencyX, this).error("SAF Sink not found, SFId", getSfId());
          throw new RuntimeException("SAF Sink not found");
         }
        return sink;
      `
    }
  ],
});