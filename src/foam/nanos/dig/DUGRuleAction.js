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
    'foam.dao.Sink',
    'foam.log.LogLevel',
    'foam.nanos.auth.Subject',
    'foam.nanos.auth.User',
    'foam.nanos.alarming.Alarm',
    'foam.nanos.alarming.AlarmReason',
    'foam.nanos.logger.Logger',
    'foam.nanos.dig.HTTPDigestSink',
    'foam.nanos.logger.PrefixLogger',
    'foam.nanos.pm.PM',
    'foam.util.SafetyUtil'
  ],

  properties: [
    {
      class: 'String',
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
      class: 'String',
      name: 'loopbackPath',
      value: 'service/dugLoopbackBucket'
    }
  ],

  methods: [
    {
      name: 'getLogger',
      type: 'foam.nanos.logger.Logger',
      args: [ { name: 'x', type: 'Context' } ],
      javaCode: `
        return new PrefixLogger(new Object[] {
          this.getClass().getSimpleName()
        }, (Logger) x.get("logger"));
      `
    },
    {
      name: 'getDelegateSink',
      args: 'X agencyX, foam.nanos.ruler.Rule rule',
      type: 'foam.dao.Sink',
      javaCode: `
        DAO dugDigestConfigDAO = (DAO) agencyX.get("dugDigestConfigDAO");
        DUGDigestConfig dugDigestConfig = (DUGDigestConfig) dugDigestConfigDAO.find(rule.getSpid());
        DUGRule dugRule = (DUGRule) rule;
        AbstractSink sink = null;
        String url = getUrl();
        boolean loopback = "loopback".equals(url);
        if ( loopback ) {
            StringBuilder sb = new StringBuilder();
            // TODO: what to test to know running https
            sb.append("http://");
            sb.append(System.getProperty("hostname", "localhost"));
            sb.append(":");
            sb.append(System.getProperty("http.port", "8080"));
            sb.append("/");
            sb.append(getLoopbackPath());
            url = sb.toString();
        }
        if ( dugDigestConfig != null &&
             dugDigestConfig.getEnabled() ) {
            sink = new HTTPDigestSink(
              url,
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
              url,
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
        ((HTTPSink) sink).setLoopback(loopback);
        return sink;
      `
    },
    {
      name: 'applyAction',
      javaCode: `
      final var dugRule = (DUGRule) rule;
      if ( dugRule.getActAsUser() ) {
        // If the actingUser is set, we want to refind the obj with that user as the subject
        // The goal with this is to filter the permissioned properties based on acting user
        // Instead of the user that triggered the rule
        final var actingUserId = dugRule.getActingUser();
        getLogger(x).debug(this.getClass().getSimpleName(), "Checking actingUser on DUG webhook", actingUserId, obj.getProperty("id"));
        if ( actingUserId != 0 ) {
          final var userDAO = (DAO) x.get("bareUserDAO");
          final var actingUser = (User) userDAO.find(actingUserId);
          if ( actingUser == null ) {
            getLogger(x).error("DUGRule ", dugRule.getId(), " has acting user but user couldn't be found");
            return;
          }
          if ( SafetyUtil.isEmpty(dugRule.getSecureDaoKey()) ) {
            getLogger(x).debug("DUGRule ", dugRule.getId(), " has acting user but secure DAO key couldn't be found");
          }
          final var daoKey = SafetyUtil.isEmpty(dugRule.getSecureDaoKey()) ? dugRule.getDaoKey() : dugRule.getSecureDaoKey();
          final var actingX = x.put("group", null).put("subject", new Subject.Builder(x).setUser(actingUser).build());
          final var objDAO = (DAO) actingX.get(daoKey);
          if ( objDAO == null ) {
            getLogger(x).error("DUGRule ", dugRule.getId(), " has acting user but ", dugRule.getSecureDaoKey(), " wasn't in context");
            return;
          }
          obj = objDAO.inX(actingX).find(obj.getProperty("id"));
        }
        if ( obj == null )
          return;
      }
      getLogger(x).debug(this.getClass().getSimpleName(), "Sending DUG webhook", obj);
      
      final var finalObj = obj;
      agency.submit(x, (agencyX) -> {
        PM pm = PM.create(x, true, getClass().getSimpleName(), rule.getDaoKey(), rule.getName());
        try {
          Sink sink = getDelegateSink(agencyX, rule);
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
