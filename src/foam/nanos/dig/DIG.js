/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.dig',
  name: 'DIG',
  extends: 'foam.nanos.http.DefaultHttpParameters',

  documentation: `Data Integration Gateway - Perform DAO operations against a web service.
NOTE: when using the java client, the first call to a newly started instance may time-out as lazy nspec services startup.`,

  requires: [
    'foam.net.web.HTTPRequest'
  ],

  implements: [
    'foam.mlang.Expressions',
    'foam.nanos.auth.CreatedAware',
    'foam.nanos.auth.CreatedByAware',
    'foam.nanos.auth.LastModifiedAware',
    'foam.nanos.auth.LastModifiedByAware'
  ],

  javaImports: [
    'foam.box.socket.SslContextFactory',
    'foam.core.FOAMException',
    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.dao.DOP',
    'foam.lib.formatter.FObjectFormatter',
    'foam.lib.formatter.JSONFObjectFormatter',
    'foam.lib.json.JSONParser',
    'foam.nanos.dig.bench.DIGBenchmark',
    'foam.nanos.dig.exception.DigErrorMessage',
    'foam.nanos.dig.exception.DigSuccessMessage',
    'foam.nanos.logger.Loggers',
    'foam.nanos.pm.PM',
    'foam.nanos.session.Session',
    'foam.util.SafetyUtil',
    'java.net.Authenticator',
    'java.net.CookieHandler',
    'java.net.CookieManager',
    'java.net.http.HttpClient',
    'java.net.http.HttpRequest',
    'java.net.http.HttpResponse',
    'java.net.http.HttpTimeoutException',
    'java.net.URI',
    'java.net.URLEncoder',
    'java.time.Duration',
    'java.util.Base64',
    'javax.net.ssl.SSLContext',
    'javax.servlet.http.HttpServletRequest',
  ],

  imports: [
    'AuthenticatedNSpecDAO'
  ],

  tableColumns: [
    'id',
    'daoKey.name',
    'cmd',
    'format'
  ],

  constants: [
    {
      name: 'MAX_URL_SIZE',
      value: 2000,
      type: 'Integer'
    }
  ],

  sections: [
    {
      name: 'details'
    },
    {
      name: 'supportDetails'
    },
    {
      name: '_defaultSection',
      permissionRequired: true
    }
  ],

  properties: [
    {
      name: 'id',
      label: 'Request Name',
      section: 'details'
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'createdBy',
      section: 'supportDetails'
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'createdByAgent',
      section: 'supportDetails'
    },
    {
      class: 'DateTime',
      name: 'created',
      documentation: 'The date and time of when the User was created in the system.',
      createVisibility: 'HIDDEN',
      updateVisibility: 'RO',
      section: 'supportDetails',
      includeInDigest: true
    },
    {
      class: 'DateTime',
      name: 'lastModified',
      documentation: 'The date and time the User was last modified.',
      createVisibility: 'HIDDEN',
      updateVisibility: 'RO',
      section: 'supportDetails',
      storageOptional: true
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'lastModifiedBy',
      section: 'supportDetails',
      readPermissionRequired: true,
      writePermissionRequired: true,
      storageOptional: true
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'lastModifiedByAgent',
      section: 'supportDetails',
      readPermissionRequired: true,
      writePermissionRequired: true,
      storageOptional: true
    },
    {
      class: 'Reference',
      of: 'foam.nanos.boot.NSpec',
      label: 'Data Access Object (DAO)',
      name: 'daoKey',
      // required: true, // TODO: make required when working
      documentation: `The DAO in the DIG request.`,
      targetDAOKey: 'AuthenticatedNSpecDAO',
      view: function(_, X) {
        var E = foam.mlang.Expressions.create();
        return {
          class: 'foam.u2.view.RichChoiceView',
          search: true,
          sections: [
            {
              heading: 'DAO',
              dao: X.AuthenticatedNSpecDAO
                .where(E.AND(
                  E.EQ(foam.nanos.boot.NSpec.SERVE, true),
                  E.ENDS_WITH(foam.nanos.boot.NSpec.ID, 'DAO')
                ))
                .orderBy(foam.nanos.boot.NSpec.ID)
            }
          ]
        };
      },
      section: 'details'
    },
    {
      name: 'cmd',
      label: 'API Command',
      section: 'details'
    },
    {
      name: 'format',
      label: 'Data Format',
      section: 'details',
      visibility: function(cmd) {
        return ( cmd == 'SELECT' || cmd == 'PUT' ) ? foam.u2.DisplayMode.RW : foam.u2.DisplayMode.HIDDEN;
      }
    },
    {
      class: 'String',
      name: 'key',
      label: 'Object ID',
      section: 'details',
      visibility: function(cmd) {
        return ( cmd == 'SELECT' || cmd == 'REMOVE' ) ? foam.u2.DisplayMode.RW : foam.u2.DisplayMode.HIDDEN;
      }
  },
  {
      class: 'String',
      name: 'q',
      label: 'Select Query',
      section: 'details',
      visibility: function(cmd) {
        return (cmd == 'SELECT') ? foam.u2.DisplayMode.RW : foam.u2.DisplayMode.HIDDEN;
      }
    },
    {
      class: 'Long',
      name: 'limit',
      section: 'details',
      visibility: function(cmd) {
        return (cmd == 'SELECT') ? foam.u2.DisplayMode.RW : foam.u2.DisplayMode.HIDDEN;
      },
      value: 1000,
      min: 0
    },
    {
      class: 'Long',
      name: 'skip',
      section: 'details',
      visibility: function(cmd) {
        return (cmd == 'SELECT') ? foam.u2.DisplayMode.RW : foam.u2.DisplayMode.HIDDEN;
      },
      min: 0
    },
    {
      name: 'data',
      section: 'details',
      visibility: function(cmd) {
        return (cmd == 'PUT') ? foam.u2.DisplayMode.RW : foam.u2.DisplayMode.HIDDEN;
      }
    },
    {
      class: 'Map',
      name: 'fieldNameMapping',
      section: 'details',
      view: { class: 'foam.u2.view.MapView' },
      visibility: function(cmd) {
        return (cmd == 'PUT') ? foam.u2.DisplayMode.RW : foam.u2.DisplayMode.HIDDEN;
      }
    },
    {
      class: 'Map',
      name: 'fieldDefaultValue',
      section: 'details',
      view: { class: 'foam.u2.view.MapView' },
      visibility: function(cmd) {
        return (cmd == 'PUT') ? foam.u2.DisplayMode.RW : foam.u2.DisplayMode.HIDDEN;
      }
    },
    {
// Don't make a URL because JS doesn't include the protocol host or port,
// meaning it doesn't pass validation.
//      class: 'URL',
      class: 'String',
      name: 'postURL',
      hidden: true,
      // Why is the javaFactory needed?
      javaFactory: 'return "http://"+System.getProperty("hostname", "localhost")+":8080";',
      expression: function(key, fieldNameMapping, fieldDefaultValue, daoKey, cmd, format, q, limit, skip) {
        var query = false;
        var url   = "/service/dig";

        if ( daoKey ) {
          url += "?";
          query = true;
          url += "dao=" + daoKey;
        }
        if ( Object.keys(fieldNameMapping).length != 0 ) {
          url += query ? "&" : "?";
          query = true;
          url += "nameMapping=" + JSON.stringify(fieldNameMapping);
        }
        if ( Object.keys(fieldDefaultValue).length != 0 ) {
          url += query ? "&" : "?";
          query = true;
          url += "fieldValue=" + JSON.stringify(fieldDefaultValue);
        }
        if ( cmd ) {
          url += query ? "&" : "?";
          query = true;
          url += "cmd=" + cmd.name.toLowerCase();
        }
        if ( format ) {
          url += query ? "&" : "?";
          query = true;
          url += "format=" + format.toLowerCase();
        }
        if ( key ) {
          url += query ? "&" : "?";
          query = true;
          url += "id=" + key;
        }
        if ( q ) {
          url += query ? "&" : "?";
          query = true;
          url += "q=" + encodeURIComponent(q);
        }
        if ( limit > 0 && limit != Number.MAX_SAFE_INTEGER && limit != 1000 ) {
          url += query ? "&" : "?";
          query = true;
          url += "limit=" + limit;
        }
        if ( skip > 0 && skip != Number.MAX_SAFE_INTEGER ) {
          url += query ? "&" : "?";
          query = true;
          url += "skip=" + skip;
        }

        return url;
      }
    },
    {
      name: 'snippet',
      label: 'Snippet',
      documentation: 'show a specific type of request would look like in a given language.',
      section: 'details',
      view: { class: 'foam.nanos.dig.DigSnippetView' },
      transient: true,
      expression: function(postURL, data) {
        if ( data ) {
          if ( data.length + postURL.length < this.MAX_URL_SIZE ) {
            postURL += postURL.indexOf('?') == -1 ? "?" : "&";
            postURL += "data=" + encodeURIComponent(data);
          }
        }

        return postURL;
      }
    },
    {
      class: 'String',
      name: 'result',
      value: 'No Request Sent Yet.',
      view: { class: 'foam.nanos.dig.ResultView' },
      section: 'details',
      transient: true,
      visibility: 'RO'
    },
    {
      class: 'String',
      name: 'description',
      section: 'details',
      view: { class: 'foam.u2.tag.TextArea', rows: 4, cols: 144 }
    },
    {
      documentation: 'deprecated',
      name: 'nSpecName',
      class: 'String',
      visibility: 'HIDDEN',
      transient: true,
      javaSetter: 'setDaoKey(val);'
    },
    {
      documentation: 'Session token / BEARER token',
      name: 'sessionId',
      class: 'String',
      // javaFactory: 'return getX().get(Session.class).getId();',
      visibility: 'HIDDEN'
    },
    {
      documentation: 'Basic Auth',
      name: 'userName',
      class: 'String',
      value: 'admin',
      visibility: 'HIDDEN'
    },
    {
      name: 'password',
      class: 'Password',
      visibility: 'HIDDEN'
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
    },
    {
      name: 'secure',
      class: 'Boolean',
      javaFactory: `return getPostURL().contains("https");`,
      visibility: 'HIDDEN'
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
      value: 'dig',
      visibility: 'HIDDEN'
    },
    {
      name: 'of',
      class: 'Class',
      javaFactory: `
        DAO dao = (DAO) foam.core.XLocator.get().get(getDaoKey());
        return dao.getOf();
      `,
      hidden: true,
      transient: true
    }
  ],

  actions: [
    {
      name: 'postButton',
      label: 'Send Request',
      section: "details",
      code: async function() {
        var url = window.location.origin + this.postURL + "&sessionId=" + localStorage.defaultSession;
        var req = this.HTTPRequest.create({
          url: url,
          method: 'POST',
          payload: this.data,
        }).send();

        var resp = await req.then(async function(resp) {
          var temp = await resp.payload.then(function(result) {
            return result;
          });
          return temp;
        }, async function(error) {
          var temp = await error.payload.then(function(result) {
            return result;
          });
          return temp;
        });
        this.result = resp;
      }
    }
  ],

  javaCode: `
  public DIG(X x, String nSpecName, DIGBenchmark benchmark) {
    this(x);
    setNSpecName(nSpecName);
    setPostURL(benchmark.getSetupUrl());
    setSessionId(benchmark.getSetupSessionId());
    setUserName(benchmark.getSetupUserName());
    setPassword(benchmark.getSetupPassword());
    setConnectionTimeout(benchmark.getConnectionTimeout());
    setRequestTimeout(benchmark.getRequestTimeout());
  }

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
        SslContextFactory contextFactory = (SslContextFactory) getX().get("sslContextFactory");
        if ( contextFactory != null && contextFactory.getEnableSSL() ) {
          SSLContext sslContext = contextFactory.getSSLContext();
          builder = builder.sslContext(sslContext);
        } else if ( contextFactory == null ) {
          new foam.nanos.logger.StdoutLogger(getX()).warning("DIG", "sslContextFactory", "not found");
        } else if ( ! contextFactory.getEnableSSL() ) {
          new foam.nanos.logger.StdoutLogger(getX()).warning("DIG", "sslContextFactory", "ssl not enabled");
        }
     }
      // store and accept ORIGINAL_SERVER
      builder.cookieHandler(new CookieManager());
      return builder.build();
    }
  };

  protected ThreadLocal<JSONParser> parser_ = new ThreadLocal<JSONParser>() {
    @Override
    protected JSONParser initialValue() {
      return getX().create(JSONParser.class);
    }
  };
  `,

  methods: [
    {
      name: 'find',
      args: 'Object id',
      type: 'foam.core.FObject',
      javaCode: 'return find_(getX(), id);'
    },
    {
      name: 'find_',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'id',
          type: 'Object'
        }
      ],
      type: 'foam.core.FObject',
      javaCode: `
      Object result = submit(x, DOP.SELECT, "id=" + id.toString());
      if ( result == null ) return null;
      if ( result instanceof FObject[] ) {
        if ( ((FObject[])result).length > 0 ) {
          return ((FObject[]) result)[0];
        }
        return null;
      }
      return (FObject) result;
      `
    },
    {
      name: 'put',
      args: 'FObject obj',
      type: 'foam.core.FObject',
      javaCode: 'return put_(getX(), obj);'
    },
    {
      name: 'put_',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'obj',
          type: 'foam.core.FObject'
        }
      ],
      type: 'foam.core.FObject',
      javaCode: `
      // Special support for Sessions as they must go through SUGAR
      if ( "sessionDAO".equals(getDaoKey()) ) {
        Session session = (Session) obj;
        String id = createSession(x, session);
        session.setId(id);
        return session;
      }

      return (FObject) submit(x, DOP.PUT, adapt(x, DOP.PUT, obj));
      `
    },
    {
      name: 'query',
      args: 'String query',
      type: 'Object',
      javaCode: 'return query_(getX(), 0L, 0L, query);'
    },
    {
      documentation: `NOTE: limit 1 will return single entry, not [].`,
      name: 'query_',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'skip',
          type: 'Long'
        },
        {
          name: 'limit',
          type: 'Long'
        },
        {
          name: 'query',
          type: 'String'
        }
      ],
      type: 'Object',
      javaCode: `
      StringBuilder sb = new StringBuilder();
      if ( skip > 0 ) {
        sb.append("skip=");
        sb.append(skip);
      }

      if ( sb.length() > 0 ) sb.append("&");
      sb.append("limit=");
      if ( limit == 0 ) limit = 1000;
      sb.append(limit);

      if ( ! SafetyUtil.isEmpty(query) ) {
        if ( sb.length() > 0 ) sb.append("&");
        sb.append("q=");
        try {
          sb.append(URLEncoder.encode(query, "UTF-8"));
        } catch ( java.io.UnsupportedEncodingException e ) {
          throw new RuntimeException(e);
        }
      }
      Object result = submit(x, DOP.SELECT, sb.toString());
      if ( result == null ) return null;
      if ( result instanceof FObject[] ) {
        if ( limit == 1 &&
             ((FObject[]) result).length > 0 ) {
          return ((FObject[]) result)[0];
        }
        return result;
      }
      if ( limit == 1 ) return result;
      return new FObject[] { (FObject) result };
      `
    },
    {
      name: 'remove',
      args: 'Object obj',
      type: 'foam.core.FObject',
      javaCode: 'return remove_(getX(), obj);'
    },
    {
      name: 'remove_',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'obj',
          type: 'Object'
        },
      ],
      type: 'foam.core.FObject',
      javaCode: `
      String id = obj.toString();
      if ( obj instanceof FObject ) id = ((FObject)obj).getProperty("id").toString();
      try {
        return (FObject) submit(x, DOP.REMOVE, "id="+id);
      } catch ( DigSuccessMessage e ) {
        return null;
      } catch ( FOAMException e ) {
        throw e;
      }
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
      PM pm = PM.create(x, "DIG", "adapt", getPostURL(), getDaoKey(), dop);
      try {
        FObjectFormatter formatter = formatter_.get();
        formatter.output(obj);
        return formatter.builder().toString();
      } finally {
        pm.log(x);
      }
      `
    },
    {
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
      PM pm = PM.create(x, "DIG", "unAdapt", getPostURL(), getDaoKey(), dop);
      try {
        Object result = parser_.get().parseString(data.toString(), getOf().getObjClass());
        if ( result == null ) {
          // ClassReferenceParser returns null when data is not a modelled class
          return data.toString();
        }
        if ( result instanceof FOAMException ) {
          throw (FOAMException) result;
        }
        return result;
      } catch ( FOAMException e ) {
        throw e;
      } catch ( RuntimeException e ) {
        Throwable cause = e;
        while ( cause.getCause() != null ) {
          cause = cause.getCause();
        }
        Loggers.logger(x, this).error("unAdapt", "Failed to parse", getDaoKey(), getOf(), data, cause);
        throw e;
      } finally {
        pm.log(x);
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
      sb.append(getPostURL());
      sb.append("/service/");
      sb.append(getServiceName());
      sb.append("?cmd=");
      sb.append(dop.getLabel());
      if ( ! SafetyUtil.isEmpty(getDaoKey()) ) {
        sb.append("&dao=");
        sb.append(getDaoKey());
      }
      if ( dop == DOP.FIND ||
           dop == DOP.SELECT ||
           dop == DOP.REMOVE ) {
        sb.append("&");
        sb.append(data);
      }
      sb.append("&format=JSON");
      sb.append("&multiline=false");
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
      type: 'Object',
      javaCode: `
      String url = buildUrl(x, dop, data);
      // Loggers.logger(x, this).debug("submit", "request", dop, url);
      HttpRequest.Builder builder = HttpRequest.newBuilder()
        .uri(URI.create(url))
        .timeout(Duration.ofMillis(getRequestTimeout()))
        .header("Accept-Language", "en-US,en;q=0.5")
        .header("Content-Type", "application/json")
        .header("User-Agent", "Mozilla/5.0");
      if ( ! SafetyUtil.isEmpty(getSessionId()) ) {
        builder = builder.header("Authorization", "BEARER "+getSessionId());
      } else if ( ! SafetyUtil.isEmpty(getPassword()) ) {
        builder = builder.header("Authorization", "BASIC "+Base64.getEncoder().encodeToString((getUserName()+":"+getPassword()).getBytes()));
      } else {
        Loggers.logger(x, this).warning("submit", "Missing auth details", "session", getSessionId(), "username", getUserName(), "password", getPassword());
        throw new IllegalArgumentException("Missing auth details");
      }
      if ( dop == DOP.PUT ) {
        builder = builder.POST(HttpRequest.BodyPublishers.ofString(data));
      }
      HttpRequest request = builder.build();
      try {
        HttpClient client = client_.get();
        HttpResponse<String> response = null;
        PM pm = PM.create(x, "DIG", "send", getPostURL(), getDaoKey(), dop);
        try {
          response = client.send(request, HttpResponse.BodyHandlers.ofString());
        } finally {
          pm.log(x);
        }
        if ( response.statusCode() != 200 ) {
          Loggers.logger(x, this).warning("submit", "request", dop, url, "response", response.statusCode(), response.body());
        } else {
          // Loggers.logger(x, this).debug("submit", "request", dop, url, "response", response.statusCode(), response.body());
        }
        if ( SafetyUtil.isEmpty(response.body()) ) return null;
        Object result = unAdapt(x, dop, response.body());
        // Empty array has a trailing new line - assume server side dig is doing this.
        if ( result instanceof String &&
             result.toString().startsWith("[]") ) {
          return null;
        }
        return result;
      } catch (DigSuccessMessage e) {
        throw e;
      } catch (FOAMException e) {
        Loggers.logger(x, this).error("submit", "request", dop, url, "response", e.getClass().getSimpleName(), e.getMessage(), e);
        throw e;
      } catch (HttpTimeoutException e) {
        Loggers.logger(x, this).warning("submit", "request", dop, url, "response", e.getMessage(), "timeout", getRequestTimeout());
        throw new RuntimeException(e);
      } catch (java.io.IOException | InterruptedException e) {
        Loggers.logger(x, this).warning("submit", "request", dop, url, "response", e.getMessage());
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

      DIG client = new DIG(x);
      client.copyFrom(this);
      client.setServiceName("sugar");
      client.setOf(Session.getOwnClassInfo());

      Object obj = client.submit(x, DOP.PUT, sb.toString());
      if ( obj == null ) return null;
      String id = obj.toString();
      // HttpRequest or SUGAR response is quoted, need to strip.
      if ( id.startsWith("\\"") ) {
        id = id.substring(1, id.length() - 2);
      }
      return id;
      `
    }
  ]
});
