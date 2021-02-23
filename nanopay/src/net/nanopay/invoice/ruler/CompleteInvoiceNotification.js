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
  package: 'net.nanopay.invoice.ruler',
  name: 'CompleteInvoiceNotification',
  extends: 'foam.nanos.notification.Notification',

  messages: [
    { name: 'NOTIFICATION_BODY_1', message: 'You have received payment from '},
    { name: 'NOTIFICATION_BODY_2', message: ' for '},
    { name: 'NOTIFICATION_BODY_3', message: ' has received your payment '}
  ],

  javaImports: [
    'foam.i18n.TranslationService',
    'foam.nanos.auth.Subject',
    'foam.nanos.auth.User',
  ],

  properties: [
    {
      class: 'String',
      name: 'summary'
    },
    {
      class: 'String',
      name: 'amount'
    },
    {
      class: 'String',
      name: 'sourceCurrency'
    },
    {
      class: 'Long',
      name: 'payerId'
    },
    {
      class: 'Long',
      name: 'payeeId'
    },
    {
      name: 'body',
      transient: true,
      javaGetter: `
        Subject subject = (Subject) foam.core.XLocator.get().get("subject");
        String locale = ((User) subject.getRealUser()).getLanguage().getCode().toString();
        TranslationService ts = (TranslationService) foam.core.XLocator.get().get("translationService");

        String t1 = ts.getTranslation(locale, getClassInfo().getId()+ ".NOTIFICATION_BODY_1", this.NOTIFICATION_BODY_1);
        String t2 = ts.getTranslation(locale, getClassInfo().getId()+ ".NOTIFICATION_BODY_2", this.NOTIFICATION_BODY_2);
        String t3 = ts.getTranslation(locale, getClassInfo().getId()+ ".NOTIFICATION_BODY_3", this.NOTIFICATION_BODY_3);

        if ( getPayerId() == getPayeeId() )
          return t1 + getSummary() + t2 + getAmount() + " " + getSourceCurrency();

        return getSummary() + t3 + t2 + getAmount() + " " + getSourceCurrency();
      `,
      getter: function() {
        if ( this.payerId == this.payeeId )
          return this.NOTIFICATION_BODY_1 + this.summary + this.NOTIFICATION_BODY_2 + this.amount + " " + this.sourceCurrency;

        return this.summary + this.NOTIFICATION_BODY_3 + this.NOTIFICATION_BODY_2 + this.amount + " " + this.sourceCurrency;
      }
    }
  ]
});
