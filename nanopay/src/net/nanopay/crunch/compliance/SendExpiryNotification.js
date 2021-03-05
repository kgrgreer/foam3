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
  package: 'net.nanopay.crunch.compliance',
  name: 'SendExpiryNotification',
  extends: 'foam.nanos.notification.Notification',

  messages: [
    { name: 'NOTIF_PRE', message: 'Your capability "' },
    { name: 'EXPIRY_NOTIF_SUF', message: '" has expired' },
    { name: 'GRACE_PERIOD_NOTIF_SUF_1', message: '" has transitioned into a grace period of ' },
    { name: 'GRACE_PERIOD_NOTIF_SUF_2', message: ' days' },
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
      name: 'gracePeriod'
    },
    {
      name: 'body',
      transient: true,
      javaGetter: `
        Subject subject = (Subject) foam.core.XLocator.get().get("subject");
        String locale = ((User) subject.getRealUser()).getLanguage().getCode().toString();
        TranslationService ts = (TranslationService) foam.core.XLocator.get().get("translationService");

        String t1 = ts.getTranslation(locale, getClassInfo().getId()+ ".NOTIF_PRE", this.NOTIF_PRE);
        String t2 = ts.getTranslation(locale, getClassInfo().getId()+ ".GRACE_PERIOD_NOTIF_SUF_1", this.GRACE_PERIOD_NOTIF_SUF_1);
        String t3 = ts.getTranslation(locale, getClassInfo().getId()+ ".GRACE_PERIOD_NOTIF_SUF_2", this.GRACE_PERIOD_NOTIF_SUF_2);
        String t4 = ts.getTranslation(locale, getClassInfo().getId()+ ".EXPIRY_NOTIF_SUF", this.EXPIRY_NOTIF_SUF);
        String capName = ts.getTranslation(locale, getCapabilitySource(), getCapabilityName());

        if ( getGracePeriod() > 0  )
          return t1 + capName + t2 + getGracePeriod() + t3;

        return t1 + capName + t4;
      `,
      getter: function() {
        if ( this.gracePeriod )
          return this.NOTIF_PRE + this.capabilityName + this.GRACE_PERIOD_NOTIF_SUF_1 + this.gracePeriod + this.GRACE_PERIOD_NOTIF_SUF_2;

        return this.NOTIF_PRE + this.capabilityName + this.EXPIRY_NOTIF_SUF;
      }
    }
  ]
});
