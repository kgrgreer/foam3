/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.dig',
  name: 'DIGDAOClient',
  extends: 'foam.dao.AbstractDAO',

  documentation: 'Java HTTP client hitting service/dig. Intented for performance testing.',

  javaImports: [
    'foam.box.socket.SslContextFactory',
    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.dao.DOP',
    'foam.lib.formatter.FObjectFormatter',
    'foam.lib.formatter.JSONFObjectFormatter',
    'foam.lib.json.JSONParser',
    'foam.nanos.dig.exception.DigErrorMessage',
    'foam.nanos.logger.Loggers',
    'foam.nanos.pm.PM',
    'foam.nanos.session.Session',
    'foam.util.SafetyUtil',
    'java.net.Authenticator',
    'java.net.http.HttpClient',
    'java.net.http.HttpRequest',
    'java.net.http.HttpResponse',
    'java.net.URI',
    'java.time.Duration',
    'javax.net.ssl.SSLContext',
    'javax.servlet.http.HttpServletRequest',
  ],

  properties: [
    {
      name: 'nSpecName',
      class: 'String'
    },
    {
      documentation: 'Session token / BEARER token',
      name: 'sessionId',
      class: 'String',
      javaFactory: 'return getX().get(Session.class).getId();'
    },
    {
      name: 'url',
      class: 'String',
      javaFactory: `
      // see 'domain' below - which is not working.
      return "http://"+System.getProperty("hostname", "localhost")+":8080";
      `
    },
    {
      documentation: 'Connection timeout in milliseconds',
      name: 'connectionTimeout',
      class: 'Long',
      value: 20000
    },
    {
      documentation: 'Connection timeout in milliseconds',
      name: 'requestTimeout',
      class: 'Long',
      value: 10000
    },
    {
      name: 'secure',
      class: 'Boolean',
      javaFactory: `return getUrl().contains("https");`
    },
    // {
    //   // FIXME: getServerName or getLocalName return ipv6 address
    //   // which fails java.net.URL(url) creation.
    //   name: 'domain',
    //   class: 'String',
    //   javaFactory: `
    //   HttpServletRequest req = getX().get(HttpServletRequest.class);
    //   if ( req != null ) {
    //     StringBuilder sb = new StringBuilder();
    //     sb.append(req.getScheme());
    //     sb.append("://");
    //     // sb.append(req.getLocalName());
    //     sb.append(req.getServerName());
    //     sb.append(":");
    //     sb.append(req.getServerPort());
    //     return sb.toString();
    //   }
    //   return "http://"+System.getProperty("hostname", "localhost")+":8080";
    //   `,
    // }
    {
      name: 'serviceName',
      class: 'String',
      value: 'dig'
    },
    {
      name: 'of',
      class: 'Class',
      javaFactory: `
        DAO dao = (DAO) getX().get(getNSpecName());
        if ( dao instanceof foam.dao.ProxyDAO ) {
          return ((foam.dao.ProxyDAO) dao).getOf();
        } else if ( dao instanceof foam.dao.MDAO ) {
          return ((foam.dao.MDAO) dao).getOf();
        }
        return null;
      `
    }
  ],

  javaCode: `
  protected static final ThreadLocal<FObjectFormatter> formatter_ = new ThreadLocal<FObjectFormatter>() {
    @Override
    protected JSONFObjectFormatter initialValue() {
      JSONFObjectFormatter formatter = new JSONFObjectFormatter();
      formatter.setQuoteKeys(true);
      return formatter;
    }

    @Override
    public FObjectFormatter get() {
      FObjectFormatter formatter = super.get();
      formatter.reset();
      return formatter;
    }
  };

  protected final ThreadLocal<HttpClient> client_ = new ThreadLocal<HttpClient>() {
    @Override
    protected HttpClient initialValue() {
      HttpClient.Builder builder = HttpClient.newBuilder()
        .version(HttpClient.Version.HTTP_1_1)
        .followRedirects(HttpClient.Redirect.NORMAL)
        .connectTimeout(Duration.ofMillis(getConnectionTimeout()));

      if ( getSecure() ) {
        System.setProperty("jdk.internal.httpclient.disableHostnameVerification", Boolean.TRUE.toString());
        SslContextFactory contextFactory = (SslContextFactory) getX().get("sslContextFactory");
        if ( contextFactory != null && contextFactory.getEnableSSL() ) {
          SSLContext sslContext = contextFactory.getSSLContext();
          builder = builder.sslContext(sslContext);
        }
      }
      return builder.build();
    }
  };
  `,

  methods: [
    {
      name: 'find_',
      javaCode: `
      Object result = submit(x, DOP.SELECT, "id="+id.toString());
      // Loggers.logger(x, this).debug("find", "response", result);
      if ( result != null ) {
        return (FObject) unAdapt(x, DOP.FIND, result);
      }
      throw new RuntimeException("Empty response");
      `
    },
    {
      name: 'put_',
      javaCode: `
      // Special support for Sessions as they must go through SUGAR
      if ( obj instanceof Session ) {
        Session session = (Session) obj;
        String id = createSession(x, session);
        session.setId(id);
        return session;
      }

      Object result = submit(x, DOP.PUT, adapt(x, DOP.PUT, obj));
      // Loggers.logger(x, this).debug("put", "response", result);
      if ( result != null ) {
        return (FObject) unAdapt(x, DOP.PUT, result);
      }
      throw new RuntimeException("Empty response");
      `
    },
    {
      name: 'select_',
      // select_(X,Sink,Skip,Limit,Comparator,Predicate)
      javaCode: `
      throw new UnsupportedOperationException();
      `
    },
    {
      name: 'remove_',
      javaCode: `
      throw new UnsupportedOperationException();
      // NOTE: untested
      // Object result = submit(x, DOP.REMOVE, "id="+obj.getProperty("id"));
      // Loggers.logger(x, this).debug("remove", "response", result);
      // if ( result != null ) {
      //   return (FObject) unAdapt(x, DOP.REMOVE, result);
      // }
      // return null;
      `
    },
    {
      name: 'adapt',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'dop',
          type: 'foam.dao.DOP'
        },
        {
          name: 'obj',
          type: 'FObject'
        }
      ],
      type: 'String',
      javaCode: `
      FObjectFormatter formatter = formatter_.get();
      formatter.output(obj);
      return formatter.builder().toString();
      `
    },
    {
      // TODO: support SELECT
      name: 'unAdapt',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'dop',
          type: 'foam.dao.DOP'
        },
        {
          name: 'data',
          type: 'Object'
        }
      ],
      type: 'Object',
      javaCode: `
      try {
        return x.create(JSONParser.class).parseString(data.toString(), getOf().getObjClass());
      } catch ( RuntimeException e ) {
        Throwable cause = e.getCause();
        while ( cause.getCause() != null ) {
          cause = cause.getCause();
        }
        Loggers.logger(x, this).error("unAdapt", "Failed to parse", getOf(), data, cause);
        throw e;
      }
      `
    },
    {
      name: 'buildUrl',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'dop',
          type: 'foam.dao.DOP'
        },
        {
          name: 'data',
          type: 'String'
        },
      ],
      type: 'String',
      javaCode: `
      StringBuilder sb = new StringBuilder();
      sb.append(getUrl());
      sb.append("/service/");
      sb.append(getServiceName());
      sb.append("?cmd=");
      sb.append(dop.getLabel());
      if ( ! SafetyUtil.isEmpty(getNSpecName()) ) {
        sb.append("&dao=");
        sb.append(getNSpecName());
      }
      if ( dop == DOP.FIND ||
           dop == DOP.SELECT ||
           dop == DOP.REMOVE ) {
        sb.append("&");
        sb.append(data);
      }
      sb.append("&format=JSON");

      // Loggers.logger(x, this).debug("submit", "request", sb.toString());
      return sb.toString();
      `
    },
    {
      name: 'submit',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'dop',
          type: 'foam.dao.DOP'
        },
        {
          name: 'data',
          type: 'String'
        },
      ],
      type: 'String',
      javaCode: `
      HttpRequest.Builder builder = HttpRequest.newBuilder()
        .uri(URI.create(buildUrl(x, dop, data)))
        .timeout(Duration.ofMillis(getRequestTimeout()))
        .header("Accept-Language", "en-US,en;q=0.5")
        .header("Authorization", "BEARER "+getSessionId())
        .header("Content-Type", "application/json")
        .header("User-Agent", "Mozilla/5.0");
      if ( dop == DOP.PUT ) {
        builder = builder.POST(HttpRequest.BodyPublishers.ofString(data));
      }
      HttpRequest request = builder.build();

      try {
        HttpClient client = client_.get();
        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
        if ( response.statusCode() == 200 ) {
          return response.body();
        }
        Loggers.logger(x, this).warning("submit", "response", response.statusCode(), response.body());
        try {
          throw (DigErrorMessage) unAdapt(x, dop, response.body());
        } catch ( Throwable t ) {
          // nop
          Loggers.logger(x, this).debug("submit", "response", "failed to parse dig excetpion", t.getMessage(), response.statusCode(), response.body(), t);
        }
        throw new RuntimeException(String.valueOf(response.statusCode()));
      } catch (java.io.IOException | InterruptedException e) {
        throw new RuntimeException(e);
      }
      `
    },
    {
      // Quite a rigamaroll to create a session. Have to go through SUGAR
      name: 'createSession',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'session',
          type: 'foam.nanos.session.Session'
        },
      ],
      type: 'String',
      javaCode: `
      // TODO: model this
      StringBuilder sb = new StringBuilder();
      sb.append("{");
      sb.append("\\"service\\":\\"sessionService\\",");
      sb.append("\\"interfaceName\\":\\"foam.nanos.session.SessionService\\",");
      sb.append("\\"method\\":\\"createSessionWithTTL\\",");
      sb.append("\\"userId\\":");
      sb.append(session.getUserId());
      sb.append(",\\"agentId\\":");
      sb.append(session.getAgentId());
      sb.append(",\\"ttl\\":");
      sb.append(session.getTtl());
      sb.append("}");

      DIGDAOClient client = new DIGDAOClient.Builder(x)
        .setServiceName("sugar")
        .setOf(Session.getOwnClassInfo())
        .setUrl(getUrl())
        .setSessionId(getSessionId())
        .build();

     String id = client.submit(x, DOP.PUT, sb.toString());
      // HttpRequest or SUGAR response is quoted, need to strip.
      if ( ! SafetyUtil.isEmpty(id) &&
           id.startsWith("\\"") ) {
        id = id.substring(1, id.length() - 2);
      }
      return id;
      `
    }
  ]
});
