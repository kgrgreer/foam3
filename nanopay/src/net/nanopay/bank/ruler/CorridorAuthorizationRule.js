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
  package: 'net.nanopay.bank.ruler',
  name: 'CorridorAuthorizationRule',

  documentation: 'Checking if user has correct Corridor to create the bank account',

  implements: ['foam.nanos.ruler.RuleAction'],

  javaImports: [
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.auth.AuthorizationException',
    'foam.nanos.auth.User',
    'net.nanopay.bank.BankAccount',
    'net.nanopay.model.Business',
    'net.nanopay.payment.PaymentProviderCorridor',
    'static foam.mlang.MLang.*',
  ],

  messages: [
    {
      name: 'MISSING_REQUIRED_CORRIDOR',
      message: 'We do not support creating a bank account in this country with the denomination selected'
    },
    {
      name: 'BUSINESS_REQUIRED',
      message: 'Business is required to create a bank account'
    },
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        BankAccount acc = (BankAccount) obj;
        
        String country =  acc.getCountry();
        String currency = acc.getDenomination();

        DAO sourceCorridorDAO = (DAO) x.get("sourceCorridorDAO");
        DAO targetCorridorDAO = (DAO) x.get("targetCorridorDAO");
        PaymentProviderCorridor ppc;

        //check if bank account belongs to a contact
        if ( acc.getForContact() ) {
          ppc = (PaymentProviderCorridor) targetCorridorDAO.find(
            AND(
              EQ(PaymentProviderCorridor.TARGET_COUNTRY, country),
              IN(currency, PaymentProviderCorridor.TARGET_CURRENCIES)
            )
          );
          if ( ppc != null ) return;
        } else {
          ppc = (PaymentProviderCorridor) sourceCorridorDAO.find(
            AND(
              EQ(PaymentProviderCorridor.SOURCE_COUNTRY, country),
              IN(currency, PaymentProviderCorridor.SOURCE_CURRENCIES)
            )
          );
          if ( ppc != null ) return;
        }
        throw new AuthorizationException(MISSING_REQUIRED_CORRIDOR);
      `
    }
  ]
});
