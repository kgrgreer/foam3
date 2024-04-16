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
  name: 'SystemOutageRemoveRuleAction',
  implements: [ 'foam.nanos.ruler.RuleAction' ],

  documentation: 'Executes any jobs need to be done before system outage is removed',

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.dao.ArraySink',
    'foam.nanos.logger.Loggers',
    'java.util.List'
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        SystemOutage outage = (SystemOutage) obj;

        agency.submit(x, new ContextAgent() {
          @Override
          public void execute(X x) {
            // Deactivate all tasks belonged to active outage
            if ( outage.getActive() ) {
              List<SystemOutageTask> tasks = ((ArraySink) outage.getTasks(x).select(new ArraySink())).getArray();
              for ( SystemOutageTask task : tasks ) {
                task = (SystemOutageTask) task.fclone();
                task.deactivate(x);
                outage.getTasks(x).put(task);
                Loggers.logger(x, this).info("Deactivated task", task.getId());
              }
            }
          }
        }, "SystemOutageRemove");
      `
    }
  ]
})
