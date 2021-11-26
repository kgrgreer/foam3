/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.ruler',
  name: 'RuleActionMergeDecorator',

  documentation: `
    Merge calls occurring within mergeDelay period to the delegate rule action.

    Usage: Add RuleActionMergeDecorator to the 'action' of an async rule to
    merge repeated calls to the underlying rule action. For example,

      {
        class: 'foam.nanos.ruler.Rule',
        ...,
        async: true,
        action: {
          class: 'foam.nanos.ruler.RuleActionMergeDecorator',
          mergeDelay: 1000,
          delegate: {
            class: 'MyRuleAction'
          }
        }
      }
  `,

  implements: [ 'foam.nanos.ruler.RuleAction' ],

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.DirectAgency',
    'foam.core.X'
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
    }
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        if ( ! rule.getAsync() || getMergeDelay() <= 0 ) {
          getDelegate().applyAction(x, obj, oldObj, ruler, rule, agency);
          return;
        }

        var key = rule.getId() + ":" + obj.getProperty("id");
        ((DirectAgency) agency).schedule(x, new ContextAgent() {
          @Override
          public void execute(X x) {
            getDelegate().applyAction(x, obj, oldObj, ruler, rule, agency);
          }
        }, key, getMergeDelay());
      `
    }
  ]
});

