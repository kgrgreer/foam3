/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.analytics.ruler',
  name: 'LogAnalyticEventRuleAction',

  implements: [
    'foam.nanos.ruler.RuleAction'
  ],

  imports: [
    'logAnalyticEvent'
  ],

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.PropertyInfo',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.analytics.AnalyticEvent',
    'foam.nanos.session.Session',
    'java.util.Date'
  ],

  properties: [
    {
      name: 'eventName',
      class: 'String'
    },
    {
      name: 'traceIdExpr',
      class: 'foam.mlang.ExprProperty'
    },
    {
      name: 'tags',
      class: 'StringArray'
    }
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        agency.submit(x, new ContextAgent() {
          @Override
          public void execute(X x) {
            var evt = {
              name:    getEventName(),
              traceId: getTraceId(obj),
              extras:  obj.getClass().getSimpleName() + " " + rule.getOperation().toString()
            };

            if ( getTags().length > 0 ) evt.tags = getTags_(obj)

            this.logAnalyticEvent(evt);
        }, "Log Analytic Event");
      `
    },
    {
      name: 'getTraceId',
      type: 'String',
      args: 'FObject obj',
      javaCode: `
        var expr = getTraceIdExpr();
        var result = expr != null ? expr.f(obj) : obj.getProperty("id");
        return String.valueOf(result);
      `
    },
    {
      name: 'getTags_',
      type: 'String[]',
      args: 'FObject obj',
      javaCode: `
        var tags = new String[getTags().length];
        for ( var i = 0; i < getTags().length; i++ ) {
          var prop = (PropertyInfo) obj.getClassInfo().getAxiomByName(getTags()[i]);
          tags[i] = String.valueOf(prop != null ? prop.f(obj) : getTags()[i]);
        }
        return tags;
      `
    }
  ]
});
