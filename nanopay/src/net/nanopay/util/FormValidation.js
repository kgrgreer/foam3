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
  package: 'net.nanopay.util',
  name: 'FormValidation',

  exports: [
    'validateAccountNumber',
    'validateAddress',
    'validateAge',
    'validateCity',
    'validateEmail',
    'validateInstitutionNumber',
    'validateNorthAmericanPhoneNumber',
    'validatePassword',
    'validatePhoneCountryCode',
    'validatePhone',
    'validatePostalCode',
    'validateRoutingNumber',
    'validateStreetNumber',
    'validateTitleNumOrAuth',
    'validateTransitNumber',
    'validateWebsite'
  ],

  methods: [
    function validatePhoneCountryCode(number) {
      // based off patterns listed at https://countrycode.org/
      var re = /^[+]?\d{1,3}$|^[+]?\d{1,2}[-]?\d{3,4}$/;
      return re.test(String(number));
    },

    function validateNorthAmericanPhoneNumber(number) {
      var re = /^([+]?\d{1,2}[\-]?)?(\d{3}[\-]?){2}(\d{4}){1}$/;
      return re.test(String(number));
    },

    function validateEmail(email) {
      var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      return re.test(String(email).toLowerCase());
    },

    function validatePhone(number) {
      var re = /([+]?\d{1,2}[.-\s]?)?(\d{3}[.-]?){2}\d{4}/g;
      return re.test(String(number));
    },

    function validateStreetNumber(streetNumber) {
      return streetNumber.length > 0 ? true : false;
    },

    function validateAddress(address) {
      var re = /^[#a-zA-Z0-9 ]{1,70}$/;
      return re.test(String(address));
    },

    function validatePostalCode(code, countryId) {
      // TODO: Make this more general. Probably store RegEx in Country
      var caRe = /^[ABCEGHJ-NPRSTVXY]\d[ABCEGHJ-NPRSTV-Z][ -]?\d[ABCEGHJ-NPRSTV-Z]\d$/i; // Canadian Format
      var usRe = /^^\d{5}(?:[-\s]\d{4})?$/i; // US Format

      var postal = String(code);

      // Perform RegEx check based on countryId
      switch ( countryId ) {
        case 'CA' :
          return caRe.test(postal);
        case 'US' :
          return usRe.test(postal);
        default :
          // If no countryId is recognized, defaults to Canadian Format
          return caRe.test(postal);
      }
    },

    function validateCity(city) {
      var re = /^[a-zA-Z ]{1,35}$/;
      return re.test(String(city));
    },

    function validatePassword(password) {
      // TODO: call auth.validatePassword(password). Requires adding promise support everywhere this is called.
      // If passwordValidationRegex in UserAndGroupAuthService is changed, update here to match.
      var re = /^.{6,}$/;
      return re.test(String(password));
    },

    function validateWebsite(website) {
      var re = /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9]\.[^\s]{2,})/;
      return re.test(String(website));
    },

    function validateTitleNumOrAuth(issuingAuthority) {
      var re = /^[a-zA-Z0-9 ]{1,35}$/;
      return re.test(String(issuingAuthority));
    },

    function validateAccountNumber(accountNumber) {
      var re = /^[0-9 ]{1,30}$/;
      return re.test(String(accountNumber));
    },

    function validateTransitNumber(transitNumber) {
      var re = /^[0-9 ]{5}$/;
      return re.test(String(transitNumber));
    },

    function validateRoutingNumber(routingNumber) {
      var re = /^[0-9 ]{9}$/;
      return re.test(String(routingNumber));
    },

    function validateAge(date) {
      if ( ! date ) return false;
      var year = date.getFullYear();
      var currentYear = new Date().getFullYear();
      return currentYear - year >= 16;
    },

    function validateInstitutionNumber(institutionNumber) {
      var re = /^[0-9 ]{3}$/;
      return re.test(String(institutionNumber));
    }
  ]
});
