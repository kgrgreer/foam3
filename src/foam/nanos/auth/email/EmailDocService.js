/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.auth.email',
  name: 'EmailDocService',
  documentation: 'Sends an email with an html doc',

  implements: [
    'foam.nanos.auth.email.EmailDocInterface'
  ],


  imports: [
    'appConfig',
    'email',
    'localUserDAO',
    'tokenDAO',
    'DAO htmlDocDAO',
  ],

  javaImports: [
    'foam.dao.DAO',
    'foam.dao.ArraySink',
    'foam.mlang.MLang',
    'foam.nanos.auth.HtmlDoc',
    'foam.nanos.logger.Loggers',
    'foam.nanos.notification.email.EmailMessage',
    'java.util.HashMap'
  ],

  methods: [
    {
      name: 'emailDoc',
      javaCode: `
      try {
        DAO htmlDocDAO = (DAO) getHtmlDocDAO();
        htmlDocDAO = htmlDocDAO.where(MLang.EQ(HtmlDoc.NAME, docName));
        ArraySink listSink = (ArraySink) htmlDocDAO.orderBy(new foam.mlang.order.Desc(HtmlDoc.ID)).limit(1).select(new ArraySink());
        HtmlDoc doc = (HtmlDoc) listSink.getArray().get(0);

        EmailMessage message = new EmailMessage();
        message.setTo(new String[] { user.getEmail() });
        message.setUser(user.getId());
        HashMap<String, Object> args = new HashMap<>();
        args.put("doc", doc.getBody());
        args.put("templateSource", this.getClass().getName());
        args.put("template", "docEmail");
        message.setTemplateArguments(args);
        ((DAO) getX().get("emailMessageDAO")).put(message);
        return true;
      } catch(Throwable t){
        Loggers.logger(getX(), this).error("Document not found", docName, t);
      }
      return false;
       `
    }
  ]
});
