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
  package: 'net.nanopay.sme.ui',
  name: 'AddressView',
  extends: 'foam.u2.View',

  documentation: 'SME specific address view used in forms.',

  requires: [
    'foam.nanos.auth.Country'
  ],

  imports: [
    'countryDAO'
  ],

  properties: [
    {
      class: 'Boolean',
      name: 'showValidation',
      value: true,
      documentation: 'Use this property if the value of validationTextVisible is situational.'
    },
    {
      class: 'Boolean',
      name: 'showDisclaimer',
      value: false,
      documentation: 'Displays PO boxes not allowed disclaimer if true.'
    },
    {
      class: 'Boolean',
      name: 'withoutCountrySelection',
      value: false,
      documentation: `If the value of this property is true, then hide country selection dropdown.`
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'customCountryDAO',
      documentation: 'Can be set if you want a filtered version of countryDAO.',
      factory: function() {
        return this.countryDAO.orderBy(this.Country.NAME);
      }
    }
  ],

  messages: [
    { name: 'PLACE_HOLDER', message: 'Please select...' },
    { name: 'STREET_NUMBER_LABEL', message: 'Number' }
  ],

  methods: [
    function initE() {
      this.SUPER();
      if ( this.data$.dot('structured').value ) {
        // StructuredAddressView
        this.addClass(this.myClass())
          .start()
            .tag(
              { class: 'net.nanopay.sme.ui.StructuredAddressView' },
              {
                data$: this.data$,
                showValidation$: this.showValidation$,
                showDisclaimer$: this.showDisclaimer$,
                withoutCountrySelection$: this.withoutCountrySelection$,
                customCountryDAO$: this.customCountryDAO$
              }
            )
          .end();
      } else {
        // UnstructuredAddressView
        this.addClass(this.myClass())
          .start()
            .tag(
              { class: 'net.nanopay.sme.ui.UnstructuredAddressView' },
              {
                data$: this.data$,
                customCountryDAO$: this.customCountryDAO$
              }
            )
          .end();
      }
    }
  ]
});
