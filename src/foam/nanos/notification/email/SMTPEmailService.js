/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.notification.email',
  name: 'SMTPEmailService',

  implements: [
    'foam.nanos.NanoService',
    'foam.nanos.notification.email.EmailService'
  ],

  documentation: 'Implementation of Email Service using SMTP',

  javaImports: [
    'foam.blob.Blob',
    'foam.blob.BlobService',
    'foam.blob.FileBlob',
    'foam.blob.IdentifiedBlob',
    'foam.blob.InputStreamBlob',
    'foam.dao.DAO',
    'foam.nanos.alarming.Alarm',
    'foam.nanos.alarming.AlarmReason',
    'foam.nanos.cron.Cron',
    'foam.nanos.fs.File',
    'foam.nanos.notification.email.SMTPConfig',
    'foam.nanos.logger.Logger',
    'foam.nanos.logger.Loggers',
    'foam.nanos.om.OMLogger',
    'static foam.mlang.MLang.EQ',
    'java.io.ByteArrayInputStream',
    'java.io.ByteArrayOutputStream',
    'java.io.InputStream',
    'java.util.Date',
    'java.util.Properties',
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
      class: 'String',
      name: 'host',
      value: '127.0.0.1'
    },
    {
      class: 'String',
      name: 'port',
      value: '587'
    },
    {
      class: 'String',
      name: 'username'
    },
    {
      class: 'String',
      name: 'password'
    },
    {
      class: 'Boolean',
      name: 'authenticate',
      value: true
    },
    {
      class: 'Boolean',
      name: 'starttls',
      value: true
    },
    {
      name: 'session_',
      javaType: 'Session',
      class: 'Object',
      visibility: 'HIDDEN',
      transient: true,
      javaFactory: `
        Properties props = new Properties();
        props.setProperty("mail.smtp.auth", getAuthenticate() ? "true" : "false");
        props.setProperty("mail.smtp.starttls.enable", getStarttls() ? "true" : "false");
        props.setProperty("mail.smtp.host", getHost());
        props.setProperty("mail.smtp.port", getPort());
        if ( getAuthenticate() ) {
          return Session.getInstance(props, new SMTPAuthenticator(getUsername(), getPassword()));
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
        Transport transport = null;
        try {
          omLogger.log(this.getClass().getSimpleName(), "transport", "connecting");
          transport = getSession_().getTransport("smtp");
          transport.connect(getUsername(), getPassword());
          logger.info("transport", "connected");
          omLogger.log(this.getClass().getSimpleName(), "transport", "connected");
        } catch ( Exception e ) {
          logger.error("Transport failed initialization", e);
          Alarm alarm = new Alarm.Builder(getX())
            .setName(this.getClass().getSimpleName()+".transport")
            .setReason(AlarmReason.CREDENTIALS)
            .setClusterable(false)
            .setNote(e.getMessage())
            .build();
          ((DAO) getX().get("alarmDAO")).put(alarm);
          clearSession_();

          DAO cronDAO = (DAO) getX().get("cronDAO");
          Cron cron = (Cron) cronDAO.find("SMTP Email Service");
          if ( cron != null ) {
            cron = (Cron) cron.fclone();
            cron.setEnabled(false);
            cronDAO.put(cron);
            logger.warning("SMTP Email Service cron disabled");
          }
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
        // SMTPConfig migration support
        if ( USERNAME.isDefaultValue(this) &&
             PASSWORD.isDefaultValue(this) ) {
          SMTPConfig cfg = (SMTPConfig) getX().get("SMTPConfig");
          if ( cfg != null &&
               ! SMTPConfig.USERNAME.isDefaultValue(cfg) &&
               ! SMTPConfig.PASSWORD.isDefaultValue(cfg) ) {
            Loggers.logger(getX(), this).info("initializing from SMTPConfig");
            copyFrom(cfg);
          }
        }
      `,
    },
    {
      name: 'reload',
      javaCode: `
        Loggers.logger(getX(), this).info("reload");
        clearTransport_();
        clearSession_();
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
            message.setContent(emailMessage.getBody(), "html; charset=utf-8");
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
      name: 'sendEmail',
      javaCode: `
        Logger logger = Loggers.logger(getX(), this);
        OMLogger omLogger = (OMLogger) getX().get("OMLogger");
        String alarmName = this.getClass().getSimpleName()+".sendEmail";

        emailMessage = (EmailMessage) emailMessage.fclone();
        if ( emailMessage.getStatus() == Status.FAILED ) {
          // ignore
          logger.debug("Email not sent, already FAILED.", emailMessage.getId());
          return emailMessage;
        }

        MimeMessage message = createMimeMessage(emailMessage);
        if ( message == null ) {
          return emailMessage;
        }
        try {
          getTransport_().send(message);
          emailMessage.setStatus(Status.SENT);
          emailMessage.setSentDate(message.getSentDate());
          logger.debug("sent");
          omLogger.log(this.getClass().getSimpleName(), "message", "sent");
          DAO alarmDAO = (DAO) getX().get("alarmDAO");
          Alarm alarm = (Alarm) alarmDAO.find(EQ(Alarm.NAME,alarmName));
          if ( alarm != null &&
               alarm.getIsActive() ) {
            alarm = (Alarm) alarm.fclone();
            alarm.setIsActive(false);
            alarmDAO.put(alarm);
          }
        } catch ( SendFailedException | ParseException e ) {
          emailMessage.setStatus(Status.FAILED);
          logger.warning("send failed", e);
          Alarm alarm = new Alarm(alarmName, e.getMessage());
          alarm.setClusterable(false);
          ((DAO) getX().get("alarmDAO")).put(alarm);
        } catch ( MessagingException e ) {
          try {
            getTransport_().close();
          } catch ( Exception e2 ) {
            logger.error("Transport close failed", e2);
          }
          clearTransport_();
          clearSession_();
          logger.error("send failed", e);
        } catch ( RuntimeException e ) {
          // already reported.
          logger.error("send failed", e.getMessage());
        }
        return emailMessage;
      `
    }
  ]
});
