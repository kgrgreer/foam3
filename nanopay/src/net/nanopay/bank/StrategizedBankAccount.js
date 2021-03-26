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
    'foam.mlang.Expressions'
  ],

  imports: [
    'countryDAO',
    'sourceCorridorDAO',
    'subject'
  ],

  requires: [
    'foam.dao.PromisedDAO',
    'foam.nanos.auth.Country',
    'net.nanopay.payment.PaymentProviderCorridor'
  ],

  sections: [
    {
      name: 'accountInformation',
      title: 'Create Bank Account'
    }
  ],

  messages: [
    { name: 'PLACEHOLDER', message: 'Please select ' },
    { name: 'INVALID_BANK', message: 'Invalid Bank' },
    { name: 'DOMICILED_BK_ACC_COUNTRY', message: 'Domiciled bank account country' }
  ],

  properties: [
    {
      class: 'foam.dao.DAOProperty',
      name: 'permittedCountries',
      visibility: 'HIDDEN',
      factory: function() {
        return this.PromisedDAO.create({
          of: 'foam.nanos.auth.Country',
          promise: this.sourceCorridorDAO
            .select(this.MAP(this.PaymentProviderCorridor.SOURCE_COUNTRY))
            .then((sink) => {
              let countries = sink.delegate.array ? sink.delegate.array : [];
              countries.push(this.subject.user.address.countryId);
              return this.countryDAO.where(this.IN(this.Country.CODE, sink.delegate.array));
            })
        });
      }
    },
    {
      class: 'Reference',
      name: 'selectedCountry',
      of: 'foam.nanos.auth.Country',
      label: 'Country of bank account',
      section: 'accountInformation',
      documentation: 'Determines what bank view will be displayed pertaining to country.',
      view: function(_, x) {
        return {
          class: 'foam.u2.view.RichChoiceView',
          sections: [
            {
              placeholder: x.data.PLACEHOLDER,
              heading: x.data.DOMICILED_BK_ACC_COUNTRY,
              dao$: x.data.permittedCountries$
            }
          ]
        };
      },
      postSet: function(o, n) {
        var bank = (foam.lookup(`net.nanopay.bank.${n}BankAccount`)).create({}, this)
        this.bankAccount = bank
      }
    },
    {
      class: 'FObjectProperty',
      name: 'bankAccount',
      of: 'net.nanopay.bank.BankAccount',
      label: '',
      section: 'accountInformation',
      visibility: function(selectedCountry) {
        return selectedCountry == '' ? foam.u2.DisplayMode.HIDDEN : foam.u2.DisplayMode.RW;
      },
      view: function(_,X) {
        return foam.u2.detail.VerticalDetailView.create({
          useSections: ['clientAccountInformation', 'pad'],
          showTitle: false
        }, X)
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
    }
  ],
});
