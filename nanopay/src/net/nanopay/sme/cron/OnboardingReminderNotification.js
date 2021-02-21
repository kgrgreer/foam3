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
  name: 'OnboardingReminderNotification',
  extends: 'foam.nanos.notification.Notification',

  messages: [
    { name: 'BODY_TEXT', message: `Here's a reminder to complete your business registration` }
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
        Subject subject = (Subject) foam.core.XLocator.get().get("subject");
        String locale = ((User) subject.getRealUser()).getLanguage().getCode().toString();
        TranslationService ts = (TranslationService) foam.core.XLocator.get().get("translationService");

        return ts.getTranslation(locale, getClassInfo().getId()+ ".BODY_TEXT", this.BODY_TEXT);
      `,
      getter: function() {
        var t1 = this.translationService.getTranslation(foam.locale, `${this.id}.BODY_TEXT`, this.BODY_TEXT);

        return t1;
      }
    }
  ]
});
