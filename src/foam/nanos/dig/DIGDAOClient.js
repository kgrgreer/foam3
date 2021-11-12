/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.dig',
  name: 'DIGDAOClient',
  extends: 'foam.dao.NullDAO',

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

  constants: [
    {
      name: 'DIG_SERVICE',
      type: 'String',
      value: 'dig'
    }
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
      documentation: 'Connection timeout in seconds',
      name: 'connectionTimeout',
      class: 'Int',
      value: 20
    },
    {
      documentation: 'Connection timeout in seconds',
      name: 'requestTimeout',
      class: 'Int',
      value: 60
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
        .connectTimeout(Duration.ofSeconds(getConnectionTimeout()));

      if ( getSecure() ) {
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
      Object result = submit(x, DOP.FIND, "id="+id.toString());
      Loggers.logger(x, this).info("find", "response", result);
      if ( result != null ) {
        return (FObject) unAdapt(x, DOP.FIND, result);
      }
      throw new RuntimeException("Empty response");
      `
    },
    {
      name: 'put_',
      javaCode: `
      Object result = submit(x, DOP.PUT, adapt(x, DOP.PUT, obj));
      Loggers.logger(x, this).info("put", "response", result);
      if ( result != null ) {
        return (FObject) unAdapt(x, DOP.PUT, result);
      }
      throw new RuntimeException("Empty response");
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
      Class cls = null;
      try {
        DAO dao = (DAO) x.get(getNSpecName());
        if ( dao instanceof foam.dao.ProxyDAO ) {
          cls = ((foam.dao.ProxyDAO) dao).getOf().getObjClass();
        } else if ( dao instanceof foam.dao.MDAO ) {
          cls = ((foam.dao.MDAO) dao).getOf().getObjClass();
        }
        return x.create(JSONParser.class).parseString(data.toString(), cls);
      } catch ( RuntimeException e ) {
        Throwable cause = e.getCause();
        while ( cause.getCause() != null ) {
          cause = cause.getCause();
        }
        Loggers.logger(x, this).error("unAdapt", "Failed to parse", getNSpecName(), cls, data, cause);
        throw e;
      }
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
      StringBuilder sb = new StringBuilder();
      sb.append(getUrl());
      sb.append("/service/");
      sb.append(DIG_SERVICE);
      sb.append("?dao=");
      sb.append(getNSpecName());
      sb.append("&format=JSON");
      sb.append("&cmd=");
      sb.append(dop.getLabel());

      Loggers.logger(x, this).debug("submit", "request", sb.toString());

      HttpRequest request = HttpRequest.newBuilder()
        .uri(URI.create(sb.toString()))
        .timeout(Duration.ofSeconds(getRequestTimeout()))
        .header("Accept-Language", "en-US,en;q=0.5")
        .header("Authorization", "BEARER "+getSessionId())
        .header("Content-Type", "application/json")
        .header("User-Agent", "Mozilla/5.0")
        .POST(HttpRequest.BodyPublishers.ofString(data))
        .build();

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
    }
  ]
});
