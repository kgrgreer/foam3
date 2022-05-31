/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.notification.email',
  name: 'SMTPEmailService',

  implements: [
    'foam.nanos.notification.email.EmailService'
  ],

  documentation: 'Implementation of Email Service using SMTP',

  imports: [
    'threadPool?'
  ],

  javaImports: [
    'foam.blob.InputStreamBlob',
    'foam.dao.DAO',
    'foam.nanos.fs.File',
    'foam.nanos.notification.email.SMTPConfig',
    'foam.nanos.logger.Logger',
    'foam.nanos.logger.Loggers',
    'foam.nanos.om.OMLogger',
    'static foam.mlang.MLang.EQ',
    'java.io.ByteArrayInputStream',
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
      name: 'session_',
      javaType: 'Session',
      class: 'Object',
      javaFactory:
      `
        SMTPConfig smtpConfig = (SMTPConfig) getX().get("SMTPConfig");
        Properties props = new Properties();
        props.setProperty("mail.smtp.auth", smtpConfig.getAuthenticate() ? "true" : "false");
        props.setProperty("mail.smtp.starttls.enable", smtpConfig.getStarttls() ? "true" : "false");
        props.setProperty("mail.smtp.host", smtpConfig.getHost());
        props.setProperty("mail.smtp.port", smtpConfig.getPort());
        if ( smtpConfig.getAuthenticate() ) {
          return Session.getInstance(props, new SMTPAuthenticator(smtpConfig.getUsername(), smtpConfig.getPassword()));
        }
        return Session.getInstance(props);
      `
    },
    {
      class: 'Object',
      javaType: 'Transport',
      name: 'transport_',
      javaFactory:
      `
        Logger logger = Loggers.logger(getX(), this);
        OMLogger omLogger = (OMLogger) getX().get("OMLogger");
        SMTPConfig smtpConfig = (SMTPConfig) getX().get("SMTPConfig");
        Transport transport = null;
        try {
          omLogger.log(this.getClass().getSimpleName(), "transport", "connecting");
          transport = getSession_().getTransport("smtp");
          transport.connect(smtpConfig.getUsername(), smtpConfig.getPassword());
          logger.info("connected");
          omLogger.log(this.getClass().getSimpleName(), "transport", "connected");
        } catch ( Exception e ) {
          logger.error("Transport failed initialization", e);
        }
        return transport;
      `
    },
  ],

  methods: [
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
      javaCode:
      `
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

          Multipart multipart = new MimeMultipart();

          if ( emailMessage.isPropertySet("body") ) {
            MimeBodyPart part = new MimeBodyPart();
            part.setText(emailMessage.getBody(), "utf-8", "text/html");
            multipart.addBodyPart(part);
          }

          String[] attachments = emailMessage.getAttachments();
          if ( attachments != null &&
               attachments.length > 0 ) {
            DAO fileDAO = ((DAO) getX().get("fileDAO"));
            for ( String fileId : attachments ) {
              File file = (File) fileDAO.find(fileId);
              if ( file != null ) {
                InputStreamBlob blob = (InputStreamBlob) file.getData();
                DataSource source = new ByteArrayDataSource((ByteArrayInputStream) blob.getInputStream(), file.getMimeType()); //"application/octet-stream");
                BodyPart part = new MimeBodyPart();
                part.setDataHandler(new DataHandler(source));
                part.setFileName(file.getFilename());
                multipart.addBodyPart(part);
              } else {
                logger.warning("File not found", fileId);
              }
            }
          }

          message.setContent(multipart);

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
          logger.debug("MimeMessage sent");
          omLogger.log(this.getClass().getSimpleName(), "message", "sent");
        } catch ( SendFailedException e ) {
          emailMessage.setStatus(Status.FAILED);
          logger.error("MimeMessage send failed", e);
        } catch ( MessagingException e ) {
          try {
            getTransport_().close();
          } catch ( Exception e2 ) {
            logger.error("Transport close failed", e2);
          }
          clearTransport_();
          logger.error("MimeMessage send failed", e);
        }
        return emailMessage;
      `
    }
  ]
});
