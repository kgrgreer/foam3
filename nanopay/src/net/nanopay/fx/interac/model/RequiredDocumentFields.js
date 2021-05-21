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
  package: 'net.nanopay.fx.interac.model',
  name: 'RequiredDocumentFields',
  properties: [
    {
      class: 'Boolean',
      name: 'required',
      preSet: function(oldValue, newValue) {
        if ( ! newValue ) {
          this.alienRegistrationNumber = false;
          this.passportNumber = false;
          this.customerIdentificationNumber = false;
          this.driversLicenseNumber = false;
          this.employeeIdentificationNumber = false;
          this.nationalIdentityNumber = false;
          this.socialSecurityNumber = false;
          this.taxIdentificationNumber = false;
        }
        return newValue;
      }
    },
    {
      class: 'Boolean',
      name: 'alienRegistrationNumber',
      postSet: function(oldValue, newValue) {
        if ( ! this.required ) this.required = true;
        return newValue;
      }
    },
    {
      class: 'Boolean',
      name: 'passportNumber',
      postSet: function(oldValue, newValue) {
        if ( ! this.required ) this.required = true;
        return newValue;
      }
    },
    {
      class: 'Boolean',
      name: 'customerIdentificationNumber',
      postSet: function(oldValue, newValue) {
        if ( ! this.required ) this.required = true;
        return newValue;
      }
    },
    {
      class: 'Boolean',
      name: 'driversLicenseNumber',
      postSet: function(oldValue, newValue) {
        if ( ! this.required ) this.required = true;
        return newValue;
      }
    },
    {
      class: 'Boolean',
      name: 'employeeIdentificationNumber',
      postSet: function(oldValue, newValue) {
        if ( ! this.required ) this.required = true;
        return newValue;
      }
    },
    {
      class: 'Boolean',
      name: 'nationalIdentityNumber',
      postSet: function(oldValue, newValue) {
        if ( ! this.required ) this.required = true;
        return newValue;
      }
    },
    {
      class: 'Boolean',
      name: 'socialSecurityNumber',
      postSet: function(oldValue, newValue) {
        if ( ! this.required ) this.required = true;
        return newValue;
      }
    },
    {
      class: 'Boolean',
      name: 'taxIdentificationNumber',
      postSet: function(oldValue, newValue) {
        if ( ! this.required ) this.required = true;
        return newValue;
      }
    }
  ]
});
