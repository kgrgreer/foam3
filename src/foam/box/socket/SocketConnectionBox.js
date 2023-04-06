/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */
foam.CLASS({
  package: 'foam.box.socket',
  name: 'SocketConnectionBox',

  documentation: `Establishes a socket connection managed by the SocketConnectionBoxManager, with synchronous 'send' and asychronous 'receive'.`,

  implements: [
    'foam.box.Box',
    'foam.core.ContextAgent'
  ],

  javaImports: [
    'foam.box.Box',
    'foam.box.Message',
    'foam.box.ReplyBox',
    'foam.box.RPCErrorMessage',
    'foam.core.ContextAgent',
    'foam.core.FObject',
    'foam.core.X',
    'foam.lib.json.JSONParser',
    'foam.nanos.logger.PrefixLogger',
    'foam.nanos.logger.Logger',
    'foam.nanos.om.OMLogger',
    'foam.nanos.pm.PM',
    'java.io.BufferedInputStream',
    'java.io.BufferedOutputStream',
    'java.io.DataInputStream',
    'java.io.DataOutputStream',
    'java.io.EOFException',
    'java.io.InputStream',
    'java.io.InputStreamReader',
    'java.io.IOException',
    'java.io.OutputStream',
    'java.io.OutputStreamWriter',
    'java.net.Socket',
    'java.net.SocketException',
    'java.nio.ByteBuffer',
    'java.nio.charset.StandardCharsets',
    'java.util.Map',
    'java.util.HashMap',
    'java.util.Collections',
    'java.util.concurrent.atomic.AtomicInteger',
    'java.util.concurrent.atomic.AtomicLong',
    'java.util.concurrent.atomic.AtomicBoolean'
  ],

  constants: [
    {
      name: 'REPLY_BOX_ID',
      value: 'REPLY_BOX_ID',
      type: 'String'
    }
  ],

  properties: [
    {
      documentation: 'managed by SocketConnectionBoxManager',
      name: 'key',
      class: 'String'
    },
    {
      name: 'socket',
      class: 'Object',
      visibility: 'HIDDEN'
    },
    {
      name: 'id',
      class: 'String',
      javaFactory: 'return getKey();'
    },
    {
      documentation: 'Set to false when send exits, triggering execute to exit',
      name: 'valid',
      class: 'Object',
      javaType: 'AtomicBoolean',
      visibility: 'HIDDEN',
      javaFactory: `
        return new AtomicBoolean(true);
      `
    },
    {
      name: 'replyBoxes',
      class: 'Map',
      javaFactory: `return new java.util.concurrent.ConcurrentHashMap<String, BoxHolder>();`,
      visibility: 'HIDDEN',
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
          this.getClass().getSimpleName(),
          getKey()
        }, (Logger) getX().get("logger"));
      `
    }
  ],

  javaCode: `
    public SocketConnectionBox(X x, String key, Socket socket)
      throws IOException
    {
      setX(x);
      setKey(key);
      setSocket(socket);

      out_ = new DataOutputStream(new BufferedOutputStream(socket.getOutputStream()));
      in_ = new DataInputStream(new BufferedInputStream(socket.getInputStream()));
      pending_ = new AtomicLong();
    }

    protected DataInputStream in_;
    protected DataOutputStream out_;
    protected AtomicLong pending_;

    protected static final ThreadLocal<foam.lib.formatter.FObjectFormatter> formatter_ = new ThreadLocal<foam.lib.formatter.FObjectFormatter>() {
      @Override
      protected foam.lib.formatter.JSONFObjectFormatter initialValue() {
        foam.lib.formatter.JSONFObjectFormatter formatter = new foam.lib.formatter.JSONFObjectFormatter();
        formatter.setQuoteKeys(true);
        formatter.setPropertyPredicate(new foam.lib.ClusterPropertyPredicate());
        return formatter;
      }

      @Override
      public foam.lib.formatter.FObjectFormatter get() {
        foam.lib.formatter.FObjectFormatter formatter = super.get();
        formatter.reset();
        return formatter;
      }
    };

    protected byte [] readBytes (InputStream in, int expectedSize)
      throws IOException {
      final byte[] buffer = new byte[expectedSize];
      int totalReadSize = 0;
      while (totalReadSize < expectedSize) {
        int readSize = in.read(buffer, totalReadSize, expectedSize - totalReadSize);
        if (readSize < 0) throw new EOFException ();
        totalReadSize += readSize;
      }
      return buffer;
    }

    protected ThreadLocal<JSONParser> parser_ = new ThreadLocal<JSONParser>() {
      @Override
      protected JSONParser initialValue() {
        return getX().create(JSONParser.class);
      }
    };
  `,

  methods: [
    {
      documentation: `Send format:
length: 1 byte, // message byte length
message
NOTE: duplicated in SocketConnectionReplyBox
`,
      name: 'send',
      javaCode: `
      long pending = pending_.incrementAndGet();
      PM pm = PM.create(getX(), this.getClass().getSimpleName(), getId(), "send");
      Box replyBox = (Box) msg.getAttributes().get("replyBox");
      String replyBoxId = null;
      if ( replyBox != null ) {
        replyBoxId = java.util.UUID.randomUUID().toString();
        getReplyBoxes().put(replyBoxId, new BoxHolder(replyBox, PM.create(getX(), this.getClass().getSimpleName(), getId()+":roundtrip")));
        SocketClientReplyBox box = new SocketClientReplyBox(replyBoxId);
        if ( replyBox instanceof ReplyBox ) {
          ((ReplyBox)replyBox).setDelegate(box);
          // getLogger().debug("send", "replyBox.setDelegate");
        } else {
          msg.getAttributes().put("replyBox", box);
        }
      }
      String message = null;
      try {
        OMLogger omLogger = (OMLogger) getX().get("OMLogger");
        foam.lib.formatter.FObjectFormatter formatter = formatter_.get();
        formatter.setX(getX());
        formatter.output(msg);
        message = formatter.builder().toString();
        byte[] messageBytes = message.getBytes(StandardCharsets.UTF_8);
        Socket socket = (Socket) getSocket();
        if ( socket.isClosed() ||
             ! socket.isConnected() ) {
          throw new SocketException("Socket not connected.");
        }
        omLogger.log(this.getClass().getSimpleName(), getId(), "pending");
        synchronized (out_) {
          // NOTE: enable along with send debug call in SocketServerProcessor to monitor all messages.
          // getLogger().debug("send", "replyBoxId", replyBoxId, "pre-formating", msg);
          // getLogger().debug("send", "replyBoxId", replyBoxId, "formatted", message);
          out_.writeInt(messageBytes.length);
          out_.write(messageBytes);
          omLogger.log(this.getClass().getSimpleName(), getId(), "sent");
        }
        // If no other send operations immediately pending, then flush
        if ( pending == pending_.longValue() ) {
          out_.flush();
        }
      } catch ( Throwable t ) {
        pm.error(getX(), t);
        // TODO: perhaps report last exception on key via manager.
        getLogger().error("Error sending message", message, t);
        getValid().getAndSet(false);
        if ( replyBox != null ) {
         Message reply = new Message();
         reply.getAttributes().put("replyBox", replyBox);
         reply.replyWithException(t);
         getReplyBoxes().remove(replyBoxId);
         releaseHoldingThread(t);
        } else {
          throw new RuntimeException(t);
        }
      } finally {
        pm.log(getX());
      }
      `
    },
    {
      name: 'execute',
      args: [
        {
          name: 'x',
          type: 'Context'
        }
      ],
      javaCode: `
      OMLogger omLogger = (OMLogger) x.get("OMLogger");
      try {
        while ( getValid().get() ) {
          PM pm = null;
          try {
            omLogger.log(this.getClass().getSimpleName(), getId(), "receive");
            pm = PM.create(x, this.getClass().getSimpleName(), getId(), "receive");

            int length = in_.readInt();
            byte[] bytes = readBytes(in_, length);
            String data = new String(bytes, 0, length, StandardCharsets.UTF_8);
            Message msg = (Message) parser_.get().parseString(data);
            if ( msg == null ) {
              throw new IllegalArgumentException("Failed to parse. message: "+data);
            }

            String replyBoxId = (String) msg.getAttributes().get(REPLY_BOX_ID);
            if ( replyBoxId != null ) {
              Box replyBox = null;
              BoxHolder holder = (BoxHolder) getReplyBoxes().get(replyBoxId);
              if ( holder != null ) {
                replyBox = holder.getBox();
                pm = holder.getPm();
                pm.log(x);
              } else {
                getLogger().warning("BoxHolder not found", replyBoxId);
                replyBox = (Box) msg.getAttributes().get("replyBox");
              }
              if ( replyBox == null ) {
                getLogger().error("ReplyBox not found", replyBoxId);
                ((foam.dao.DAO) x.get("alarmDAO")).put(new foam.nanos.alarming.Alarm("ReplyBox not found"));
                throw new RuntimeException("ReplyBox not found. message: "+data);
              }
              getReplyBoxes().remove(replyBoxId);
              // getLogger().debug("receive", "replyBoxId", replyBoxId, data);
              replyBox.send(msg);
            } else {
              Object o = msg.getObject();
              if ( o != null &&
                   o instanceof foam.box.RPCErrorMessage ) {
                foam.box.RemoteException re = (foam.box.RemoteException) ((foam.box.RPCErrorMessage) o).getData();
                getLogger().warning("RemoteException", re.getId(), re.getMessage(), re.getException() != null ? re.getException().getClass().getName() : "");
                if ( re.getException() != null ) {
                  throw (foam.core.FOAMException) re.getException();
                }
                throw new RuntimeException(re.getMessage());
              }
              getLogger().error("Failed to process reply", data);
              throw new RuntimeException("Failed to process reply. message: "+data);
            }
          } catch ( java.net.SocketTimeoutException e ) {
            // getLogger().debug("SocketTimeoutException", e.getMessage());
            continue;
          } catch ( Throwable t ) {
            getLogger().error(t);
            if ( pm != null ) pm.error(x, t);
            releaseHoldingThread(t);
            break;
          } finally {
            if ( pm != null) pm.log(x);
          }
        }
      } finally {
        ((SocketConnectionBoxManager) getX().get("socketConnectionBoxManager")).remove(this);
      }
      `
    },
    {
      name: 'releaseHoldingThread',
      args: 'Throwable t',
      synchronized: true,
      javaCode: `
        int i = 0;
        for (Map.Entry<String, BoxHolder> entry : ((Map<String, BoxHolder>) getReplyBoxes()).entrySet()) {
          BoxHolder holder = entry.getValue();
          Box replyBox = holder.getBox();
          if ( replyBox != null ) {
            Message reply = new Message();
            reply.getAttributes().put("replyBox", replyBox);
            reply.replyWithException(t);
          }
          getReplyBoxes().remove(entry.getKey());
          i++;
        }
        getLogger().warning("Terminating reply boxes", getKey());
        getLogger().debug("free reply box: " + i);
      `
    }
  ]
});
