/**
 * NANOPAY CONFIDENTIAL
 *
 * [2020] nanopay Corporation
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
  name: 'TrevisoNotificationRule',
  implements: ['foam.nanos.ruler.RuleAction'],

  documentation: `Sets a TED text to an invoice and creates a notification.`,

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.Currency',
    'foam.core.X',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.i18n.TranslationService',
    'foam.nanos.auth.Subject',
    'foam.nanos.auth.User',
    'foam.nanos.logger.Logger',
    'foam.nanos.notification.ToastState',
    'foam.util.SafetyUtil',
    'net.nanopay.invoice.model.Invoice',
    'net.nanopay.invoice.model.PaymentStatus',
    'net.nanopay.partner.treviso.invoice.TrevisoNotification',
    'net.nanopay.partner.treviso.tx.TrevisoTransaction',
    'net.nanopay.tx.model.Transaction',
    'java.util.*'
  ],

  messages: [
    {
      name: "TED_TEXT_MSG",
      message: 'ATTENTION: This transaction has not yet been sent!\n\n' + 
        'To complete, send a TED of ({amount}) to:\n\n' +
        'Treviso Corretora de Câmbio S.A\n' +
        'CNPJ: 02.992.317/0001-87\n' +
        'Banco SC Treviso (143)\n' +
        'Agencia: 0001\n' +
        'Conta: 1-1\n\n' +
        'In case that payment has not been done, the transaction will be canceled automatically.'
    }
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        Logger logger = (Logger) x.get("logger");

        agency.submit(x, new ContextAgent() {
          @Override
          public void execute(X x) {

            Invoice invoice = (Invoice) obj;
            User user =  (User) ((DAO) x.get("userDAO")).find(invoice.getPayerId());
            Transaction txn =  (Transaction) ((DAO) x.get("transactionDAO")).find(invoice.getPaymentId());

            while ( ! (txn instanceof TrevisoTransaction) ) {
              ArraySink sink = new ArraySink();
              (txn.getChildren(x)).select(sink);
              List list = sink.getArray();
              txn = (Transaction) list.get(0);
            }

            Currency currency = (Currency) ((DAO) x.get("currencyDAO")).find(txn.getSourceCurrency());
            Map<String, Object>  args = new HashMap<>();
            String amount = currency.format(-txn.getTotal(x, txn.getSourceAccount()));
            args.put("amount", amount);
            TrevisoNotification notify = new TrevisoNotification.Builder(x)
              .setAmount(amount)
              .setUserId(user.getId())
              .setEmailName("tedTransfer")
              .setEmailArgs(args)
              .build();
            user.doNotify(x, notify);
            
            Subject subject = (Subject) foam.core.XLocator.get().get("subject");
            String locale = ((User) subject.getRealUser()).getLanguage().getCode().toString();
            TranslationService ts = (TranslationService) x.get("translationService");
            
            // set TED text in English, and translate it on the client side when necessary
            String tedText;
            if (locale.equals("en")) {
              tedText = TED_TEXT_MSG;
            } else {
              tedText = ts.getTranslation(
                "en",
                "net.nanopay.partner.treviso.invoice.TrevisoNotificationRule.TED_TEXT_MSG",
                ""
              );
            }

            invoice.setTedText(tedText.replace("{amount}", amount + ""));
            invoice.setTotalSourceAmount(amount);
          }
        }, "Sets a TED text to invoice and creates a notification");
      `
    }
  ]
});
