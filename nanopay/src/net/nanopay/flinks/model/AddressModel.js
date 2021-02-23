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
  package: 'net.nanopay.flinks.model',
  name: 'AddressModel',

  documentation: 'model for the Flinks address mode',

  properties: [
    {
      class: 'String',
      name: 'CivicAddress',
      validateObj: function(CivicAddress) {
        if ( ! CivicAddress || CivicAddress > 70 ) {
          return this.AddressError;
        }
      }
    },
    {
      class: 'String',
      name: 'City',
      validateObj: function(City) {
        if ( ! City || City.length > 35 ) {
          return this.AddressCityError;
        }
      }
    },
    {
      class: 'String',
      name: 'Province',
      validateObj: function(Province) {
        if ( ! Province || ! Province.name || Province.name.length > 35 ) {
          return this.AddressProvinceError;
        }
      }
    },
    {
      class: 'String',
      name: 'PostalCode',
      validateObj: function(PostalCode) {
        var postalCodeRegex = /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/;

        if ( ! postalCodeRegex.test(PostalCode) ) {
          return this.AddressPostalCodeError;
        }
      }
    },
    {
      class: 'String',
      name: 'POBox'
    },
    {
      class: 'String',
      name: 'Country'
    }
  ],

  messages: [
    { name: 'ADDRESS_ERROR', message: 'Street address is invalid' },
    { name: 'ADDRESS_CITY_ERROR', message: 'City name is invalid' },
    { name: 'ADDRESS_PROVINCE_ERROR', message: 'Invalid province option' },
    { name: 'ADDRESS_POSTAL_ERROR', message: 'Invalid postal code' }
  ]
});
