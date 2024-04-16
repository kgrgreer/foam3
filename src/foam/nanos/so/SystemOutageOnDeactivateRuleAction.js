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
  name: 'SystemOutageOnDeactivateRuleAction',
  implements: [ 'foam.nanos.ruler.RuleAction' ],

  documentation: 'Jobs to be executed when outage becomes inactive',

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
            List<SystemOutageTask> tasks = ((ArraySink) outage.getTasks(x).select(new ArraySink())).getArray();
            for ( var task : tasks ) {
              try {
                task = (SystemOutageTask) task.fclone();
                task.deactivate(x);
                outage.getTasks(x).put(task);
              } catch ( RuntimeException e ) {
                Loggers.logger(x, this).error("Failed to deactivate System Outage: " + task.toSummary(), "error : " + e);
              }
            }
          }
        }, "SystemOutageOnDeactivate");
      `
    }
  ]
});
