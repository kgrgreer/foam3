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
    'foam.dao.Sink',
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
    }
  ],
  
  methods: [
    {
      name: 'getDelegateSink',
      args: 'X agencyX, foam.nanos.ruler.Rule rule',
      type: 'foam.dao.Sink',
      javaCode: `
        DAO sfDAO = (DAO) agencyX.get("SFDAO");
        Sink sink = (Sink)sfDAO.find_(agencyX, getSfId());
        if ( sink == null ) throw new RuntimeException("SFId: " + getSfId() + " Not Found!!");
        return sink;
      `
    }
  ],
  
  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(foam.java.Code.create({
          data: `
          `
        }));
      }
    }
  ]
});