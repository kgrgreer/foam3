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
  package: 'net.nanopay.bank',
  name: 'StrategizedBankAccount',

  documentation: 'Module for add bank account information based on paymentProviderCorridor',


  implements: [
    'foam.core.Validatable',
    'foam.mlang.Expressions',
  ],

  imports: [
    'sourceCorridorDAO',
    'subject'
  ],

  requires: [
    'foam.dao.PromisedDAO',
    'net.nanopay.payment.PaymentProviderCorridor'
  ],

  sections: [
    {
      name: 'accountInformation',
      title: function() {
        return this.SECTION_ACCOUNT_INFORMATION_TITLE;
      }
    },
  ],

  messages: [
    { name: 'PLACEHOLDER', message: 'Please select ' },
    { name: 'INVALID_BANK', message: 'Invalid Bank' },
    { name: 'SECTION_ACCOUNT_INFORMATION_TITLE', message: 'Create Bank Account' },
  ],

  properties: [
    {
      class: 'FObjectProperty',
      name: 'bankAccount',
      of: 'net.nanopay.bank.BankAccount',
      section: 'accountInformation',
      label: '',
      view: function(_, X){
        return X.data.slot(function(availableCountries, countries) {
          let e = foam.mlang.Expressions.create();
          var pred = e.AND(
              e.EQ(foam.strategy.StrategyReference.DESIRED_MODEL_ID, 'net.nanopay.bank.BankAccount'),
              e.IN(foam.strategy.StrategyReference.STRATEGY, countries)
          );
          return foam.u2.view.FObjectView.create({
            of: net.nanopay.bank.BankAccount,
            predicate: pred,
            placeholder: X.data.PLACEHOLDER,
            classIsFinal: true,
            data$: X.data.bankAccount$,
            copyOldData: function(o) { return { isDefault: o.isDefault }; }
          }, X);
        })
      },
      validationPredicates: [
        {
          args: ['bankAccount', 'bankAccount$errors_'],
          predicateFactory: function(e) {
            return e.EQ(foam.mlang.IsValid.create({
                arg1: net.nanopay.bank.StrategizedBankAccount.BANK_ACCOUNT
              }), true);
          },
          errorMessage: 'INVALID_BANK'
        }
      ],
      validateObj: function(bankAccount, bankAccount$errors_) {
        return bankAccount ? bankAccount$errors_ : "text";
        }
    },
    {
      transient: true,
      flags: ['web'],
      name: 'availableCountries',
      visibility: 'HIDDEN',
      expression: function(sourceCorridorDAO) {
        return this.PromisedDAO.create({
          promise: sourceCorridorDAO
            .select(this.MAP(this.PaymentProviderCorridor.SOURCE_COUNTRY))
            .then((sink) => {
              let countries = sink.delegate.array ? sink.delegate.array : [];
              countries.push(this.subject.user.address.countryId);
              let unique = [...new Set(countries)];
              let arr = [];
              for ( i = 0; i < unique.length; i++ ) {
                model = foam.lookup(`net.nanopay.bank.${ unique[i] }BankAccount`);
                if ( model ) arr.push(model);
              }
              this.countries = arr;
            })
        });
      }
    },
    {
      transient: true,
      flags: ['web'],
      name: 'countries',
      visibility: 'HIDDEN',
      documentation: ``,
      factory: function() { return []; }
    },
  ],
});
