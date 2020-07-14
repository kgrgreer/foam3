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
  package: 'net.nanopay.payment',
  name: 'PaymentProvider',
  extends: 'foam.nanos.crunch.Capability',

  documentation: 'Payment Provider.',

  javaImports: [
    'foam.core.X',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.mlang.MLang',
    'net.nanopay.bank.BankAccount',
    'java.util.ArrayList',
    'java.util.List'
  ],

  properties: [
    {
      class: 'String',
      name: 'name',
      documentation: 'Name of the Payment Provider.'
    }
  ],

  axioms: [
    {
      buildJavaClass: function (cls) {
        cls.extras.push(`
        
        public static ArrayList<PaymentProvider> findPaymentProvider(X x, BankAccount account){
      
          DAO InstitutionPaymentProviderDAO = (DAO) x.get("InstitutionPaymentProviderDAO");
          DAO paymentProviderDAO = (DAO) x.get("paymentProviderDAO");
      
          ArraySink sink = (ArraySink) InstitutionPaymentProviderDAO.where(
            MLang.OR(
              MLang.EQ(InstitutionPaymentProvider.INSTITUTION, account.getInstitution()),
              MLang.EQ(InstitutionPaymentProvider.INSTITUTION, 0)
            )
          ).select(new ArraySink());
          List<InstitutionPaymentProvider> array = sink.getArray();
      
          ArrayList<PaymentProvider> paymentProviders = new ArrayList<>();
      
          if ( array.size() > 0 ) {
            for ( InstitutionPaymentProvider config : array ) {
              PaymentProvider paymentProvider = (PaymentProvider) paymentProviderDAO.find(config.getPaymentProvider());
              paymentProviders.add(paymentProvider);
            }
          }
      
          return paymentProviders;
        }
        
        `)
      }
    }
    ]
});
