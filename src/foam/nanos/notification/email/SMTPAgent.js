/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.notification.email',
  name: 'SMTPAgent',

  implements: [
    'foam.core.ContextAgent',
    'foam.nanos.NanoService'
  ],

  documentation: 'Implementation of Email Service using SMTP',

  javaImports: [
    'foam.blob.Blob',
    'foam.blob.BlobService',
    'foam.blob.FileBlob',
    'foam.blob.IdentifiedBlob',
    'foam.blob.InputStreamBlob',
    'foam.core.ContextAgent',
    'foam.core.ContextAgentTimerTask',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.dao.ArraySink',
    'foam.log.LogLevel',
    'foam.nanos.er.EventRecord',
    'foam.nanos.cron.Cron',
    'foam.nanos.fs.File',
    'foam.nanos.logger.Logger',
    'foam.nanos.logger.Loggers',
    'foam.nanos.om.OMLogger',
    'static foam.mlang.MLang.EQ',
    'java.io.ByteArrayInputStream',
    'java.io.ByteArrayOutputStream',
    'java.io.InputStream',
    'java.util.Date',
    'java.util.List',
    'java.util.Map',
    'java.util.Properties',
    'java.util.Timer',
    'javax.activation.DataHandler',
    'javax.activation.DataSource',
    'javax.mail.*',
    'javax.mail.internet.*',
    'javax.mail.util.ByteArrayDataSource',
    'org.apache.commons.lang3.StringUtils',
  ],

  javaCode: `
    private class SMTPAuthenticator extends javax.mail.Authenticator {
      protected String username_;
      protected String password_;

      public SMTPAuthenticator(String username, String password) {
        this.username_ = username;
        this.password_ = password;
      }

      @Override
      protected PasswordAuthentication getPasswordAuthentication() {
        return new PasswordAuthentication(this.username_, this.password_);
      }
    }
  `,

  properties: [
    {
      name: 'id',
      class: 'Reference',
      of: 'foam.nanos.notification.email.EmailServiceConfig',
      targetDAOKey: 'emailServiceConfigDAO',
      value: 'smtp'
    },
    {
      documentation: 'Track WARN EventRecord so it can be cleared on a successful operation',
      name: 'er',
      class: 'FObjectProperty',
      of: 'foam.nanos.er.EventRecord'
    },
    {
      name: 'lastConfig',
      class: 'FObjectProperty',
      of: 'foam.nanos.notification.email.EmailServiceConfig',
      visibility: 'HIDDEN',
      transient: true
    },
    {
      documentation: 'Store reference to timer so it can be cancelled, and agent restarted.',
      name: 'timer',
      class: 'Object',
      visibility: 'HIDDEN',
      transient: true
    },
    {
      name: 'session_',
      javaType: 'Session',
      class: 'Object',
      visibility: 'HIDDEN',
      transient: true,
      javaFactory: `
        Properties props = new Properties();
        EmailServiceConfig config = findId(getX());
        props.setProperty("mail.smtp.auth", config.getAuthenticate() ? "true" : "false");
        props.setProperty("mail.smtp.starttls.enable", config.getStarttls() ? "true" : "false");
        props.setProperty("mail.smtp.host", config.getHost());
        props.setProperty("mail.smtp.port", config.getPort());
        if ( config.getAuthenticate() ) {
          return Session.getInstance(props, new SMTPAuthenticator(config.getUsername(), config.getPassword()));
        }
        return Session.getInstance(props);
      `
    },
    {
      class: 'Object',
      javaType: 'Transport',
      name: 'transport_',
      visibility: 'HIDDEN',
      transient: true,
      javaFactory: `
        Logger logger = Loggers.logger(getX(), this);
        OMLogger omLogger = (OMLogger) getX().get("OMLogger");
        EmailServiceConfig config = findId(getX());
        Transport transport = null;
        try {
          omLogger.log(this.getClass().getSimpleName(), "transport", "connecting");
          transport = getSession_().getTransport("smtp");
          transport.connect(config.getUsername(), config.getPassword());
          logger.info("transport", "connected");
          omLogger.log(this.getClass().getSimpleName(), "transport", "connected");
          EventRecord er = getEr();
          if ( er != null ) {
            er = (EventRecord) er.fclone();
            er.setSeverity(LogLevel.INFO);
            clearEr();
            ((DAO) getX().get("eventRecordDAO")).put(er);
          }
        } catch ( Exception e ) {
          setEr((EventRecord)((DAO) getX().get("eventRecordDAO")).put(new EventRecord(getX(), this, "connect", config.getHost(), null, e.getMessage(), LogLevel.ERROR, e)));
          clearSession_();
          disable();
          throw new foam.core.FOAMException(e);
        }
        return transport;
      `
    },
  ],

  methods: [
    {
      name: 'start',
      javaCode: `
      String partner = getId();
      EmailServiceConfig config = findId(getX());
      if ( config == null ) {
        config = new EmailServiceConfig(); // use default timer values
      } else {
        partner = config.getHost();
      }
      ((DAO) getX().get("eventRecordDAO")).put(new EventRecord(getX(), this, "start", partner, null, null, LogLevel.INFO, null));
      Timer timer = new Timer(this.getClass().getSimpleName(), true);
      setTimer(timer);
      timer.schedule(new ContextAgentTimerTask(getX(), this),
        config.getInitialDelay(),
        config.getPollInterval()
      );
      `,
    },
    {
      name: 'stop',
      javaCode: `
      Timer timer = (Timer) getTimer();
      if ( timer != null ) {
        Loggers.logger(getX(), this).info("stop");
        timer.cancel();
        clearTimer();
      }
      `
    },
    {
      name: 'sleep',
      args: 'Long interval',
      javaCode: `
      EmailServiceConfig config = findId(getX());
      Timer timer = (Timer) getTimer();
      if ( timer != null ) {
        timer.cancel();
      }
      timer = new Timer(this.getClass().getSimpleName(), true);
      setTimer(timer);
      timer.schedule(new ContextAgentTimerTask(getX(), this),
        interval,
        config.getPollInterval()
      );
      `
    },
    {
      name: 'reload',
      javaCode: `
      EmailServiceConfig config = findId(getX());
      EmailServiceConfig lastConfig = getLastConfig();
      if ( lastConfig != null &&
           ((Map) config.diff(lastConfig)).size() > 0 ) {

        ((DAO) getX().get("eventRecordDAO")).put(new EventRecord(getX(), this, "reload", config.getHost(), null, null, LogLevel.INFO, null));
        clearTransport_();
        clearSession_();
        setLastConfig(config);
      }
      `
    },
    {
      name: 'disable',
      javaCode: `
      EmailServiceConfig config = (EmailServiceConfig) findId(getX()).fclone();
      config.setEnabled(false);
      ((DAO) getX().get("emailServiceConfigDAO")).put(config);
      ((DAO) getX().get("eventRecordDAO")).put(new EventRecord(getX(), this, "connect", config.getHost(), null, "disable on error", LogLevel.WARN, null));
      `
    },
    {
      name: 'execute',
      javaCode: `
      foam.nanos.medusa.ClusterConfigSupport support = (foam.nanos.medusa.ClusterConfigSupport) x.get("clusterConfigSupport");
      if ( support != null &&
           ! support.cronEnabled(x, true) ) {
        // Loggers.logger(x, this).debug("execution disabled");
        return;
      }

      while ( true ) {
        reload();
        EmailServiceConfig config = findId(getX());
        if ( ! config.getEnabled() ) break;

        DAO emailMessageDAO = (DAO) x.get("emailMessageDAO");
        List<EmailMessage> emailMessages = (List) ((ArraySink)
          emailMessageDAO
            .where(config.getPredicate())
            .orderBy(foam.nanos.notification.email.EmailMessage.CREATED)
            .select(new ArraySink()))
            .getArray();

        if ( emailMessages.size() == 0 ) break;

        long second = 1000L;
        long limit = config.getRateLimit();

        long endTime = System.currentTimeMillis() + second;
        long count = 1;
        for ( EmailMessage emailMessage : emailMessages ) {
          emailMessageDAO.put(send(x, emailMessage));
          count++;
          if ( limit > 0 &&
               count > limit ) {
            // super simple rate limiting.
            long remaining = endTime - System.currentTimeMillis();
            if ( remaining > 0 ) {
              sleep(remaining);
              return;
            }
            count = 1;
            endTime = System.currentTimeMillis() + second;
          }
        }
      }
      `
    },
    {
      name: 'createMimeMessage',
      javaType: 'MimeMessage',
      documentation: `Create a MimeMessage from the passed EmailMessage`,
      args: [
        {
          name: 'emailMessage',
          type: 'foam.nanos.notification.email.EmailMessage'
        }
      ],
      javaCode: `
        Logger logger = Loggers.logger(getX(), this);
        try {
          MimeMessage message = new MimeMessage(getSession_());

          // the From Property is mainly to hide our smtp user credetials.
          if ( emailMessage.isPropertySet("from") ) {
            if ( emailMessage.isPropertySet("displayName") ) {
              message.setFrom( new InternetAddress(emailMessage.getFrom(), emailMessage.getDisplayName()) );
            } else {
              message.setFrom(new InternetAddress(emailMessage.getFrom()));
            }
          } else if ( emailMessage.isPropertySet("replyTo") ) {
              if ( emailMessage.isPropertySet("displayName") ) {
                message.setFrom( new InternetAddress(emailMessage.getReplyTo(), emailMessage.getDisplayName()) );
              } else {
                message.setFrom(new InternetAddress(emailMessage.getReplyTo()));
              }
          }

          if ( emailMessage.isPropertySet("replyTo") )
            message.setReplyTo(InternetAddress.parse(emailMessage.getReplyTo()));

          if ( emailMessage.isPropertySet("subject") )
            message.setSubject(emailMessage.getSubject());

          if ( emailMessage.isPropertySet("to") ) {
            if ( emailMessage.getTo().length == 1 ) {
              message.setRecipient(Message.RecipientType.TO, new InternetAddress((emailMessage.getTo())[0], false));
            } else {
              message.setRecipients(Message.RecipientType.TO, InternetAddress.parse(StringUtils.join(emailMessage.getTo(), ",")));
            }
          }

          if ( emailMessage.isPropertySet("cc") ) {
            if ( emailMessage.getCc().length == 1 ) {
              message.setRecipient(Message.RecipientType.CC, new InternetAddress((emailMessage.getCc())[0], false));
            } else {
              message.setRecipients(Message.RecipientType.CC, InternetAddress.parse(StringUtils.join(emailMessage.getCc(), ",")));
            }
          }

          if ( emailMessage.isPropertySet("bcc") ) {
            if ( emailMessage.getBcc().length == 1 ) {
              message.setRecipient(Message.RecipientType.BCC, new InternetAddress((emailMessage.getBcc())[0], false));
            } else {
              message.setRecipients(Message.RecipientType.BCC, InternetAddress.parse(StringUtils.join(emailMessage.getBcc(), ",")));
            }
          }

          String[] attachments = emailMessage.getAttachments();
          if ( attachments != null &&
               attachments.length > 0 ) {
            Multipart multipart = new MimeMultipart();
            if ( emailMessage.isPropertySet("body") ) {
              MimeBodyPart part = new MimeBodyPart();
              part.setText(emailMessage.getBody(), "utf-8", "html");
              multipart.addBodyPart(part);
            }
            DAO fileDAO = ((DAO) getX().get("fileDAO"));
            for ( String fileId : attachments ) {
              File file = (File) fileDAO.find(fileId);
              if ( file != null ) {
                Blob blob = (Blob) file.getData();
                InputStream stream = null;
                if ( blob instanceof  IdentifiedBlob || blob == null ) {
                  String id = blob == null ? file.getId(): ((IdentifiedBlob) blob).getId();
                  BlobService blobStore = (BlobService) getX().get("blobStore");
                  FileBlob temp = (FileBlob) blobStore.find(id);
                  var os = new ByteArrayOutputStream();
                  temp.read(os, 0, temp.getSize());
                  var bytes = os.toByteArray();
                  stream = new ByteArrayInputStream(bytes);
                  os.close();
                } else {
                  stream = ((InputStreamBlob) blob).getInputStream();
                }
                try ( var in = stream; ) {
                  DataSource source = new ByteArrayDataSource(in, "application/octet-stream");
                  BodyPart part = new MimeBodyPart();
                  part.setDataHandler(new DataHandler(source));
                  part.setFileName(file.getFilename());
                  multipart.addBodyPart(part);
                }
              } else {
                logger.warning("File not found", fileId);
              }
            }
            message.setContent(multipart);
          } else {
            message.setContent(emailMessage.getBody(), "text/html");
          }

          message.setSentDate(new Date());
          logger.info("MimeMessage created");
          return message;
        } catch (Throwable t) {
          logger.error("MimeMessage creation failed", t);
          return null;
        }
      `
    },
    {
      name: 'send',
      args: 'X x, foam.nanos.notification.email.EmailMessage emailMessage',
      type: 'foam.nanos.notification.email.EmailMessage',
      javaCode: `
        Logger logger = Loggers.logger(getX(), this);
        OMLogger omLogger = (OMLogger) getX().get("OMLogger");

        if ( emailMessage.getStatus() == Status.FAILED ) {
          // ignore
          logger.debug("Email not sent, already FAILED.", emailMessage.getId());
          return emailMessage;
        }

        MimeMessage message = createMimeMessage(emailMessage);
        if ( message == null ) {
          return emailMessage;
        }

        emailMessage = (EmailMessage) emailMessage.fclone();
        try {
          getTransport_().send(message);
          emailMessage.setStatus(Status.SENT);
          emailMessage.setSentDate(message.getSentDate());
          // logger.debug("sent");
          omLogger.log(this.getClass().getSimpleName(), "message", "sent");
          EventRecord er = getEr();
          if ( er != null ) {
            er = (EventRecord) er.fclone();
            er.setSeverity(LogLevel.INFO);
            clearEr();
            ((DAO) getX().get("eventRecordDAO")).put(er);
          }
        } catch ( SendFailedException | ParseException e ) {
          EmailServiceConfig config = getLastConfig();
          if ( e.getMessage().contains("Too many login attempts") ) {
             EventRecord er = new EventRecord(getX(), this, "send", config.getHost(), null, e.getMessage(), LogLevel.ERROR, e);
            ((DAO) getX().get("eventRecordDAO")).put(er);
            setEr(er);
            clearSession_();
            disable();
          } else {
            emailMessage.setStatus(Status.FAILED);
          }
        } catch ( MessagingException e ) {
          try {
            getTransport_().close();
          } catch ( Exception e2 ) {
            logger.error("Transport close failed", e2);
          }
          clearTransport_();
          clearSession_();
          EmailServiceConfig config = getLastConfig();
          EventRecord er = new EventRecord(getX(), this, "send", config.getHost(), null, e.getMessage(), LogLevel.WARN, null);
          ((DAO) getX().get("eventRecordDAO")).put(er);
          setEr(er);
        } catch ( RuntimeException e ) {
          // already reported.
          logger.error("send failed", e.getMessage());
        }
        return emailMessage;
      `
    }
  ]
});
