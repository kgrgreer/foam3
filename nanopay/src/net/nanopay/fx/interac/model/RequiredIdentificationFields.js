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
  name: 'RequiredIdentificationFields',
  requires: [ 'net.nanopay.fx.interac.model.RequiredDocumentFields' ],
  properties: [
    {
      class: 'Boolean',
      name: 'birthDate',
      postSet: function(oldValue, newValue) {
        this.cityOfBirth = newValue;
        this.countryOfBirth = newValue;
        return newValue;
      }
    },
    {
      class: 'Boolean',
      name: 'cityOfBirth',
      visibility: 'RO'
    },
    {
      class: 'Boolean',
      name: 'countryOfBirth',
      visibility: 'RO'
    },
    {
      class: 'FObjectProperty',
      name: 'identificationDocuments',
      factory: function() {
        return this.RequiredDocumentFields.create();
      }
    },
    {
      class: 'Boolean',
      name: 'occupation'
    },
    {
      class: 'Boolean',
      name: 'phoneNumber',
    },
    {
      class: 'Boolean',
      name: 'emailAddress',
      value: true
    }
  ]
});
