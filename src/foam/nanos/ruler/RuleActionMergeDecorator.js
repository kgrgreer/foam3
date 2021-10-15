/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.ruler',
  name: 'RuleActionMergeDecorator',

  documentation: 'Merge calls occurring within mergeDelay period to the delegate rule action.',

  implements: [ 'foam.nanos.ruler.RuleAction' ],

  javaImports: [
    'foam.nanos.logger.Logger',
    'java.util.Timer',
    'java.util.TimerTask'
  ],

  properties: [
    {
      class: 'FObjectProperty',
      of: 'foam.nanos.ruler.RuleAction',
      name: 'delegate'
    },
    {
      class: 'Int',
      name:  'mergeDelay',
      units: 'ms'
    },
    {
      class: 'Object',
      javaType: 'java.util.Timer',
      name: 'timer',
      javaFactory: 'return new Timer();'
    },
    {
      class: 'Map',
      name: 'taskQueue'
    }
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        var key = obj.hashCode();
        var task = (TimerTask) getTaskQueue().get(key);

        // Cancel task if not yet being executed
        if ( task != null
          && task.scheduledExecutionTime() - System.currentTimeMillis() > 0
        ) {
          task.cancel();InetAddress
          ((Logger) x.get("logger")).debug(
            "Merge repeated execution of Rule id:" + rule.getId(), obj);
        }

        // Schedule the delegate rule action call
        task = new TimerTask() {
          @Override
          public void run() {
            getDelegate().applyAction(x, obj, oldObj, ruler, rule, agency);
            getTaskQueue().remove(key);
          }
        };
        getTaskQueue().put(key, task);
        getTimer().schedule(task, getMergeDelay());
      `
    }
  ]
});

