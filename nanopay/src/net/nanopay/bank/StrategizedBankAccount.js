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
    'subject',
    'countryDAO',
  ],

  requires: [
    'foam.dao.PromisedDAO',
    'net.nanopay.payment.PaymentProviderCorridor',
    'foam.nanos.auth.Country',
  ],

  sections: [
    {
      name: 'accountInformation',
      title: function() {
        return this.SECTION_ACCOUNT_INFORMATION_TITLE;
      }
    }
  ],

  messages: [
    { name: 'PLACEHOLDER', message: 'Please select ' },
    { name: 'INVALID_BANK', message: 'Invalid Bank' },
    { name: 'SECTION_ACCOUNT_INFORMATION_TITLE', message: 'Create Bank Account' },
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
      documentation: 'Determines what bank view will be displayed pertaining to country.',
      view: function(_, x) {
        return {
          class: 'foam.u2.view.RichChoiceView',
          sections: [
            {
              heading: 'Domiciled bank account country',
              dao$: x.data.permittedCountries$
            }
          ]
        };
      }
    },
    {
      class: 'FObjectProperty',
      name: 'bankAccount',
      visibility: function(selectedCountry) {
        return selectedCountry == '' ? foam.u2.DisplayMode.HIDDEN : foam.u2.DisplayMode.HIDDEN;
      },
      expression: function(selectedCountry) {
        return (foam.lookup(`net.nanopay.bank.${ selectedCountry }BankAccount`)).create({}, this)
      }
    }
  ],
});
