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
  package: 'net.nanopay.crunch',
  name: 'UCJExpiryReminderNotification',
  extends: 'foam.nanos.notification.Notification',

  messages: [
    { name: 'NOTIFICATION_BODY_P1', message: 'Your Capability "' },
    { name: 'NOTIFICATION_BODY_P2', message: '" will expire in ' },
    { name: 'NOTIFICATION_BODY_P3', message: ' days' }
  ],

  javaImports: [
    'foam.i18n.TranslationService',
    'foam.nanos.auth.Subject',
    'foam.nanos.auth.User'
  ],

  properties: [
    {
      class: 'String',
      name: 'capabilityName'
    },
    {
      class: 'String',
      name: 'capabilitySource'
    },
    {
      class: 'Int',
      name: 'daysBeforeNotification'
    },
    {
      name: 'body',
      transient: true,
      javaGetter: `
        Subject subject = (Subject) foam.core.XLocator.get().get("subject");
        String locale = ((User) subject.getRealUser()).getLanguage().getCode().toString();
        TranslationService ts = (TranslationService) foam.core.XLocator.get().get("translationService");

        String t1 = ts.getTranslation(locale, getClassInfo().getId()+ ".NOTIFICATION_BODY_P1", this.NOTIFICATION_BODY_P1);
        String capName = ts.getTranslation(locale, getCapabilitySource(), getCapabilityName());
        String t2 = ts.getTranslation(locale, getClassInfo().getId()+ ".NOTIFICATION_BODY_P2", this.NOTIFICATION_BODY_P2);
        String t3 = ts.getTranslation(locale, getClassInfo().getId()+ ".NOTIFICATION_BODY_P3", this.NOTIFICATION_BODY_P3);;

        return t1 + capName + t2 + getDaysBeforeNotification() + t3;
      `,
      getter: function() {
        return this.NOTIFICATION_BODY_P1 + this.capabilityName + this.NOTIFICATION_BODY_P2 + this.daysBeforeNotification + this.NOTIFICATION_BODY_P3;
      }
    }
  ]
});
