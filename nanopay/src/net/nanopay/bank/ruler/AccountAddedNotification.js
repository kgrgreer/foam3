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
  package: 'net.nanopay.bank.ruler',
  name: 'AccountAddedNotification',
  extends: 'foam.nanos.notification.Notification',

  messages: [
    { name: 'NOTIFICATION_BODY_P1', message: ' has been added!'}
  ],

  requires: [
    'net.nanopay.bank.BankAccount'
  ],

  javaImports: [
    'foam.i18n.TranslationService',
    'foam.nanos.auth.Subject',
    'foam.nanos.auth.User',
    'net.nanopay.bank.BankAccount'
  ],

  properties: [
    {
      class: 'String',
      name: 'accountNumber',
      preSet: function(_, value) {
        return this.BankAccount.mask(value);
      }
    },
    {
      name: 'body',
      transient: true,
      javaGetter: `
        Subject subject = (Subject) foam.core.XLocator.get().get("subject");
        String locale = ((User) subject.getRealUser()).getLanguage().getCode().toString();
        TranslationService ts = (TranslationService) foam.core.XLocator.get().get("translationService");

        String accountNumber = BankAccount.mask(getAccountNumber());

        return accountNumber + ts.getTranslation(locale, getClassInfo().getId() + ".NOTIFICATION_BODY_P1", this.NOTIFICATION_BODY_P1);
      `,
      getter: function() {
        return this.accountNumber + this.NOTIFICATION_BODY_P1;
      }
    }
  ]
});
