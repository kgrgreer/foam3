/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.notification.email',
  name: 'EmailTemplate',

  documentation: `Represents an email template that stores the default properties of a specific email,
  mimics the EmailMessage which is the end obj that is processed into email.`,

  mixins: [ 'foam.nanos.notification.email.EmailTemplateSource' ],

  imports: [
    'pmInfoDAO'
  ],

  implements: [
    'foam.mlang.Expressions'
  ],

  requires: [
    'foam.nanos.pm.PMInfo'
  ],

  javaImports: [
    'foam.i18n.Locale',
    'foam.i18n.TranslationService',
    'foam.nanos.auth.Subject',
    'foam.nanos.auth.User',
    'foam.nanos.logger.PrefixLogger',
    'foam.nanos.logger.Logger',
    'foam.nanos.logger.Loggers',
    'foam.nanos.notification.email.EmailTemplateEngine',
    'foam.util.SafetyUtil',
    'java.nio.charset.StandardCharsets'
  ],

  tableColumns: ['id', 'name', 'group', 'locale', 'spid', 'sourceClass', 'disabled', 'count'],

  properties: [
    {
      class: 'String',
      name: 'id'
    },
    {
      class: 'String',
      name: 'name',
      documentation: 'Template name - NOTE: EmailTemlateSupport searches on this name, not id',
      factory: function() { return this.id; },
      javaFactory: 'return getId();'
    },
    {
      class: 'String',
      name: 'group',
      value: '*'
    },
    {
      class: 'String',
      name: 'locale',
      value: 'en'
    },
    {
      class: 'String',
      name: 'spid'
    },
    {
      class: 'String',
      name: 'subject',
      documentation: 'Template subject'
    },
    {
      class: 'String',
      name: 'body',
      documentation: 'Template body',
      view: {
        class: 'foam.u2.MultiView',
        views: [
          { class: 'foam.u2.IFrameHTMLView' },
          { class: 'foam.u2.tag.TextArea', rows: 40, cols: 150}
        ]
      }
    },
    {
      class: 'String',
      name: 'displayName',
      documentation: 'Displayed as the name in the email from field.'
    },
    {
      class: 'String',
      name: 'sendTo',
      documentation: 'This property will set to whomever the email is being sent to.'
    },
    {
      class: 'String',
      name: 'replyTo',
      documentation: 'Displayed as the from email field.'
    },
    {
      class: 'Array',
      name: 'bodyAsByteArray',
      hidden: true,
      transient: true,
      type: 'Byte[]',
      javaFactory: 'return getBody() != null ? getBody().getBytes(StandardCharsets.UTF_8) : null;'
    },
    {
      class: 'Int',
      name: 'count',
      transient: true,
      getter: async function() {
        var pmInfo = await this.pmInfoDAO.find(this.EQ(this.PMInfo.KEY, this.sourceClass));
        return pmInfo ? pmInfo.count : 0;
      }
    }
  ],

  methods: [
    {
      name: 'apply',
      type: 'foam.nanos.notification.email.EmailMessage',
      documentation: 'Applies template properties to emailMessage, where emailMessage property is empty',
      javaThrows: ['java.lang.NoSuchFieldException'],
      args: [
        {
          name: 'x',
          type: 'Context',
        },
        {
          name: 'group',
          class: 'String',
          documentation: 'group of user whose the recipient of the email being sent'
        },
        {
          name: 'emailMessage',
          type: 'foam.nanos.notification.email.EmailMessage',
          documentation: 'Email message'
        },
        {
          name: 'templateArgs',
          type: 'Map',
          documentation: 'Template arguments'
        }
      ],
      javaCode: `
        Logger logger = new PrefixLogger( new Object[] {
          this.getClass().getSimpleName(),
          getName()
        }, (Logger) x.get("logger"));
        x = x.put("logger", logger);

        if ( emailMessage == null ) {
          throw new NoSuchFieldException("emailMessage is Null");
        }

        EmailTemplateEngine templateEngine = (EmailTemplateEngine) x.get("templateEngine");
        // BODY:
        if ( ! emailMessage.isPropertySet("body") || ! SafetyUtil.isEmpty(getBody()) ) {
          emailMessage.setBody(templateEngine.renderTemplate(x, getBody(), templateArgs).toString());
        }

        // REPLY TO:
        if ( ! emailMessage.isPropertySet("replyTo") && ! SafetyUtil.isEmpty(getReplyTo()) ) {
          emailMessage.setReplyTo(templateEngine.renderTemplate(x, getReplyTo(), templateArgs).toString());
        }

        // DISPLAY NAME:
        if ( ! emailMessage.isPropertySet("displayName") && ! SafetyUtil.isEmpty(getDisplayName()) ) {
          emailMessage.setDisplayName(templateEngine.renderTemplate(x, getDisplayName(), templateArgs).toString());
        }

        // SUBJECT:
        if ( ! emailMessage.isPropertySet("subject") && ! SafetyUtil.isEmpty(getSubject()) ) {
          emailMessage.setSubject(templateEngine.renderTemplate(x, getSubject(), templateArgs).toString());
        }

        // SEND TO:
        if ( ! emailMessage.isPropertySet("to") && ! SafetyUtil.isEmpty(getSendTo()) ) {
          emailMessage.setTo(new String[] { templateEngine.renderTemplate(x, getSendTo(), templateArgs).toString() });
        }

        return emailMessage;
      `
    }
  ]
});
