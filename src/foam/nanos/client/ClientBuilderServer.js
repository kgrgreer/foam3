/**
* @license
* Copyright 2024 The FOAM Authors. All Rights Reserved.
* http://www.apache.org/licenses/LICENSE-2.0
*/


foam.INTERFACE({
  package: 'foam.nanos.client',
  name: 'ClientBuilderService',

  client: true,
  skeleton: true,
  proxy: true,

  methods: [
    {
      name: 'getFullClient',
      args: 'Context x, foam.mlang.sink.Projection proj',
      // Returns a map of subject, theme, appConfig and available nspecs
      type: 'java.util.Map',
      async: true
    },
    {
      name: 'getClient',
      // TODO: maybe let client add a query
      args: 'Context x, foam.mlang.sink.Projection proj',
      // Returns a Projection of available nspecs
      type: 'foam.mlang.sink.Projection',
      async: true
    },
    {
      name: 'getAppConfig',
      args: 'Context x',
      type: 'foam.nanos.app.AppConfig',
      async: true
    },
    {
      name: 'getTheme',
      args: 'Context x',
      type: 'foam.nanos.theme.Theme',
      async: true
    },
    {
      name: 'getSubject',
      args: 'Context x',
      type: 'foam.nanos.auth.Subject',
      async: true
    }
  ]
});

foam.CLASS({
  package: 'foam.nanos.client',
  name: 'BaseClientBuilderService',

  implements: [
    'foam.nanos.client.ClientBuilderService'
  ],

  javaImports: [
    'foam.nanos.auth.AuthService',
    'foam.nanos.theme.Theme',
    'foam.nanos.theme.Themes',
    'foam.nanos.auth.Subject',
    'foam.dao.DAO',
    'foam.dao.ArraySink',
    'foam.nanos.logger.Loggers',
    'foam.mlang.sink.Projection',
    'foam.mlang.Expr',
    'java.util.ArrayList',
    'static foam.mlang.MLang.*',
    'java.util.HashMap',
    'java.util.Map',
    'foam.nanos.boot.NSpec',
    'foam.nanos.logger.Logger',
    'foam.nanos.app.AppConfig',
    'foam.nanos.session.Session',
    'foam.nanos.auth.AuthenticationException'
  ],

  methods: [
    {
      name: 'getFullClient',
      args: 'Context x, foam.mlang.sink.Projection proj',
      type: 'java.util.Map',
      async: true,
      javaCode: `
        Subject sub          = getSubject(x);
        Session session      = x.get(Session.class);

        // Use session context going forward as the user might have been assigned a new session
        foam.core.X newX = session.getContext();
        
        Theme theme = getTheme(newX);

        AppConfig appConfig = getAppConfig(newX);

        DAO nSpecDAO = ((DAO) x.get("nSpecDAO")).inX(newX);
        nSpecDAO.where(EQ(NSpec.SERVE, true)).select(proj);
       
        Map<String, Object> retMap = new HashMap<>();
        if ( sub != null ) {
          retMap.put("subject", sub);
        }
        if ( appConfig != null ) {
          retMap.put("appConfig", appConfig);
        }
        if ( theme != null ) {
          retMap.put("theme", theme);
        }
        if ( proj != null) {
          retMap.put("nSpecs", proj);
        }
        return retMap;
      `
    },
    {
      name: 'getClient',
      // TODO: maybe let client add a query
      args: 'Context x, foam.mlang.sink.Projection proj',
      type: 'foam.mlang.sink.Projection',
      async: true,
      javaCode: `
        // Required as a new session might need to authorize an anon user which changed context to select in
        Subject sub     = getSubject(x);
        Session session = x.get(Session.class);
        // Use session context going forward as the user might have been assigned a new session
        foam.core.X newX = session.getContext();
        DAO nSpecDAO = ((DAO) x.get("nSpecDAO")).inX(newX);
        nSpecDAO.where(EQ(NSpec.SERVE, true)).select(proj);
        // Figure out why this doesnt work
        // java.util.List<Object[]> specs = proj.getArray();
        return proj;
      `
    },
    {
      name: 'getAppConfig',
      args: 'Context x',
      type: 'foam.nanos.app.AppConfig',
      async: true,
      javaCode: `
        Logger logger       = Loggers.logger(x, this);
        return (foam.nanos.app.AppConfig) x.get("appConfig");
      `
    },
    {
      name: 'getTheme',
      args: 'Context x',
      type: 'foam.nanos.theme.Theme',
      async: true,
      javaCode: `
        Session session      = x.get(Session.class);
        return (Theme) ((Themes) x.get("themes")).findTheme(session.getContext());
      `
    },
    {
      name: 'getSubject',
      args: 'Context x',
      type: 'foam.nanos.auth.Subject',
      async: true,
      javaCode: `
        AuthService auth     = (AuthService) x.get("auth");
        try {
          return (Subject) auth.getCurrentSubject(x);
        } catch ( AuthenticationException e ) {
          /* 
           * No-op:
           * Suppress auth exceptions as it is normal to request and
           * not find a subject for a new session
          */
          return null;
        }
      `
    }
  ]
});
