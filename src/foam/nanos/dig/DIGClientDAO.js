/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.dig',
  name: 'DIGClientDAO',
  extends: 'foam.dao.NullDAO',

  javaImports: [
    'foam.box.Box',
    'foam.box.HTTPAuthorizationType',
    'foam.box.HTTPBox',
    'foam.box.ReplyBox',
    'foam.box.RPCMessage',
    'foam.box.RPCReturnBox',
    'foam.box.Message',
    'foam.box.SessionClientBox',
    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.DOP',
    'foam.lib.formatter.FObjectFormatter',
    'foam.lib.formatter.JSONFObjectFormatter',
    'foam.nanos.logger.Loggers',
    'foam.nanos.pm.PM',
    'foam.nanos.session.Session',
    'foam.util.SafetyUtil',
    'java.io.UnsupportedEncodingException',
    'java.net.URLEncoder',
    'javax.servlet.http.HttpServletRequest'
  ],

  imports: [
    'sessionID as jsSessionID'
  ],

  // NOTE: Do not export, will invalidate the browser's current session
  // exports: [
  //   'sessionId as sessionID'
  // ],

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
      return "http://"+System.getProperty("hostname", "localhost")+":8080";
      `
    },
    {
      // FIXME: getServerName or getLocalName return ipv6 address
      // which fails java.net.URL(url) creation.
      name: 'domain',
      class: 'String',
      javaFactory: `
      HttpServletRequest req = getX().get(HttpServletRequest.class);
      if ( req != null ) {
        StringBuilder sb = new StringBuilder();
        sb.append(req.getScheme());
        sb.append("://");
        // sb.append(req.getLocalName());
        sb.append(req.getServerName());
        sb.append(":");
        sb.append(req.getServerPort());
        return sb.toString();
      }
      return "http://"+System.getProperty("hostname", "localhost")+":8080";
      `,
    }
  ],

  javaCode: `
  protected static final ThreadLocal<FObjectFormatter> formatter_ = new ThreadLocal<FObjectFormatter>() {
    @Override
    protected JSONFObjectFormatter initialValue() {
      JSONFObjectFormatter formatter = new JSONFObjectFormatter();
      return formatter;
    }

    @Override
    public FObjectFormatter get() {
      FObjectFormatter formatter = super.get();
      formatter.reset();
      return formatter;
    }
  };
  `,

  methods: [
    {
      name: 'buildUrl',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
      ],
      type: 'String',
      javaCode: `
      String url = getUrl()+"/service/"+DIG_SERVICE;
      Loggers.logger(x, this).info("url", url);
      return url;
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
      name: 'prepare',
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
        }
      ],
      type: 'String',
      javaCode: `
      StringBuilder sb = new StringBuilder();
      sb.append("dao=");
      sb.append(getNSpecName());
      sb.append("&format=JSON");
      sb.append("&cmd=");
      sb.append(dop.getLabel());

      switch ( dop ) {
        case PUT:
          sb.append("&data=p(");
          // TODO: encodeuricomponent
          sb.append(data);
          sb.append(")");
          break;
        case FIND:
          sb.append("&id=");
          // TODO: encodeuricomponent
          sb.append(data);
          break;
        // case SELECT:
        //  sb.append("&q=");
        //  skip, limit,
        //  break;
        case CMD:
          sb.append("&cmd=");
          // TODO: encodeuricomponent
          sb.append(data);
          break;
      }
      return sb.toString();
      `
    },
    {
      name: 'put_',
      javaCode: `
      String data = adapt(x, obj);
      // try {
      //  data = URLEncoder.encode(data, "UTF-8");
      // } catch (UnsupportedEncodingException e) {
      //   Loggers.logger(x, this).error(e);
      // }
      Loggers.logger(x, this).info("object", obj);
      Loggers.logger(x, this).info("adapted", data);
      data = prepare(x, DOP.PUT, data);
      Loggers.logger(x, this).info("prepared", data);
      Object result = submit(x, DOP.PUT, data);
      Loggers.logger(x, this).info("response", result);
      return null;
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
      Box box = new SessionClientBox.Builder(x)
        .setSessionID(getSessionId())
        .setDelegate(new HTTPBox.Builder(x)
          .setAuthorizationType(HTTPAuthorizationType.BEARER)
          .setSessionID(getSessionId())
          .setUrl(buildUrl(x))
          .build())
        .build();
      // ReplyBox replyBox = x.create(ReplyBox.class);
      RPCReturnBox replyBox = x.create(RPCReturnBox.class);
      Message msg = x.create(Message.class);
      msg.getAttributes().put("replyBox", replyBox);
      msg.setObject(data);
      box.send(msg);
      try {
        replyBox.getSemaphore().acquire();
      } catch (Throwable t) {
        throw new RuntimeException(t);
      }

      Object reply = replyBox.getMessage().getObject();
      Object result = reply; //unAdapt(x, DOP.PUT, reply);
      return result;
      `
    }
  ]
});
