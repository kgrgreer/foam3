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
  name: 'RequiredAddressFields',
  properties: [
    {
      class: 'String',
      name: 'addressType',
      visibility: 'RO',
      value: 'ADDR'
    },
    {
      class: 'Boolean',
      name: 'structured',
      visibility: 'RO',
      documentation: 'Possible options: "Structured" | "Unstructured"',
    },
    {
      class: 'Boolean',
      name: 'streetName',
      visibility: 'RO',
      expression: function(structured) {
        return structured;
      }
    },
    {
      class: 'Boolean',
      name: 'buildingNumber',
      visibility: 'RO',
      expression: function(structured) {
        return structured;
      }
    },
    {
      class: 'Boolean',
      name: 'addressLine1',
      visibility: 'RO',
      expression: function(structured) {
        return ! structured;
      }
    },
    {
      class: 'Boolean',
      name: 'addressLine2',
      visibility: 'RO',
      expression: function(structured) {
        return ! structured;
      }
    },
    {
      class: 'Boolean',
      name: 'postCode',
      visibility: 'RO',
      value: true
    },
    {
      class: 'Boolean',
      name: 'townName',
      visibility: 'RO',
      value: true
    },
    {
      class: 'Boolean',
      name: 'countrySubDivision',
      documentation: 'Region/Province/State eg: "ON"',
      visibility: 'RO',
      value: true
    },
    {
      class: 'Boolean',
      name: 'country',
      visibility: 'RO',
      value: true
    }
  ]
});
