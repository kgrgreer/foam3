/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */
foam.CLASS({
  package: 'net.nanopay.sme.ruler',
  name: 'BusinessCompliancePassedEmailNotification',
  extends: 'foam.nanos.notification.Notification',

  messages: [
    { name: 'NOTIFICATION_BODY_P1', message: 'This business can now make payments'}
  ],

  imports: [
    'translationService'
  ],

  javaImports: [
    'foam.i18n.TranslationService',
     'foam.nanos.auth.Subject',
     'foam.nanos.auth.User'
  ],

  properties: [
    {
      name: 'body',
      transient: true,
      javaGetter: `
        Subject subject = (foam.nanos.auth.Subject) foam.core.XLocator.get().get("subject");
        String locale = ((foam.nanos.auth.User) subject.getRealUser()).getLanguage().getCode().toString();
        TranslationService ts = (TranslationService) foam.core.XLocator.get().get("translationService");

        return ts.getTranslation(locale, getClassInfo().getId()+ ".NOTIFICATION_BODY_P1", this.NOTIFICATION_BODY_P1);
      `,
      getter: function() {
        return this.translationService.getTranslation(foam.locale, `${this.id}.NOTIFICATION_BODY_P1`, this.NOTIFICATION_BODY_P1);
      }
    }
  ]
});
