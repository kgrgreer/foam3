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
    'foam.dao.AbstractSink',
    'foam.dao.DAO',
    'foam.dao.HTTPSink',
    'foam.log.LogLevel',
    'foam.nanos.auth.Subject',
    'foam.nanos.auth.User',
    'foam.nanos.alarming.Alarm',
    'foam.nanos.alarming.AlarmReason',
    'foam.nanos.logger.Logger',
    'foam.nanos.dig.HTTPDigestSink',
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
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'actingUser'
    }
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
      final var dugRule = (DUGRule) rule;

      // If the actingUser is set, we want to refind the obj with that user as the subject
      // The goal with this is to filter the permissioned properties based on acting user
      // Instead of the user that triggered the rule

      if ( actingUserIsSet_ ) {
        final var userDAO = (DAO) x.get("bareUserDAO");
        final var user = (User) userDAO.find(actingUser_);

        final var groupDAO = (DAO) x.get("localGroupDAO");
        final var group = groupDAO.find(user.getGroup());

        if ( user != null && group != null ) {
          final var actingX = x.put("group", group);
          final var objDAO = (DAO) actingX.get(rule.getDaoKey());
          if ( objDAO != null ) {
            obj = objDAO.inX(actingX).find(obj.getProperty("id"));
          }
        }
      }

      ((Logger) x.get("logger")).debug(this.getClass().getSimpleName(), "Sending DUG webhook", obj);  
      
      final var finalObj = obj;
      agency.submit(x, (agencyX) -> {
        PM pm = new PM(getClass(), rule.getDaoKey(), rule.getName());
        DAO dugDigestConfigDAO = (DAO) agencyX.get("dugDigestConfigDAO");
        DUGDigestConfig dugDigestConfig = (DUGDigestConfig) dugDigestConfigDAO.find(rule.getSpid());
        try {
          AbstractSink sink = null;
          if ( dugDigestConfig != null && dugDigestConfig.getEnabled() ) {
            sink = new HTTPDigestSink(
              dugRule.getUrl(),
              dugRule.evaluateBearerToken(),
              dugDigestConfig,
              dugRule.getFormat(),
              new foam.lib.AndPropertyPredicate(
                agencyX,
                new foam.lib.PropertyPredicate[] {
                  new foam.lib.ExternalPropertyPredicate(),
                  new foam.lib.NetworkPropertyPredicate(),
                  new foam.lib.PermissionedPropertyPredicate()
                }
              ),
              true,
              true
            );
          } else {
            sink = new HTTPSink(
              dugRule.getUrl(),
              dugRule.evaluateBearerToken(),
              dugRule.getFormat(),
              new foam.lib.AndPropertyPredicate(
                agencyX,
                new foam.lib.PropertyPredicate[] {
                  new foam.lib.ExternalPropertyPredicate(),
                  new foam.lib.NetworkPropertyPredicate(),
                  new foam.lib.PermissionedPropertyPredicate()
                }
              ),
              true
            );
          }

          sink.setX(agencyX);
          sink.put(finalObj, null);
        } catch (Throwable t) {
          ((Logger) agencyX.get("logger")).error(this.getClass().getSimpleName(), "Error Sending DUG webhook", t);
          var alarmDAO = (DAO) agencyX.get("alarmDAO");
          alarmDAO.put(
            new Alarm.Builder(agencyX)
              .setName("DUG/"+rule.getDaoKey() + "/" + rule.getName())
              .build()
          );
          pm.error(agencyX);
        } finally {
          pm.log(agencyX);
        }
      }, "DUG Rule (url: " + getUrl() + " )");
      `
    }
  ]
});
