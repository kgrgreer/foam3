/**
 * NANOPAY CONFIDENTIAL
 *
 * [2021] nanopay Corporation
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of nanopay Corporation.
 * The intellectual and technical concepts contained
 * herein are proprietary to nanopay Corporation
 * and may be covered by Canadian and Foreign Patents, patents
 * in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from nanopay Corporation.
 */

foam.CLASS({
  package: 'net.nanopay.sme.cron',
  name: 'WelcomeEmailNotification',
  extends: 'foam.nanos.notification.Notification',

   messages: [
     { name: 'WELCOME_NOTIFICATION_MESSAGE', message: 'To complete the registration, reach out to our onboarding specialist at ' }
   ],

  javaImports: [
    'foam.i18n.TranslationService',
    'foam.nanos.auth.Subject',
    'foam.nanos.auth.User'
  ],

  properties: [
    {
      class: 'String',
      name: 'supportPhone'
    },
    {
      name: 'body',
      transient: true,
      javaGetter: `
        Subject subject = (Subject) foam.core.XLocator.get().get("subject");
        String locale = ((User) subject.getRealUser()).getLanguage().getCode().toString();
        TranslationService ts = (TranslationService) foam.core.XLocator.get().get("translationService");

        return ts.getTranslation(locale, getClassInfo().getId()+ ".WELCOME_NOTIFICATION_MESSAGE", this.WELCOME_NOTIFICATION_MESSAGE) + getSupportPhone();
      `,
      getter: function() {
        return this.WELCOME_NOTIFICATION_MESSAGE + this.supportPhone;
      }
    }
  ]
});
