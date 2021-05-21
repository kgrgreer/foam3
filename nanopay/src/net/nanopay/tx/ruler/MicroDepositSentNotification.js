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
  package: 'net.nanopay.tx.ruler',
  name: 'MicroDepositSentNotification',
  extends: 'foam.nanos.notification.Notification',

  messages: [
    { name: 'IN_PROCESS', message: 'is processing' }
  ],

  javaImports: [
    'foam.i18n.TranslationService',
    'foam.nanos.auth.Subject',
    'foam.nanos.auth.User'
  ],

  properties: [
    {
      class: 'String',
      name: 'summary'
    },
    {
      name: 'body',
      transient: true,
      javaGetter: `
        Subject subject = (Subject) foam.core.XLocator.get().get("subject");
        String locale = ((User) subject.getRealUser()).getLanguage().getCode().toString();
        TranslationService ts = (TranslationService) foam.core.XLocator.get().get("translationService");

        return getSummary() + ts.getTranslation(locale, getClassInfo().getId()+ ".IN_PROCESS", this.IN_PROCESS);
      `,
      getter: function() {
        return this.summary + this.IN_PROCESS;
      }
    }
  ]
});
