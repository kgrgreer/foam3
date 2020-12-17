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
  name: 'PaymentProviderCorridor',
  extends: 'foam.nanos.crunch.Capability',

  documentation: `References payment provider and corridor along with currencies available
      in source and target currencies.
      Defines a corridor a payment provider provides and the currencies available through
      the source and target currencies. Acts as a junction model with it's own junctionDAO
      (PaymentProviderCorridorDAO)

      Refrain from creating paymentProviderCorridors directly into journals.
      Rules on the paymentProviderCorridorDAO are responsible for associating the appropriate
      prerequisites.
  `,

  implements: [
    'foam.core.Validatable',
  ],

  javaImports: [
    'foam.core.Currency',
    'foam.dao.DAO',
    'foam.nanos.auth.Country',
    'net.nanopay.payment.PaymentProvider',

    'static foam.mlang.MLang.EQ',
    'foam.util.Arrays'
  ],

  messages: [
    { name: 'MISSING_SOURCE_COUNTRY', message: 'Error: Cannot find or missing associated source country in DB: ' },
    { name: 'MISSING_TARGET_COUNTRY', message: 'Error: Cannot find or missing associated target country in DB: ' },
    { name: 'MISSING_PROVIDER', message: 'Error: Cannot find payment provider in DB: ' },
    { name: 'CURRENCY_NOT_SUPPORTED', message: 'Error: Currency not supported: ' },
    { name: 'PAYMENT_CORRIDOR_EXISTS', message: 'Error: Payment Provider Corridor already exists' },
  ],

  properties: [
    {
      class: 'Reference',
      name: 'provider',
      of: 'net.nanopay.payment.PaymentProvider',
      targetDAOKey: 'paymentProviderDAO'
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.Country',
      name: 'sourceCountry',
      targetDAOKey: 'countryDAO',
      documentation: '1st party involved in agreement.',
      required: true
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.Country',
      name: 'targetCountry',
      targetDAOKey: 'countryDAO',
      documentation: '2nd party involved in agreement.',
      required: true
    },
    {
      class: 'StringArray',
      name: 'sourceCurrencies',
      documentation: `Currencies user can transact from the account's source country.`
    },
    {
      class: 'StringArray',
      name: 'targetCurrencies',
      documentation: `Currencies user can transact from the account's target country.`
    },
    {
      class: 'Long',
      name: 'ranking',
      documentation: `Ranking of how preferred this corridor is, with 0 being most preferred.`,
      value: 1000
    },
    {
      class: 'String',
      name: 'currency',
      documentation: 'Helper property used during paymentProviderCorridor selection',
      transient: true
    }
  ],

  methods: [
    {
      name: 'validate',
      args: [
        { name: 'x', type: 'Context' }
      ],
      type: 'Void',
      javaThrows: ['IllegalStateException'],
      javaCode: `
        if ( ((Country) findSourceCountry(x)) == null ) {
          throw new IllegalStateException(MISSING_SOURCE_COUNTRY + getSourceCountry());
        }
        if ( ((Country) findTargetCountry(x)) == null ) {
          throw new IllegalStateException(MISSING_TARGET_COUNTRY + getTargetCountry());
        }
        if ( ((PaymentProvider) findProvider(x)) == null ) {
          throw new IllegalStateException(MISSING_PROVIDER + getProvider());
        }

        DAO currencyDAO = (DAO) x.get("currencyDAO");
        String[] currencies = Arrays.append(getSourceCurrencies(), getTargetCurrencies());
        for ( String currency : currencies ) {
          if ( ((Currency)currencyDAO.find(currency)) == null ) {
            throw new IllegalStateException(CURRENCY_NOT_SUPPORTED + currency);
          }
        }

        DAO paymentProviderCorridorDAO = (DAO) x.get("paymentProviderDAO");
        PaymentProviderCorridor ppc = (PaymentProviderCorridor) paymentProviderCorridorDAO.find(
          foam.mlang.MLang.AND(
            foam.mlang.MLang.EQ(PaymentProviderCorridor.SOURCE_COUNTRY, getSourceCountry()),
            foam.mlang.MLang.EQ(PaymentProviderCorridor.TARGET_COUNTRY, getTargetCountry())
          ));

        if ( ppc != null && ppc.getId() != getId() ) {
          throw new IllegalStateException(PAYMENT_CORRIDOR_EXISTS);
        }
       `
    }
  ]
});
