
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
  name: 'PauseComplianceTransactionRuleAction',
  implements: [ 'foam.nanos.ruler.RuleAction' ],

  documentation: `
    First uses system outage id and task id to find task. Then pauses the transaction
    if the task's corridors has the transaction's corridor. 
  `,

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.logger.Loggers',
    'foam.nanos.so.SystemOutage',
    'foam.nanos.so.SystemOutageTask',
    'foam.util.SafetyUtil',
    'java.util.Arrays',
    'java.util.List',
    'net.nanopay.tx.ComplianceTransaction',
    'net.nanopay.tx.model.TransactionStatus'
  ],

  properties: [
    {
      class: 'Reference',
      of: 'foam.nanos.so.SystemOutage',
      name: 'systemOutage',
    },
    {
      class: 'String',
      name: 'taskId'
    }
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        
        agency.submit(x, new ContextAgent() {
          @Override
          public void execute(X x) {
            ComplianceTransaction txn = (ComplianceTransaction) obj;
            
            SystemOutage so = findSystemOutage(x);
            if ( so == null ) {
              Loggers.logger(x, this).error("System outage not found", "systemOutageId", getSystemOutage());
              return;
            }

            so = (SystemOutage) so.fclone();

            // Get pauseComplianceTransactionTask from system outage
            PauseComplianceTransactionTask task = null;
            for ( SystemOutageTask curTask : se.getTasks() ) {
              if ( SafetyUtil.equals(curTask.getId(), getTaskId()) &&
                  (curTask instanceof PauseComplianceTransactionTask) ) {
                task = (PauseComplianceTransactionTask) curTask;
              }
            }

            if ( task == null ) {
              Loggers.logger(x, this).error("Task not found",
                "systemOutageId", getSystemOutage(), "taskId", getTaskId());
              return;
            }

            // Check if the transaction's corridor is in the corridors specified in the task
            if ( ! task.hasCorridor(x, txn) ) {
              Loggers.logger(x, this).info("No matching corridor found",
                "systemOutageId", getSystemOutage(), "taskId", getTaskId(),
                "corridors", Arrays.toString(task.getCorridors()));
              return;
            }

            // Pause the transaction
            txn.setStatus(TransactionStatus.PAUSED);
            txn = (ComplianceTransaction) ((DAO) x.get("localTransactionDAO")).put(txn).fclone();

            // Add the transaction to the task
            task.getPausedTransactions().add(txn);
            task.persist(x);
          }
        }, "Pause Compliance Transaction");
      `
    }
  ]
})
