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
  name: 'PauseComplianceTransactionTask',
  implements: ['foam.nanos.so.SystemOutageTask'],

  documentation: `
    System outage task that pauses compliance transactions.
    Note that persist method needs to be called after change to this task to persist the change.
  `,

  javaImports: [
    'foam.core.X',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.nanos.auth.LifecycleState',
    'foam.nanos.logger.Loggers',
    'foam.nanos.ruler.Rule',
    'foam.nanos.ruler.RuleAction',
    'foam.nanos.so.SystemOutage',
    'foam.nanos.so.SystemOutageTask',
    'java.util.Arrays',
    'java.util.List',
    'java.util.ArrayList',
    'net.nanopay.tx.ComplianceTransaction',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.model.TransactionStatus'
  ],

  messages: [
    { name: 'RULE_TEMPLATE_ID', message: '4dae09e9-58fc-4639-bac3-a17a496bdf8b' }
  ],

  properties: [
    {
      class: 'StringArray',
      name: 'corridors',
      documentation: 'a list of corridors which is used to determine which transactions to pause'
    },
    {
      class: 'Reference',
      of: 'foam.nanos.ruler.Rule',
      name: 'rule',
      documentation: 'id of the rule that pauses a pending compliance transaction. The rule is created by this task',
      visibility: 'RO'
    },
    {
      class: 'List',
      name: 'pausedTransactions',
      javaType: 'List<ComplianceTransaction>',
      javaFactory: 'return new ArrayList();',
      documentation: `
        A list of transactions that are paused by this task. The list is cleared once the task is detactivated.
      `,
      // hidden: true
    }
  ],

  methods: [
    {
      name: 'activate',
      javaCode: `
        if ( getRule().isEmpty() ) {
          Rule pauseRule = createRule(x);
          setRule(pauseRule.getId());
          persist(x);       
        } else {
          // enable the pause rule
          Rule pauseRule = findRule(x);
          if ( pauseRule == null ) {
            Loggers.logger(x, this).error("No rule found to be enabled");
            return;
          }
          pauseRule = (Rule) pauseRule.fclone();
          pauseRule.setEnabled(true);
          ((DAO) x.get("ruleDAO")).put(pauseRule);
        }
      `
    },
    {
      name: 'deactivate',
      javaCode: `
        Rule pauseRule = findRule(x);
        if ( pauseRule == null ) {
          Loggers.logger(x, this).error("No rule found to be disabled");
          return;
        }

        pauseRule = (Rule) pauseRule.fclone();
        pauseRule.setEnabled(false);
        ((DAO) x.get("ruleDAO")).put(pauseRule);
        
        for ( ComplianceTransaction paused : getPausedTransactions() ) {
          // Unpause
          paused.setStatus(TransactionStatus.PENDING_PARENT_COMPLETED);
          ((DAO) x.get("localTransactionDAO")).put(paused);
          Loggers.logger(x, this).info("Txn: " + paused.getId() + " was unpaused");
        }
        getPausedTransactions().clear();
        persist(x);
      `
    },
    {
      name: 'cleanUp',
      args: 'X x',
      javaCode: `
        Loggers.logger(x, this).info("Cleaning up task", getId());

        deactivate(x);
        Loggers.logger(x, this).info("Deativated task", getId());
        
        ((DAO) x.get("ruleDAO")).remove(findRule(x));
        Loggers.logger(x, this).info("Removed task rule", "task", getId(), "rule", getRule());
      `
    },
    {
      visibility: 'private',
      type: 'Rule',
      name: 'createRule',
      args: 'X x',
      javaCode: `
        DAO ruleDAO = (DAO) x.get("ruleDAO");
        Rule pauseRule = (Rule) ruleDAO.find(RULE_TEMPLATE_ID).fclone();
        pauseRule.clearId();
        pauseRule.setName("Pause Transaction Rule_" + getId());
        pauseRule.setEnabled(true);
        pauseRule.setLifecycleState(LifecycleState.ACTIVE);
        pauseRule.setAction(new PauseComplianceTransactionRuleAction.Builder(x)
          .setSystemOutage(getSystemOutage())
          .setTaskId(getId())
          .build()
        );
        return ((Rule) ruleDAO.put(pauseRule));
      `
    },
    {
      name: 'persist',
      args: 'X x',
      documentation: 'Need to put system outage on which this task is to persist change to the task',
      javaCode: `
        SystemOutage so = findSystemOutage(x);
        if ( so == null )  {
          Loggers.logger(x, this).error("Failed to persist task", getId());
          return;
        }

        so = (SystemOutage) so.fclone();
        SystemOutageTask[] tasks = so.getTasks();
        for ( int i = 0; i < tasks.length; i++ ) {
          if ( tasks[i].getId().equals(getId()) ) {
            tasks[i] = this;
            ((DAO) x.get("systemOutageDAO")).put(so); 
            return;
          }
        }
      `
    },
    {
      type: 'Boolean',
      name: 'hasCorridor',
      args: 'X x, Transaction txn',
      documentation: 'Returns true if txn or its children txn \'s corridor is in corridors',
      javaCode: `
        if ( Arrays.stream(getCorridors()).anyMatch(txn.getCorridor()::equals) ) {
          return true;
        }

        List<Transaction> children = ((ArraySink) txn.getChildren(x).select(new ArraySink())).getArray();
        for ( Transaction child : children ) {
          // Return true if one of children has a matching corridor, otherwise check the next child
          if ( hasCorridor(x, child) ) return true;
        }

        // Checked the root and all of its children but none of them had a matching corridor
        return false;
      `
    }
  ]
});
