/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.jetty',
  name: 'HttpServer',

  implements: [
    'foam.nanos.NanoService',
    'foam.nanos.boot.NSpecAware'
  ],

  javaImports: [
    'foam.blob.Blob',
    'foam.core.X',
    'foam.dao.DAO',
    'static foam.mlang.MLang.TRUE',
    'foam.nanos.fs.File',
    'foam.nanos.fs.ResourceStorage',
    'foam.nanos.jetty.JettyThreadPoolConfig',
    'foam.nanos.logger.Logger',
    'foam.nanos.logger.PrefixLogger',
    'foam.nanos.logger.StdoutLogger',
    'foam.nanos.security.KeyStoreManager',
    'foam.net.Port',
    'java.io.ByteArrayInputStream',
    'java.io.ByteArrayOutputStream',
    'java.io.FileInputStream',
    'java.io.InputStream',
    'java.io.IOException',
    'java.io.PrintStream',
    'java.security.KeyStore',
    'java.util.Arrays',
    'java.util.HashSet',
    'java.util.Set',
    'org.apache.commons.io.IOUtils',
    'org.eclipse.jetty.http.pathmap.ServletPathSpec',
    'org.eclipse.jetty.proxy.ProxyServlet',
    'org.eclipse.jetty.proxy.ProxyServlet.Transparent',
    'org.eclipse.jetty.server.*',
    'org.eclipse.jetty.server.handler.IPAccessHandler',
    'org.eclipse.jetty.server.handler.gzip.GzipHandler',
    'org.eclipse.jetty.server.handler.StatisticsHandler',
    'org.eclipse.jetty.servlet.ServletHolder',
    'org.eclipse.jetty.util.component.Container',
    'org.eclipse.jetty.util.ssl.SslContextFactory',
    'org.eclipse.jetty.util.thread.QueuedThreadPool',
    'org.eclipse.jetty.websocket.server.WebSocketUpgradeFilter',
    'org.eclipse.jetty.websocket.servlet.ServletUpgradeRequest',
    'org.eclipse.jetty.websocket.servlet.ServletUpgradeResponse',
    'org.eclipse.jetty.websocket.servlet.WebSocketCreator',
    'static foam.mlang.MLang.EQ'
  ],

  properties: [
    {
      class: 'Boolean',
      name: 'enableHttp',
      value: true
    },
    {
      class: 'Int',
      name: 'port',
      javaFactory: `
      if ( getEnableHttps() ) return 8443;
      return 8080;
      `
    },
    {
      class: 'Boolean',
      name: 'enableHttps'
    },
    {
      class: 'Boolean',
      name: 'enableMTLS',
      documentation: 'Enable mTLS on this server connection'
    },
    {
      class: 'Boolean',
      name: 'isResourceStorage',
      documentation: `If set to true, generate index file from jar file resources.`,
      value: false
    },
    {
      name: 'keystoreFileName',
      documentation: 'id of the keystore file in fileDAO',
      class: 'String',
      value: 'keystore'
    },
    {
      class: 'String',
      name: 'keystorePassword'
    },
    {
      class: 'StringArray',
      name: 'welcomeFiles',
      factory: function() {
        return [
          '/src/foam/nanos/controller/index.html'
        ];
      }
    },
    {
      class: 'StringArray',
      name: 'forwardedForProxyWhitelist'
    },
    {
      class: 'StringArray',
      name: 'hostDomains',
      javaPreSet: `
        Arrays.sort(val);
      `
    },
    {
      class: 'FObjectArray',
      of: 'foam.nanos.servlet.ServletMapping',
      name: 'servletMappings',
      javaFactory: `return new foam.nanos.servlet.ServletMapping[0];`
    },
    {
      class: 'FObjectArray',
      of: 'foam.nanos.servlet.ErrorPageMapping',
      name: 'errorMappings',
      javaFactory: `return new foam.nanos.servlet.ErrorPageMapping[0];`
    },
    {
      class: 'FObjectArray',
      name: 'filterMappings',
      of: 'foam.nanos.servlet.FilterMapping',
      javaFactory: 'return new foam.nanos.servlet.FilterMapping[0];'
    },
    {
      class: 'FObjectArray',
      of: 'foam.nanos.servlet.ProxyMapping',
      name: 'proxyMappings',
      javaFactory: `return new foam.nanos.servlet.ProxyMapping[0];`
    },
    {
      documentation: 'hold reference to server for dumpStats',
      class: 'Object',
      name: 'server',
      hidden: true,
      transient: true
    },
    {
      name: 'logger',
      class: 'FObjectProperty',
      of: 'foam.nanos.logger.Logger',
      visibility: 'HIDDEN',
      transient: true,
      javaCloneProperty: '//noop',
      javaFactory: `
        return new PrefixLogger(new Object[] {
          this.getClass().getSimpleName()
        }, (Logger) getX().get("logger"));
      `
    },
    {
      class: 'String',
      name: 'imageDirs',
      value: 'images',
      documentation: 'Colon separated list of image directories.'
    }
  ],

  methods: [
    {
      name: 'start',
      javaCode: `
      clearLogger();

      try {
        int port = getPort();
        try {
          port = Port.get(getX(), (String) getNSpec().getId());
        } catch (IllegalArgumentException e) {
          port = getPort();
        }

        JettyThreadPoolConfig jettyThreadPoolConfig = (JettyThreadPoolConfig) getX().get("jettyThreadPoolConfig");
        QueuedThreadPool threadPool = new QueuedThreadPool();
        threadPool.setDaemon(true);
        threadPool.setMaxThreads(jettyThreadPoolConfig.getMaxThreads());
        threadPool.setMinThreads(jettyThreadPoolConfig.getMinThreads());
        threadPool.setIdleTimeout(jettyThreadPoolConfig.getIdleTimeout());

        ConnectorStatistics stats = new ConnectorStatistics();
        org.eclipse.jetty.server.Server server =
          new org.eclipse.jetty.server.Server(threadPool);

        if ( getEnableHttp() ) {
          getLogger().info("Starting,HTTP,port", port);
          ServerConnector connector = new ServerConnector(server);
          connector.setPort(port);
          connector.addBean(stats);
          server.addConnector(connector);
        }
        StatisticsHandler statisticsHandler = new StatisticsHandler();
        statisticsHandler.setServer(server);

        /*
          The following for loop will accomplish the following:
          1. Prevent Jetty server from broadcasting its version number in the HTTP
          response headers.
          2. Configure Jetty server to interpret the X-Fowarded-for header
        */

        // we are converting the ForwardedForProxyWhitelist array into a set here
        // so that it makes more sense algorithmically to check against IPs
        Set<String> forwardedForProxyWhitelist = new HashSet<>(Arrays.asList(getForwardedForProxyWhitelist()));

        for ( org.eclipse.jetty.server.Connector conn : server.getConnectors() ) {
          for ( org.eclipse.jetty.server.ConnectionFactory f : conn.getConnectionFactories() ) {
            if ( f instanceof org.eclipse.jetty.server.HttpConnectionFactory ) {

              // 1. hiding the version number in response headers
              ((org.eclipse.jetty.server.HttpConnectionFactory) f).getHttpConfiguration().setSendServerVersion(false);

              // 2. handle the X-Forwarded-For headers depending on whether a whitelist is set up or not
              // we need to pass the context into this customizer so that we can effectively log unauthorized proxies
              ((org.eclipse.jetty.server.HttpConnectionFactory) f).getHttpConfiguration().addCustomizer(new WhitelistedForwardedRequestCustomizer(getX(), forwardedForProxyWhitelist));
            }
          }
        }

        org.eclipse.jetty.servlet.ServletContextHandler handler =
          new org.eclipse.jetty.servlet.ServletContextHandler();

        String root = System.getProperty("nanos.webroot");
        if ( root == null ) {
          root = this.getClass().getResource("/webroot/error.html").toExternalForm();
          root = root.substring(0, root.lastIndexOf("/"));
        }

        handler.setResourceBase(root);
        handler.setWelcomeFiles(getWelcomeFiles());

        handler.setAttribute("X", getX());
        handler.setAttribute("httpServer", this);

        // Install an ImageServlet
        if ( getImageDirs().length() > 0 ) {
          if ( getIsResourceStorage() ) {
            ServletHolder imgServ = handler.addServlet(foam.nanos.servlet.ResourceImageServlet.class, "/images/*");
            imgServ.setInitParameter("paths", getImageDirs());
          } else {
            ServletHolder imgServ = handler.addServlet(foam.nanos.servlet.ImageServlet.class, "/images/*");
            imgServ.setInitParameter("paths", getImageDirs());
          }
        }

        for ( foam.nanos.servlet.ServletMapping mapping : getServletMappings() ) {
          ServletHolder holder;

          if ( mapping.getServletObject() != null ) {
            holder = new ServletHolder(mapping.getServletObject());
            handler.addServlet(holder, mapping.getPathSpec());
          } else {
            holder = handler.addServlet(
                (Class<? extends javax.servlet.Servlet>)Class.forName(mapping.getClassName()), mapping.getPathSpec());
          }

          java.util.Iterator iter = mapping.getInitParameters().keySet().iterator();

          while ( iter.hasNext() ) {
            String key = (String) iter.next();
            holder.setInitParameter(key, ((String)mapping.getInitParameters().get(key)));
          }
          if ( getIsResourceStorage() ) {
            holder.setInitParameter("isResourceStorage", "true");
          }
        }

        for ( foam.nanos.servlet.ProxyMapping mapping : getProxyMappings() ) {
          ServletHolder holder = handler.addServlet(ProxyServlet.Transparent.class, mapping.getPathSpec());
          holder.setInitOrder(1);
          holder.setInitParameter("proxyTo", mapping.getProxyTo());
          holder.setInitParameter("prefix", mapping.getPrefix());
          getLogger().info("ProxyMapping", mapping.getPathSpec(), mapping.getProxyTo());
        }

        org.eclipse.jetty.servlet.ErrorPageErrorHandler errorHandler =
          new org.eclipse.jetty.servlet.ErrorPageErrorHandler();

        for ( foam.nanos.servlet.ErrorPageMapping errorMapping : getErrorMappings() ) {
          if ( errorMapping.getErrorCode() != 0 ) {
            errorHandler.addErrorPage(errorMapping.getErrorCode(), errorMapping.getLocation());
          } else {
            errorHandler.addErrorPage((Class<? extends java.lang.Throwable>)Class.forName(errorMapping.getExceptionType()), errorMapping.getLocation());
          }
        }

        for ( foam.nanos.servlet.FilterMapping mapping : getFilterMappings() ) {
          org.eclipse.jetty.servlet.FilterHolder holder =
            handler.addFilter(
              (Class<? extends javax.servlet.Filter>)Class.forName(mapping.getFilterClass()),
              mapping.getPathSpec(),
              java.util.EnumSet.of(javax.servlet.DispatcherType.REQUEST));

          java.util.Iterator iter = mapping.getInitParameters().keySet().iterator();

          while ( iter.hasNext() ) {
            String key = (String)iter.next();
            holder.setInitParameter(key, (String)mapping.getInitParameters().get(key));
          }
        }

        // set error handler
        handler.setErrorHandler(errorHandler);

        // Add websocket upgrade filter
        WebSocketUpgradeFilter wsFilter = WebSocketUpgradeFilter.configureContext(handler);
        // set idle time out to 10s
        wsFilter.getFactory().getPolicy().setIdleTimeout(10000);
        // add mapping
        wsFilter.addMapping(new ServletPathSpec("/service/*"), new WebSocketCreator() {
          @Override
          public Object createWebSocket(ServletUpgradeRequest req, ServletUpgradeResponse resp) {
            return new foam.nanos.ws.NanoWebSocket(getX());
          }
        });

        addJettyShutdownHook(server);

        // Install GzipHandler to transparently gzip .js, .svg and .html files
        GzipHandler gzipHandler = new GzipHandler();
        gzipHandler.addIncludedMimeTypes(
          "application/javascript",
          "image/svg+xml",
          "text/html"
        );
        gzipHandler.addIncludedMethods("GET");
        gzipHandler.setInflateBufferSize(1024*64); // ???: What size is ideal?
        gzipHandler.setCompressionLevel(9);
        gzipHandler.setHandler(handler);
        server.setHandler(gzipHandler);

        // IPAccessHandler
        IPAccessHandler ipAccessHandler = new IPAccessHandler();
        ipAccessHandler.setHandler(handler);
        server.setHandler(ipAccessHandler);
        DAO ipAccessDAO = (DAO) getX().get("jettyIPAccessDAO");

        // With Medusa (clustering) must listen on MDAO to receive updates from 'other' mediators.
        Object result = ipAccessDAO.cmd(DAO.LAST_CMD);
        if ( result != null &&
             result instanceof foam.dao.MDAO ) {
          ipAccessDAO = (DAO) result;
        }

        ipAccessDAO.listen(new IPAccessSink(ipAccessHandler, ipAccessDAO), TRUE);
        // initialilize
        ipAccessDAO.select(new IPAccessAddSink(ipAccessHandler));

        this.configHttps(server);

        server.start();
        setServer(server);
      } catch(Exception e) {
        getLogger().error(e);
      }
      `
    },
    {
      name: 'addJettyShutdownHook',
      documentation: `A shutdown hook in case of unexpected process termination
        (covers break/ctrl+C but not kill -9).`,
      args: [
        {
          name: 'server',
          javaType: 'final org.eclipse.jetty.server.Server'
        }
      ],
      javaCode: `
        Runtime.getRuntime().addShutdownHook(new Thread() {
          @Override
          public void run() {
            try {
              dumpStats(getX(), server);
              System.out.println("Shutting down Jetty server with the shutdown hook.");
              server.stop();
            } catch (Exception e) {
              System.err.println("Exception during Jetty server stop in the shutdown hook");
              Logger logger = (Logger) getX().get("logger");
              if ( logger != null )
                logger.error(e);
            }
          }
        });
      `
    },
    {
      name: 'configHttps',
      documentation: 'https://docs.google.com/document/d/1hXVdHjL8eASG2AG2F7lPwpO1VmcW2PHnAW7LuDC5xgA/edit?usp=sharing',
      args: [
        {
          name: 'server',
          javaType: 'final org.eclipse.jetty.server.Server'
        }
      ],
      javaCode: `
      foam.nanos.logger.Logger logger = (foam.nanos.logger.Logger) getX().get("logger");
      foam.dao.DAO fileDAO = ((foam.dao.DAO) getX().get("fileDAO"));

      if ( this.getEnableHttps() ) {
        int port = getPort();
        try {
          port = Port.get(getX(), (String) getNSpec().getId());
        } catch (IllegalArgumentException e) {
          port = getPort();
        }

        ByteArrayOutputStream baos = null;
        ByteArrayInputStream bais = null;
        try {
          KeyStore keyStore = null;
          KeyStoreManager keyStoreManager = (KeyStoreManager) getX().get("keyStoreManager");
          if ( keyStoreManager != null ) {
            keyStoreManager.unlock();
            keyStore = keyStoreManager.getKeyStore();
            getLogger().debug("HttpServer","configHttps","KeyStoreManager",keyStoreManager.getKeyStore());
          } else {
            getLogger().debug("HttpServer","configHttps","KeyStore.instance()");
            // 1. load the keystore to verify the keystore path and password.
            keyStore = KeyStore.getInstance("JKS");

            if ( System.getProperty("resource.journals.dir") != null ) {
              X resourceStorageX = getX().put(foam.nanos.fs.Storage.class,
                new ResourceStorage(System.getProperty("resource.journals.dir")));
              InputStream is = resourceStorageX.get(foam.nanos.fs.Storage.class).getInputStream(getKeystoreFileName());
              if ( is != null ) {
                baos = new ByteArrayOutputStream();

                byte[] buffer = new byte[8192];
                int len;
                while ((len = is.read(buffer)) != -1) {
                  baos.write(buffer, 0, len);
                }
                bais = new ByteArrayInputStream(baos.toByteArray());
              } else {
                getLogger().warning("Keystore not found. Resource: "+getKeystoreFileName());
              }
            }
            // Fall back to fileDAO if resource not found, this will
            // occur when keystore updated/replaced in production.
            if ( bais == null ) {
              File file = (File) fileDAO.find(getKeystoreFileName());
              if ( file == null ) {
                throw new java.io.FileNotFoundException("Keystore not found. File: "+getKeystoreFileName());
              }

              Blob blob = file.getData();
              if ( blob == null ) {
                throw new java.io.FileNotFoundException("Keystore empty");
              }

              baos = new ByteArrayOutputStream((int) file.getFilesize());
              blob.read(baos, 0, file.getFilesize());
              bais = new ByteArrayInputStream(baos.toByteArray());
            }
            keyStore.load(bais, this.getKeystorePassword().toCharArray());
          }

          // 2. enable https
          HttpConfiguration https = new HttpConfiguration();
          https.addCustomizer(new SecureRequestCustomizer());
          SslContextFactory.Server sslContextFactory = new SslContextFactory.Server();
          sslContextFactory.setKeyStore(keyStore);
          sslContextFactory.setKeyStorePassword(this.getKeystorePassword());
          // NOTE: Enabling these will fail self-signed certificate use.
          if ( getEnableMTLS() ) {
            sslContextFactory.setWantClientAuth(true);
            sslContextFactory.setNeedClientAuth(true);
          }

          getLogger().info("Starting,HTTPS,port", port);
          ServerConnector sslConnector = new ServerConnector(server,
            new SslConnectionFactory(sslContextFactory, "http/1.1"),
            new HttpConnectionFactory(https));
          sslConnector.setPort(port);
          sslConnector.addBean(new ConnectorStatistics());

          server.addConnector(sslConnector);

        } catch ( java.io.FileNotFoundException e ) {
          logger.error(e.getMessage(),
                       "Please see: https://docs.google.com/document/d/1hXVdHjL8eASG2AG2F7lPwpO1VmcW2PHnAW7LuDC5xgA/edit?usp=sharing", e);
        } catch ( java.io.IOException e ) {
          logger.error("Invalid KeyStore file password, please make sure you have set the correct password.",
                       "Please see: https://docs.google.com/document/d/1hXVdHjL8eASG2AG2F7lPwpO1VmcW2PHnAW7LuDC5xgA/edit?usp=sharing", e);
        } catch ( Exception e ) {
          logger.error("Failed configuring https", e);
        } finally {
          IOUtils.closeQuietly(bais);
          IOUtils.closeQuietly(baos);
        }
      }
      `
    },
    {
      name: 'containsHostDomain',
      type: 'Boolean',
      documentation: `Returns true if given domain is contained in server's host domains.`,
      args: [
        { name: 'domain', javaType: 'String' }
      ],
      javaCode: `
        return Arrays.binarySearch(getHostDomains(), domain) >= 0;
      `
    },
    {
      name: 'dumpStats',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'server',
          type: 'org.eclipse.jetty.server.Server'
        }
      ],
      javaCode: `
      ByteArrayOutputStream baos = new ByteArrayOutputStream();
      PrintStream           ps   = new PrintStream(baos);
      PrintStream           out  = (PrintStream) x.get("out");
      try {
        if ( server == null ) {
          server = (org.eclipse.jetty.server.Server) getServer();
        }
        if ( server == null ) {
          getLogger().warning("dumpStats,server,null");
          return;
        }

        ps.printf("HttpServer stats%n");

        // Dump status
        for ( Connector connector : server.getConnectors() ) {
          if ( connector instanceof Container ) {
            Container container = (Container)connector;
            ConnectorStatistics stats = container.getBean(ConnectorStatistics.class);
            ps.printf("Connector: %s%n",connector);
            if ( stats != null ) {
              stats.dump(ps,"  ");
            } else {
              ps.printf("stats null%n");
            }
            if ( out != null ) {
              // support output to caller
              out.print(baos.toString("UTF8"));
            } else {
              getLogger().info(baos.toString("UTF8"));
            }
          }
        }
      } catch ( Exception e ) {
        getLogger().warning("dumpStats", e);
      } finally {
        ps.close();
      }
      `
    }
  ]
});
