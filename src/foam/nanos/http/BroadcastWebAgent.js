/**
 * @license
 * Copyright 2023 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.http',
  name: 'BroadcastWebAgent',

  implements: [
    'foam.nanos.http.WebAgent'
  ],

  documentation: `Distribute request to each of the specified end points. Behaviour send and forget.
NOTE: do not install nspec with parameters: true`,

  javaImports: [
    'foam.box.HTTPAuthorizationType',
    'foam.box.socket.SslContextFactory',
    'foam.core.X',
    'foam.nanos.logger.Logger',
    'foam.nanos.logger.Loggers',
    'foam.nanos.pm.PM',
    'foam.nanos.http.DefaultHttpParameters',
    'foam.util.concurrent.AbstractAssembly',
    'foam.util.concurrent.AssemblyLine',
    'foam.util.concurrent.AsyncAssemblyLine',
    'foam.util.SafetyUtil',
    'java.io.IOException',
    'java.net.CookieHandler',
    'java.net.CookieManager',
    'java.net.http.HttpClient',
    'java.net.http.HttpRequest',
    'java.net.http.HttpResponse',
    'java.net.http.HttpTimeoutException',
    'java.net.URI',
    'java.net.URLEncoder',
    'java.time.Duration',
    'java.util.HashMap',
    'java.util.Map',
    'java.util.StringTokenizer',
    'javax.net.ssl.SSLContext',
    'javax.servlet.http.HttpServletRequest',
    'javax.servlet.http.HttpServletResponse'
  ],

  properties: [
    {
      class: 'StringArray',
      name: 'to'
    },
    {
      name: 'isSecure',
      class: 'Boolean'
    },
    {
      documentation: 'Headers to copy over',
      name: 'copyHeaders',
      class: 'StringArray',
      factory: function() {
        return ['Accept-Language', 'Content-Type', 'User-Agent'];
      },
      javaFactory: `
        return new String[] {"Accept-Language", "Content-Type", "User-Agent"};
      `
    },
    {
      documentation: 'Do not wait for a pass or fail on any of hte proxy requests. Immediately return 200',
      name: 'sendAndForget',
      class: 'Boolean'
    },
    {
      documentation: 'Connection timeout in milliseconds',
      name: 'connectionTimeout',
      class: 'Long',
      units: 'ms',
      value: 20000,
      section: 'details'
    },
    {
      documentation: 'Connection timeout in milliseconds',
      name: 'requestTimeout',
      class: 'Long',
      units: 'ms',
      value: 10000,
      section: 'details'
    }
  ],

  javaCode: `
  protected final ThreadLocal<HttpClient> client_ = new ThreadLocal<HttpClient>() {
    @Override
    protected HttpClient initialValue() {
      HttpClient.Builder builder = HttpClient.newBuilder()
        .version(HttpClient.Version.HTTP_1_1)
        .followRedirects(HttpClient.Redirect.NORMAL)
        .connectTimeout(Duration.ofMillis(getConnectionTimeout()));

      if ( getIsSecure() ) {
        SslContextFactory contextFactory = (SslContextFactory) getX().get("sslContextFactory");
        if ( contextFactory != null && contextFactory.getEnableSSL() ) {
          SSLContext sslContext = contextFactory.getSSLContext();
          builder = builder.sslContext(sslContext);
        } else if ( contextFactory == null ) {
          new foam.nanos.logger.StdoutLogger(getX()).warning("BroadcastWebAgent", "sslContextFactory", "not found");
        } else if ( ! contextFactory.getEnableSSL() ) {
          new foam.nanos.logger.StdoutLogger(getX()).warning("BroadcastWebAgent", "sslContextFactory", "ssl not enabled");
        }
      }
      // store and accept ORIGINAL_SERVER
      builder.cookieHandler(new CookieManager());
      return builder.build();
    }
  };
  `,

  methods: [
    {
      name: 'execute',
      javaCode: `
      final Logger logger = Loggers.logger(x, this);
      final var req = x.get(HttpServletRequest.class);
      final var resp = x.get(HttpServletResponse.class);
      final var parameters = x.get(HttpParameters.class);
      AssemblyLine line = new AsyncAssemblyLine(x);
      final Map replies = new HashMap();
      final Map failures = new HashMap();
      final Map timeouts = new HashMap();
      for ( String t : getTo() ) {
        line.enqueue(new AbstractAssembly() {
          public void executeJob() {
            try {
              String to = t;
              if ( ! to.startsWith("http") ) {
                // use self
                to = req.getServerName() + ":" + req.getServerPort() + "/" + to;
                if ( getIsSecure() ) {
                  to = "https://"+ to;
                }
                to = "http://"+ to;
              }
              String url = buildUrl(x, to);

              HttpRequest.Builder builder = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .timeout(Duration.ofMillis(getRequestTimeout()));

              // headers
              for ( String header : getCopyHeaders() ) {
                try {
                  String value = req.getHeader(header);
                  if ( ! SafetyUtil.isEmpty(value) ) {
                    builder.header(header, value);
                  }
                } catch (IllegalArgumentException e) {
                  // nop - ignore restricted headers.
                }
              }

              // auth
              String bearerToken = getBearerToken(req);
              if ( ! SafetyUtil.isEmpty(bearerToken ) ) {
                builder = builder.header("Authorization", "BEARER "+bearerToken);
              }

              // post data
              if ( Command.PUT.equals(parameters.get("cmd")) ) {
                String data = parameters.getParameter("data");
                if ( ! SafetyUtil.isEmpty(data) ) {
                  builder = builder.POST(HttpRequest.BodyPublishers.ofString(data));
                }
              }

              HttpRequest request = builder.build();
              try {
                logger.debug("send", url);
                HttpClient client = client_.get();
                HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
                if ( response.statusCode() == HttpServletResponse.SC_OK ) {
                  logger.debug("response", url, response.statusCode(), response.body());
                  replies.put(url, response.statusCode());
                } else {
                  logger.warning("response", url, response.statusCode(), response.body());
                  failures.put(url, response.statusCode());
                }
              } catch (HttpTimeoutException e) {
                logger.warning(url, e.getMessage());
                timeouts.put(url, e.getMessage());
              } catch (java.io.IOException | InterruptedException e) {
                logger.error(url, e.getMessage());
                failures.put(url, e.getMessage());
              }
            } catch (Throwable t) {
              logger.error(t);
            }
          }
        });
      }

      if ( getSendAndForget() ) {
        resp.setStatus(HttpServletResponse.SC_OK);
        return;
      }

      logger.debug("wait");
      long waited = 0L;
      long sleep = 100L;
      while ( waited < getConnectionTimeout() ) {
        try {
          Thread.currentThread().sleep(sleep);
          waited += sleep;
        } catch (InterruptedException e) {
          break;
        }
        if ( replies.size() > 0 ) {
          resp.setStatus(HttpServletResponse.SC_OK);
          return;
        }
        if ( failures.size() == getTo().length ) {
          logger.warning("failed");
          resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
          return;
        }
        if ( timeouts.size() == getTo().length ) {
          logger.warning("timeout");
          resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
          return;
        }
      }

      // timeout
      logger.error("timeout");
      resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
      `
    },
    {
      name: 'getBearerToken',
      args: 'HttpServletRequest request',
      type: 'String',
      javaCode: `
      String  authHeader = request.getHeader("Authorization");
        if ( ! SafetyUtil.isEmpty(authHeader) ) {
          StringTokenizer st = new StringTokenizer(authHeader);
          if ( st.hasMoreTokens() ) {
            String authType = st.nextToken();
            if ( HTTPAuthorizationType.BEARER.getName().equalsIgnoreCase(authType) ) {
              return st.nextToken();
            }
          }
        }
      return null;
      `
    },
    {
      name: 'buildUrl',
      args: 'X x, String to',
      type: 'String',
      javaCode: `
      final var req = x.get(HttpServletRequest.class);
      StringBuilder sb = new StringBuilder();
      sb.append(to);
      String query = req.getQueryString();
      if ( ! SafetyUtil.isEmpty(query) ) {
        sb.append("?");
        sb.append(query);
      }
      return sb.toString();
      `
    }
  ]
})
