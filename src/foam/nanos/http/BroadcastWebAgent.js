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
    'foam.nanos.logger.Loggers',
    'foam.nanos.pm.PM',
    'foam.nanos.http.DefaultHttpParameters',
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
      var req = x.get(HttpServletRequest.class);
      var resp = x.get(HttpServletResponse.class);
      var parameters = x.get(HttpParameters.class);
      try {
        for ( String to : getTo() ) {
          if ( ! to.startsWith("http") ) {
            // use self
            to = req.getServerName() + ":" + req.getServerPort() + "/" + to;
            if ( getIsSecure() ) {
              to = "https://"+ to;
            }
            to = "http://"+ to;
          }
          String url = buildUrl(x, to, parameters);

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
            Loggers.logger(x, this).debug("request", url);
            HttpClient client = client_.get();
            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
            Loggers.logger(x, this).debug("response", url, response.statusCode(), response.body());
          } catch (HttpTimeoutException e) {
            Loggers.logger(x, this).warning(url, e.getMessage());
          } catch (java.io.IOException | InterruptedException e) {
            Loggers.logger(x, this).error(url, e.getMessage());
          }
        }
      } catch (Throwable t) {
        Loggers.logger(x, this).error(t);
      } finally {
        resp.setContentType("application/json");
        resp.setStatus(HttpServletResponse.SC_OK);
      }
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
      args: 'X x, String to, HttpParameters parameters',
      type: 'String',
      javaCode: `
      StringBuilder sb = new StringBuilder();
      sb.append(to);
      // sb.append("?");
      // int count = 0;
      // for ( HttpParameters param : parameters ) {
      //   if ( "data".equals(param.getName()) ) continue;
      //   if ( count > 0 ) sb.append("&");
      //   sb.append(parem.getName(), param.getParameterValue());
      //   count += 1;
      // }
      return sb.toString();
      `
    }
  ]
})
