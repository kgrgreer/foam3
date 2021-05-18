/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.dig',
  name: 'DUGRuleAction',

  documentation: 'Rule action for DUG',

  implements: [
    'foam.nanos.ruler.RuleAction'
  ],

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.dao.HTTPSink',
    'foam.log.LogLevel',
    'foam.nanos.alarming.Alarm',
    'foam.nanos.alarming.AlarmReason',
    'foam.nanos.pm.PM'
  ],

  properties: [
    {
      class: 'URL',
      name: 'url'
    },
    {
      class: 'String',
      name: 'bearerToken'
    },
    {
      class: 'foam.core.Enum',
      of: 'foam.nanos.http.Format',
      name: 'format'
    }
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
      final var dugRule = (DUGRule) rule;
        
      agency.submit(x, new ContextAgent() {
        @Override
        public void execute(X x) {
          PM pm = new PM(getClass(), rule.getDaoKey(), rule.getName());
          try {
            final var sink = new HTTPSink(
              dugRule.getUrl(),
              dugRule.evaluateBearerToken(),
              dugRule.getFormat(),
              new foam.lib.AndPropertyPredicate(
                x,
                new foam.lib.PropertyPredicate[] {
                  new foam.lib.ExternalPropertyPredicate(),
                  new foam.lib.NetworkPropertyPredicate(),
                  new foam.lib.PermissionedPropertyPredicate()
                }
              ),
              true
            );

            sink.setX(x);
            sink.put(obj, null);
          } catch (Throwable t) {
            var alarmDAO = (DAO) x.get("alarmDAO");
            alarmDAO.put(
              new Alarm.Builder(x)
                .setName("DUG/"+rule.getDaoKey() + "/" + rule.getName())
                .build()
            );
            pm.error(x);
          } finally {
            pm.log(x);
          }
        }
      }, "DUG Rule (url: " + getUrl() + " )");
      `
    }
  ]
});
