/**
  * @license
  * Copyright 2024 The FOAM Authors. All Rights Reserved.
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
  package: 'foam.nanos.so',
  name: 'OrphanedTaskDeactivateRuleAction',
  implements: [ 'foam.nanos.ruler.RuleAction' ],

  documentation: 'Disactivates task when it is removed from an active system outage',

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.logger.Loggers'
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        SystemOutageTask newTask = (SystemOutageTask) obj;
        SystemOutageTask oldTask = (SystemOutageTask) oldObj;

        agency.submit(x, new ContextAgent() {
          @Override
          public void execute(X x) {
            SystemOutage outage = oldTask.findOutage(x);
            if ( outage == null ) {
              Loggers.logger(x, this).error("outage not found", "outage", oldTask.getOutage(), "task", oldTask.getId());
              return;
            }
    
            if ( outage.getActive() ) {
              newTask.deactivate(x);
              Loggers.logger(x, this).error("Disactivated task", newTask.getId());
            }
          }
        }, "Orphaned Task Deactivate");
        
      `
    }
  ]
})
