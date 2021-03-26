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
  package: 'net.nanopay.partner.treviso.invoice',
  name: 'TrevisoNotification',
  extends: 'foam.nanos.notification.Notification',

  messages: [
    { name: 'NOTIFICATION_BODY_1', message: 'Attention : this transaction is not complete yet! To complete, send a TED of (' },
    { name: 'NOTIFICATION_BODY_2', message: `) to:
                                                     Treviso Corretora de Câmbio S.A
                                                     CNPJ: 02.992.317/0001-87
                                                     Bank: Banco SC Treviso (143)
                                                     Institution: 0001
                                                     Account: 1-1

                                                     In case that payment has not been done until 16:00hs, the transaction will be canceled automatically.`
    }
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
      class: 'String',
      name: 'amount'
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

        return t1 + getAmount() + t2;
      `,
      getter: function() {
        var t1 = this.translationService.getTranslation(foam.locale, `${this.id}.NOTIFICATION_BODY_1`, this.NOTIFICATION_BODY_1);
        var t2 = this.translationService.getTranslation(foam.locale, `${this.id}.NOTIFICATION_BODY_2`, this.NOTIFICATION_BODY_2);

        return t1 + this.amount + t2;
      }
    }
  ]
});
