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

   documentation: `Adds send a TED text to invoice notes and create a notification.`,

   javaImports: [
    'foam.core.ContextAgent',
    'foam.core.Currency',
    'foam.core.X',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
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

  constants: [
    {
      type: 'String',
      name: 'TEXT',
      value: `
      ATENÇÃO : Esta transação ainda não foi enviada!

      Para completar, envie um TED de (`
    },
    {
      type: 'String',
      name: 'TEXT2',
      value: `) para :

      Treviso Corretora de Câmbio S.A
      CNPJ: 02.992.317/0001-87
      Banco SC Treviso (143)
      Agencia: 0001
      Conta: 1-1

      O não envio dos fundos causará o cancelamento automático desta transação.
      `
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

            String note = SafetyUtil.isEmpty(invoice.getNote()) ? "" : invoice.getNote() + "\\n";
            invoice.setNote(note + TEXT + amount + TEXT2);
            invoice.setTotalSourceAmount(amount);

          }
        }, "Adds send a TED text to invoice note and create a notification");
      `
    }
  ]
 });
