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
  package: 'foam.nanos.so.task',
  name: 'PauseTaskOnRemoveRuleAction',
  implements: [ 'foam.nanos.ruler.RuleAction' ],

  documentation: 'Cleans up on pause-compliacne-transaction task removal',

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.dao.Operation',
    'foam.nanos.logger.Loggers',
    'foam.nanos.so.SystemOutage',
    'foam.nanos.so.SystemOutageTask',
    'java.util.ArrayList',
    'java.util.Arrays',
    'java.util.List'
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        SystemEvent newSo = (SystemOutage) obj;
        SystemEvent oldSo = (SystemOutage) ((DAO) x.get("systemOutageDAO")).find(newSo.getId());

        agency.submit(x, new ContextAgent() {
          @Override
          public void execute(X x) {
            // Find removed pause-compliance-transaction tasks
            List<PauseComplianceTransactionTask> removedTasks = findRemovedTasks(x, newSo, oldSo, rule.getOperation());

            // Clean up removed pause-compliance-transaction tasks
            cleanUp(x, removedTasks);
          }
        }, "Pause Compliacne Transaction Task On Remove");
      `
    },
    {
      visibility: 'private',
      javaType: 'List<PauseComplianceTransactionTask>',
      name: 'findRemovedTasks',
      args: 'X x, SystemOutage newSo, SystemOutage oldSo, Operation op',
      javaCode: `
        List<PauseComplianceTransactionTask> removedTasks = new ArrayList<>();
        if ( op == Operation.REMOVE ) {
          // All tasks are removed
          for ( SystemOutageTask task : newSo.getTasks() ) {
            if ( task instanceof PauseComplianceTransactionTask ) {
              removedTasks.add((PauseComplianceTransactionTask) task);
            }
          }

        } else if ( op == Operation.UPDATE ) {
          // Find tasks that are only in old system event
          for ( SystemOutageTask task : oldSo.findNonOverlappingTasks(x, newSo) ) {
            if ( (task instanceof PauseComplianceTransactionTask) ) {
              removedTasks.add((PauseComplianceTransactionTask) task);
            }
          }
        }

        return removedTasks;
      `
    },
    {
      visibility: 'private',
      name: 'cleanUp',
      args: 'X x, List<PauseComplianceTransactionTask> removedTasks',
      javaCode: `
        for ( PauseComplianceTransactionTask task : removedTasks ) {
          Loggers.logger(x, this).info("Cleaning up task", task.getId());

          task.deactivate(x);
          Loggers.logger(x, this).info("Deativated task", task.getId());
          
          ((DAO) x.get("ruleDAO")).remove(task.findRule(x));
          Loggers.logger(x, this).info("Removed task rule",
            "task", task.getId(), "rule", task.getRule());
        }
      `
    }
  ]
})
