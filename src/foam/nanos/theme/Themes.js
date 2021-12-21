/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.theme',
  name: 'Themes',

  documentation: `Support methods for Theme`,

  axioms: [ foam.pattern.Singleton.create() ],

  implements: [
    'foam.mlang.Expressions',
  ],

  requires: [
    'foam.nanos.theme.ThemeDomain',
  ],

  imports: [
    'themeDAO',
    'themeDomainDAO'
  ],

  javaImports: [
    'foam.dao.DAO',
    'foam.mlang.MLang',
    'foam.nanos.app.AppConfig',
    'foam.nanos.auth.Group',
    'foam.nanos.auth.Subject',
    'foam.nanos.auth.User',
    'foam.nanos.logger.Logger',
    'foam.util.SafetyUtil',
    'javax.servlet.http.HttpServletRequest',
    'org.eclipse.jetty.server.Request'
  ],

  methods: [
    {
      documentation: `Acquire theme through users spid.
Later themes:
1. domain
2. group
3. user`,
      name: 'findTheme',
      type: 'foam.nanos.theme.Theme',
      args: [
        {
          name: 'x',
          type: 'Context'
        }
      ],
      code: async function(x) {
        var theme;
        var themeDomain;
        var domain = window && window.location.hostname || 'localhost';
        var user = x.subject.user;
        if ( domain ) {
          console.debug('domain', domain);
          themeDomain = await this.themeDomainDAO.find(domain);
          if ( ! themeDomain &&
               'localhost' != domain ) {
            themeDomain = await this.themeDomainDAO.find('localhost');
          }
          if ( themeDomain ) {
            var predicate = this.AND(
              this.EQ(foam.nanos.theme.Theme.ID, themeDomain.theme),
              this.EQ(foam.nanos.theme.Theme.ENABLED, true)
            );
            theme = await this.themeDAO.find(predicate);
          }
        }

        if ( user && ( ! theme || domain !== themeDomain.id || user.spid !== theme.spid ) ) {
          var spid = user.spid;
          while ( spid ) {
            theme = await this.themeDAO.find(
              this.AND(
                this.EQ(foam.nanos.theme.Theme.SPID, spid),
                this.EQ(foam.nanos.theme.Theme.ENABLED, true)));
            if ( theme ) break;

            var pos = spid.lastIndexOf('.');
            spid = spid.substring(0, pos > 0 ? pos : 0);
          }
        }

        if ( ! theme ) {
          console && console.warn('Theme not found', domain);
        }

        var group = x.group;
        if ( user && group ) { // non-null when logged in.
          var group = await user.group$find;
          var defaultMenu = group && group.defaultMenu;
          while ( group ) {
            var groupTheme = await group.theme$find;
            if ( groupTheme ) {
              if ( theme && ! foam.util.equals(theme, groupTheme) ) {
                theme = theme.merge(groupTheme);
              } else {
                theme = groupTheme;
              }
              break;
            }
            group = await group.parent$find;
          }

          if ( !! defaultMenu && theme && ! theme.defaultMenu) {
            theme.defaultMenu = defaultMenu;
            theme.logoRedirect = defaultMenu;
          }

          var userTheme = await user.theme$find;
          if ( userTheme && ! foam.util.equals(theme, userTheme) ) {
            theme = theme && theme.merge(userTheme) || userTheme;
          }
        }
        if ( theme ) {
          if ( theme.customRefinement ) await x.__subContext__.classloader.load(theme.customRefinement, []);
          return theme;
        }

        return foam.nanos.theme.Theme.create({ 'name': 'foam', 'appName': 'FOAM' });
      },
      javaCode: `
      // TODO:  cache domain/theme and update on ThemeDAO changes.
      Logger logger = (Logger) x.get("logger");
      DAO themeDAO = ((DAO) x.get("themeDAO"));
      Theme theme = null;
      ThemeDomain td = null;
      String domain = null;
      User user = ((Subject) x.get("subject")).getUser();
      HttpServletRequest req = x.get(HttpServletRequest.class);
      if ( req != null ) {
        domain = req.getServerName();
        // logger.debug("Themes", "domain", domain);
     }

      // Find theme from themeDomain via domain
      if ( domain != null ) {
        var themeDomainDAO = (DAO) x.get("themeDomainDAO");
        td = (ThemeDomain) themeDomainDAO.find(domain);
        // if ( td == null ) {
        //   logger.debug("Themes", "ThemeDomain not found", domain);
        // }
        if ( td == null &&
             ! "localhost".equals(domain) ) {
          td = (ThemeDomain) themeDomainDAO.find("localhost");
          // if ( td == null ) {
          //   logger.debug("Themes", "ThemeDomain not found", "localhost");
          // }
        }
        if ( td != null ) {
          theme = (Theme) themeDAO.find(
            MLang.AND(
              MLang.EQ(Theme.ID, td.getTheme()),
              MLang.EQ(Theme.ENABLED, true)
            ));
          // if ( theme == null ) {
          //   logger.debug("Themes", "Theme not found", td.getTheme());
          // }
        }
      }

      // Find theme from user via SPID
      if ( user != null
        && ( theme == null || ! td.getId().equals(domain) || ! user.getSpid().equals(theme.getSpid()) )
      ) {
        var spid = user.getSpid();
        while ( ! SafetyUtil.isEmpty(spid) ) {
          theme = (Theme) themeDAO.find(
            MLang.AND(
              MLang.EQ(Theme.SPID, spid),
              MLang.EQ(Theme.ENABLED, true)
            )
          );
          if ( theme != null ) break;

          var pos = spid.lastIndexOf(".");
          spid = spid.substring(0, pos > 0 ? pos : 0);
        }
      }

      if ( theme == null ) {
        logger.debug("Themes", "fallback");
        theme = (Theme) themeDAO.find(
          MLang.AND(
            MLang.EQ(Theme.NAME, "foam")
          ));
        if ( theme == null ) {
          theme = new Theme.Builder(x).setName("foam").setAppName("FOAM").build();
        }
      }

      // Merge the theme with group and user themes
      if ( user != null ) {
        DAO groupDAO = (DAO) x.get("groupDAO");
        Group group = user.findGroup(x);
        var defaultMenu = group != null ? group.getDefaultMenu() : "";
        while ( group != null ) {
          Theme groupTheme = group.findTheme(x);
          if ( groupTheme != null && ! SafetyUtil.equals(theme, groupTheme) ) {
            theme = theme.merge(groupTheme);
            break;
          }
          group = (Group) groupDAO.find(group.getParent());
        }

        // Use default menu from user group if present
        if ( ! SafetyUtil.isEmpty(defaultMenu) ) {
          theme.setDefaultMenu(defaultMenu);
          theme.setLogoRedirect(defaultMenu);
        }

        Theme userTheme = user.findTheme(x);
        if ( userTheme != null && ! SafetyUtil.equals(theme, userTheme) ) {
          theme = theme.merge(userTheme);
        }
      }

      // test appConfig url, if not default, set to domain
      AppConfig appConfig = theme.getAppConfig();
      if ( appConfig == null ) {
        appConfig = new AppConfig();
        theme.setAppConfig(appConfig);
      }
      if ( ! AppConfig.URL.isSet(appConfig) ||
           // isDefaultValue does not test the models default property
           // AppConfig.URL.isDefaultValue(appConfig) )  {
           SafetyUtil.compare(appConfig.getUrl(), "http://localhost") == 0 ) {
        if ( req != null ) {
          appConfig.setUrl(((Request) req).getRootURL().toString());
        } else if ( ! SafetyUtil.isEmpty(domain) ) {
          appConfig.setUrl("https://"+domain);
        }
      }

      return theme;
      `
    }
  ]
});
