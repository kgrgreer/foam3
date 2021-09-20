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
  name: 'DUGSFRule',
  extends: 'foam.nanos.dig.DUGRule',
  
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