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
  package: 'net.nanopay.fx.ascendantfx',
  name: 'AscendantFXTransactionDAO',
  extends: 'foam.dao.ProxyDAO',
  documentation: 'This DAO would accept FX Quote if it is not yet accepted and then submit deal to AscendantFX',

  javaImports: [
    'java.util.Calendar',
    'java.util.Date',
    'java.util.List',
    
    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.logger.Logger',
    'foam.util.SafetyUtil',
    'net.nanopay.payment.PaymentService',
    'net.nanopay.tx.alterna.CsvUtil',
    'net.nanopay.tx.model.TransactionStatus'
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(`
          public AscendantFXTransactionDAO(X x, DAO delegate) {
            setX(x);
            setDelegate(delegate);
          }  
        `
        );
      }
    }
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
        if ( ! (obj instanceof AscendantFXTransaction) ) {
          return getDelegate().put_(x, obj);
        }
    
        AscendantFXTransaction transaction = (AscendantFXTransaction) obj;
        if ( transaction.getStatus() != TransactionStatus.PENDING || ! SafetyUtil.isEmpty(transaction.getExternalInvoiceId()) ) {
          return getDelegate().put_(x, obj);
        }
    
        if ( ! transaction.getAccepted() ) {
          transaction.accept(x);
        }
    
        //Submit transation to AscendantFX
        AscendantFX ascendantFX = (AscendantFX) x.get("ascendantFX");
        PaymentService ascendantPaymentService = new AscendantFXServiceProvider(x, ascendantFX);
        try {
          ascendantPaymentService.submitPayment(transaction);
          transaction.setStatus(TransactionStatus.SENT);
        } catch (Throwable t) {
          transaction.setStatus(TransactionStatus.DECLINED);
          getDelegate().put_(x, transaction);
          ((Logger) x.get("logger")).error("AscendantFxTransactionDAO unexepected exception ", t);
          throw new RuntimeException(t.getMessage());
        }
    
    
        return super.put_(x, transaction);
      `
    },
    {
      name: 'generateCompletionDate',
      visibility: 'protected',
      type: 'Date',
      javaCode: `
        List<Integer> cadHolidays = CsvUtil.cadHolidays; // REVIEW: When BankHolidays is tested
        Calendar curDate = Calendar.getInstance();
        int businessDays = 2; // next 2 business days
        int i = 0;
        while ( i < businessDays ) {
          curDate.add(Calendar.DAY_OF_YEAR, 1);
          if ( curDate.get(Calendar.DAY_OF_WEEK) != Calendar.SATURDAY
            && curDate.get(Calendar.DAY_OF_WEEK) != Calendar.SUNDAY
            && ! cadHolidays.contains(curDate.get(Calendar.DAY_OF_YEAR)) ) {
            i = i + 1;
          }
        }
        return curDate.getTime();
    `
    }
  ]
});

