/**
* @license
* Copyright 2021 The FOAM Authors. All Rights Reserved.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*     http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
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