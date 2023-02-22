/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.notification.email',
  name: 'EmailFolderAgent',

  implements: [
    'foam.core.ContextAgent',
    'foam.nanos.NanoService'
  ],

  documentation: `Agent which retrieves a email folders messages`,

  javaImports: [
    'foam.blob.Blob',
    'foam.blob.InputStreamBlob',
    'foam.core.ContextAgent',
    'foam.core.ContextAgentTimerTask',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.log.LogLevel',
    'foam.nanos.auth.User',
    'foam.nanos.auth.LifecycleState',
    'foam.nanos.er.EventRecord',
    'foam.nanos.logger.PrefixLogger',
    'foam.nanos.logger.Logger',
    'foam.nanos.logger.Loggers',
    'foam.nanos.om.OMLogger',
    'foam.nanos.fs.File',
    'static foam.mlang.MLang.EQ',
    'java.io.InputStream',
    'java.io.ByteArrayOutputStream',
    'java.io.ByteArrayInputStream',
    'java.util.ArrayList',
    'java.util.Date',
    'java.util.List',
    'java.util.Properties',
    'java.util.Timer',
    'javax.mail.*',
    'javax.mail.Message',
    'javax.mail.internet.MimeBodyPart',
    'javax.mail.search.FlagTerm'
  ],

  properties: [
    {
      name: 'id',
      class: 'Reference',
      of: 'foam.nanos.notification.email.EmailServiceConfig',
      targetDAOKey: 'emailServiceConfigDAO',
      value: 'imap'
    },
    {
      documentation: 'Store reference to timer so it can be cancelled, and agent restarted.',
      name: 'timer',
      class: 'Object',
      visibility: 'HIDDEN',
      networkTransient: true
    }
  ],

  methods: [
    {
      documentation: 'Start as a NanoService',
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
      `
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
      args: 'X x',
      javaCode: `
        EmailServiceConfig config = findId(x);
        if ( config == null ) {
          throw new RuntimeException("EmailServiceConfig not found: "+getId());
        }
        if ( ! config.getEnabled() ) return;

        foam.nanos.medusa.ClusterConfigSupport support = (foam.nanos.medusa.ClusterConfigSupport) x.get("clusterConfigSupport");
        if ( support != null &&
             ! support.cronEnabled(x, false) ) {
          // Loggers.logger(x, this).debug("execution disabled");
          return;
        }

        Logger logger = new PrefixLogger(
          new Object[] {
            this.getClass().getSimpleName(),
            config.getUsername(),
            config.getFolderName()
          },
          (Logger) x.get("logger")
        );
        OMLogger omLogger = (OMLogger) x.get("OMLogger");
        Store store = null;
        Folder folder = null;
        try {
          omLogger.log(this.getClass().getSimpleName(), "store", "connecting");
          Properties props = new Properties();
          props.setProperty("mail.store.protocol", config.getProtocol());
          props.setProperty(String.format("mail.%s.auth", config.getProtocol()), config.getAuthenticate() ? "true" : "false");
          props.setProperty(String.format("mail.%s.starttls.enable", config.getProtocol()), config.getStarttls() ? "true" : "false");
          props.setProperty(String.format("mail.%s.host", config.getProtocol()), config.getHost());
          props.setProperty(String.format("mail.%s.port", config.getProtocol()), config.getPort());
          Session session = Session.getInstance(props);
          store = session.getStore(config.getProtocol());
          try {
            store.connect(config.getHost(), Integer.valueOf(config.getPort()), config.getUsername(), config.getPassword());
          } catch ( Exception e ) {
            ((DAO) getX().get("eventRecordDAO")).put(new EventRecord(getX(), this, "connect", config.getHost(), null, e.getMessage(), LogLevel.ERROR, null));
             disable();
             return;
          }
          omLogger.log(this.getClass().getSimpleName(), "store", "connected");

          folder = store.getFolder(config.getFolderName());
          // if ( config.getDelete() ) {
            folder.open(Folder.READ_WRITE);
          // } else {
          //  folder.open(Folder.READ_ONLY);
          // }

          DAO dao = (DAO) x.get(config.getEmailMessageReceiveDAOKey());
          Message[] messages = folder.search(
            new FlagTerm(new Flags(Flags.Flag.SEEN), false)
          );
          if ( messages.length > 0 ) {
            ((DAO) getX().get("eventRecordDAO")).put(new EventRecord(getX(), this, "fetch", config.getHost(), null, String.valueOf(messages.length), LogLevel.INFO, null));
          }

          for ( Message message : messages ) {
            try {
              dao.put(buildEmailMessage(x, message));
              if ( config.getDelete() ) {
                message.setFlag(Flags.Flag.DELETED, true);
              } else {
                message.setFlag(Flags.Flag.SEEN, true);
              }
            } catch ( Exception e ) {
              ((DAO) getX().get("eventRecordDAO")).put(new EventRecord(getX(), this, "fetch", config.getHost(), null, e.getMessage(), LogLevel.ERROR, e));
            }
          }
        } catch ( Exception e ) {
         ((DAO) getX().get("eventRecordDAO")).put(new EventRecord(getX(), this, "fetch", config.getHost(), null, e.getMessage(), LogLevel.ERROR, e));
        } finally {
          try {
            if ( folder != null ) folder.close(config.getDelete());
            if ( store != null ) store.close();
          } catch (Exception e) {
            logger.warning("Exception closing resources", e.getMessage());
          }
        }
      `
    },
    {
      name: 'buildEmailMessage',
      args: 'X x, javax.mail.Message message',
      type: 'foam.nanos.notification.email.EmailMessage',
      javaThrows: [ 'javax.mail.MessagingException', 'java.io.IOException' ],
      javaCode: `
        EmailServiceConfig config = findId(x);
        EmailMessage emailMessage = new EmailMessage();
        emailMessage.setSubject(message.getSubject());
        emailMessage.setFrom(formatEmail(message.getFrom()[0].toString().toLowerCase()));
        emailMessage.setReplyTo(formatEmail(message.getReplyTo()[0].toString().toLowerCase()));

        DAO userDAO = (DAO) getX().get("localUserDAO");
        User user = (User) userDAO.find(EQ(User.EMAIL, emailMessage.getFrom()));
        if ( user != null ) {
          emailMessage.setUser(user.getId());
        }

        Address[] addresses = message.getRecipients(Message.RecipientType.TO);
        if ( addresses != null && addresses.length > 0 ) {
          String[] recipients = new String[addresses.length];
          for ( int i = 0; i < addresses.length; i++ ) {
            recipients[i] = formatEmail(addresses[i].toString());
          }
          emailMessage.setTo(recipients);
        }
        addresses = message.getRecipients(Message.RecipientType.CC);
        if ( addresses != null && addresses.length > 0 ) {
          String[] recipients = new String[addresses.length];
          for ( int i = 0; i < addresses.length; i++ ) {
            recipients[i] = formatEmail(addresses[i].toString());
          }
          emailMessage.setCc(recipients);
        }
        addresses = message.getRecipients(Message.RecipientType.BCC);
        if ( addresses != null && addresses.length > 0 ) {
          String[] recipients = new String[addresses.length];
          for ( int i = 0; i < addresses.length; i++ ) {
            recipients[i] = formatEmail(addresses[i].toString());
          }
          emailMessage.setBcc(recipients);
        }
        emailMessage.setSentDate(message.getSentDate());
        emailMessage.setStatus(Status.RECEIVED);

        StringBuilder body = new StringBuilder();

        // Check if message contents multipart.
        if ( message.getContentType().contains("multipart") ) {
          Multipart multiPart = (Multipart) message.getContent();
          List<String> attachments = new ArrayList<String>();
          for (int i = 0; i < multiPart.getCount(); i++) {
            MimeBodyPart part = (MimeBodyPart) multiPart.getBodyPart(i);
            // Check if part represents an email attachment.
            if ( Part.ATTACHMENT.equalsIgnoreCase(part.getDisposition()) ) {
              try ( InputStream in = part.getInputStream();
                    ByteArrayOutputStream os = new ByteArrayOutputStream() ) {
                org.apache.commons.io.IOUtils.copy(in, os);
                if ( config.getProcessAttachments() ) {
                  byte[] bytes = os.toByteArray();
                  long fileLength = bytes.length;
                  try ( ByteArrayInputStream bin = new ByteArrayInputStream(bytes); ) {
                    Blob data = new InputStreamBlob(bin, fileLength);
                    File file = new File();
                    file.setOwner(user.getId());
                    file.setFilename(part.getFileName());
                    file.setFilesize(fileLength);
                    file.setData(data);
                    file.setLifecycleState(LifecycleState.ACTIVE);
                    file = (File) ((DAO) getX().get("fileDAO")).put(file);
                    attachments.add(file.getId());
                  }
                }
              }
            } else if ( Part.INLINE.equalsIgnoreCase(part.getDisposition()) ||
                        part.isMimeType("text/*") ) {
              body.append(part.getContent());
            } else {
              Loggers.logger(x, this).warning("Unsupported multipart content type", part.getContentType());
            }
            if ( attachments.size() > 0 ) emailMessage.setAttachments(attachments.toArray(new String[0]));
          }
        } else if ( message.isMimeType("text/*") ) {
          body.append(message.getContent().toString());
        } else {
          Loggers.logger(x, this).warning("Unsupported content type", message.getContentType());
        }

        if ( body.length() > 0 ) {
          emailMessage.setBody(body.toString());
        //   Loggers.logger(x, this).debug("body", body.toString());
        // } else {
        //   Loggers.logger(x, this).debug("body", "no body detected");
        }

        return emailMessage;
      `
    },
    {
      name: 'formatEmail',
      args: 'String email',
      type: 'String',
      javaCode: `
        if ( email != null && email.contains("<") && email.contains(">") ) {
          email = email.substring(email.indexOf("<")+1, email.indexOf(">"));
        }
        if ( email != null ) {
          email = email.toLowerCase();
        }
        return email;
      `
    }
  ]
});
