/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.servlet',
  name: 'VirtualHostRoutingServlet',

  implements: [
    'foam.nanos.servlet.Servlet'
  ],

  javaImports: [
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.app.AppConfig',
    'foam.nanos.jetty.HttpServer',
    'foam.nanos.logger.Logger',
    'foam.nanos.theme.Theme',
    'foam.nanos.theme.ThemeDomain',
    'foam.util.SafetyUtil',
    'java.io.IOException',
    'java.io.PrintWriter',
    'java.util.HashMap',
    'javax.servlet.http.HttpServletRequest',
    'javax.servlet.ServletConfig',
    'javax.servlet.ServletException',
    'javax.servlet.ServletRequest',
    'javax.servlet.ServletResponse'
  ],

  properties: [
    {
      class: 'Map',
      name: 'customHostMapping',
      documentation: `Custom host mapping that will directly serve the index file for the specified virtual host.`
    },
    {
      class: 'String',
      name: 'defaultHost'
    },
    {
      class: 'Object',
      transient: true,
      javaType: 'ServletConfig',
      name: 'servletConfig'
    },
    {
      class: 'String',
      name: 'controller',
      value: 'foam.nanos.controller.ApplicationController'
    }
  ],

  methods: [
    {
      name: 'destroy',
      type: 'Void',
      javaCode: '//noop'
    },
    {
      name: 'getServletInfo',
      type: 'String',
      javaCode: 'return "VirtualHostRoutingServlet";'
    },
    {
      name: 'init',
      type: 'Void',
      args: [ { name: 'config', javaType: 'ServletConfig' } ],
      javaCode: 'setServletConfig(config);',
      code: function() { }
    },
    {
      name: 'populateHead',
      type: 'Void',
      documentation: `Generates the index file's head content based on theme and prints it to the response writer.`,
      args: [
        { name: 'x',       javaType: 'X'},
        { name: 'theme',   javaType: 'Theme'},
        { name: 'logger',  javaType: 'Logger'},
        { name: 'out',     javaType: 'PrintWriter'},
        { name: 'request', javaType: 'ServletRequest' }
      ],
      javaCode: `
      HashMap    headConfig          = (HashMap)   theme.getHeadConfig();
      AppConfig  appConfig           = (AppConfig) x.get("appConfig");
      String     queryString         = ((HttpServletRequest)request).getQueryString();
      HttpServer server              = (HttpServer) this.getServletConfig().getServletContext().getAttribute("httpServer");

      Boolean    customFavIconFailed = false;
      Boolean    customScriptsFailed = false;
      Boolean    customFontsFailed   = false;

      out.println("<meta charset=\\"utf-8\\"/>");
      out.println("<meta name=\\"viewport\\" content=\\"viewport-fit=cover, width=device-width, height=device-height, initial-scale=1.0, maximum-scale=1.0, user-scalable=no\\" />");
      out.print("<title>");
      out.print(theme.getAppName());
      out.println("</title>");

       // custom scripts
      if ( headConfig != null && headConfig.containsKey("customScripts") ) {
        try {
          String[] scriptTags = (String[]) headConfig.get("customScripts");
          for ( String tag : scriptTags ) {
            out.println(tag);
          }
        }
        catch ( Exception e ) {
          logger.error(e);
          customScriptsFailed = true;
        }
      }

      // default scripts
      if ( headConfig == null || ! headConfig.containsKey("customScripts") || customScriptsFailed ) {
        if ( server.getIsResourceStorage() ) {
          // jar file deployment
          out.print("<script async fetchpriority='high' language=\\"javascript\\" src=\\"/foam-bin-");
          out.print(appConfig.getVersion());
          out.println(".js\\"></script>");
        } else {
          // development
          out.println("<script language=\\"javascript\\" src=\\"" + appConfig.getFoamUrl() + "\\" project=\\"" + appConfig.getPom() + "\\"></script>");
        }
      }

      // custom favicon
      if ( headConfig != null && headConfig.containsKey("customFavIcon") ) {
        try {
          String[] favIconTags = (String[]) headConfig.get("customFavIcon");
          for ( String tag : favIconTags ) {
            out.println(tag);
          }
        }
        catch ( Exception e ) {
          logger.error(e);
          customFavIconFailed = true;
        }
      }

      // default favicon
      if ( headConfig == null || ! headConfig.containsKey("customFavIcon") || customFavIconFailed ) {
        out.println("<link rel=\\"apple-touch-icon\\" sizes=\\"180x180\\" href=\\"/favicon/apple-touch-icon.png\\">");
        out.println("<link rel=\\"icon\\" type=\\"image/png\\" sizes=\\"32x32\\" href=\\"/favicon/favicon-32x32.png\\">");
        out.println("<link rel=\\"icon\\" type=\\"image/png\\" sizes=\\"16x16\\" href=\\"/favicon/favicon-16x16.png\\">");
        out.println("<link rel=\\"manifest\\" href=\\"/favicon/manifest.json\\">");
        out.println("<link rel=\\"mask-icon\\" href=\\"/favicon/safari-pinned-tab.svg\\" color=\\"#406dea\\">");
        out.println("<link rel=\\"shortcut icon\\" href=\\"/favicon/favicon.ico\\">");
        out.println("<meta name=\\"msapplication-config\\" content=\\"/favicon/browserconfig.xml\\">");
        out.println("<meta name=\\"theme-color\\" content=\\"#ffffff\\">");
      }

      // custom fonts
      if ( headConfig != null && headConfig.containsKey("customFonts") ) {
        try {
          String[] fontTags = (String[]) headConfig.get("customFonts");
          for ( String tag : fontTags ) {
            out.println(tag);
          }
        }
        catch ( Exception e ) {
          logger.error(e);
          customFontsFailed = true;
        }
      }
      // default fonts
      if ( headConfig == null || ! headConfig.containsKey("customFonts") || customFontsFailed ) {
        out.println("<link rel=\\"preconnect\\" href=\\"https://fonts.gstatic.com/\\">");
        out.println("<link href=\\"https://fonts.googleapis.com/css2?family=Source+Sans+Pro:wght@400;500;600;700&display=swap\\" rel=\\"preload\\" as=\\"style\\" crossorigin=\\"anonymous\\">");
        out.println("<link href=\\"https://fonts.googleapis.com/css2?family=Source+Sans+Pro:wght@400;500;600;700&display=swap\\" rel=\\"stylesheet\\" crossorigin=\\"anonymous\\">");
      }
      `
    },
    {
      name: 'service',
      type: 'Void',
      args: [ { name: 'request',  javaType: 'ServletRequest' },
              { name: 'response', javaType: 'ServletResponse' } ],
      javaThrows: [ 'ServletException', 'IOException' ],
      javaCode: `
        String vhost = request.getServerName();

        if ( getCustomHostMapping().containsKey(vhost) ) {
          request.getRequestDispatcher((String) getCustomHostMapping().get(vhost)).forward(request, response);
          return;
        }

        HttpServer server         = (HttpServer) this.getServletConfig().getServletContext().getAttribute("httpServer");
        X          x              = (X)          this.getServletConfig().getServletContext().getAttribute("X");
        DAO        themeDomainDAO = (DAO)        x.get("themeDomainDAO");
        DAO        themeDAO       = (DAO)        x.get("themeDAO");
        Logger     logger         = (Logger)     x.get("logger");

        ThemeDomain themeDomain = (ThemeDomain) themeDomainDAO.find(vhost);
        if ( themeDomain == null ) {
          themeDomain = (ThemeDomain) themeDomainDAO.find(getDefaultHost());
          if ( themeDomain == null ) {
            themeDomain = (ThemeDomain) themeDomainDAO.find("localhost");
            logger.debug("No theme domain found for default host " + getDefaultHost()+". Falling back to 'localhost'");
          }
        }

        Theme theme = (Theme) themeDAO.find(themeDomain.getTheme());
        if ( theme == null ) {
          logger.error("No theme found for domain " + themeDomain);
          theme = new Theme(x);
        }

        response.setContentType("text/html; charset=UTF-8");
        response.setCharacterEncoding("UTF-8");

        PrintWriter out = response.getWriter();
        out.println("<!DOCTYPE>");

        out.println("<html lang=\\"en\\">");
        out.println("<head>");

        this.populateHead(x, theme, logger, out, request);

        out.println("</head>");
        out.println("<body>");

        out.println("<!-- Instantiate FOAM Application Controller -->");
        out.println("<!-- App Color Scheme, Logo, & Web App Name -->");
        out.print("<foam\\nclass=\\""+ getController() +"\\"\\nid=\\"ctrl\\"\\nwebApp=\\"");
        out.print(theme.getAppName());
        out.println("\\">");

        out.print("<div style=\\" text-align:center;height:100%;display: flex;vertical-align:middle;width: 100%;flex-direction: column;justify-content: center;align-items: center; \\">");
        out.print("<img style=\\" max-width: 400px; \\" src=\\"");
        out.print(theme.getLargeLogo());
        out.println("\\"></img>");
        out.print("<h3 style=\\"font-family: system-ui, sans-serif; \\">Loading....</h3>");
        out.println("</div>");
        out.println("</foam>");

        out.println("</body>");
        out.println("</html>");
      `
    }
  ]
});
