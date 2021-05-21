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
  package: 'net.nanopay.meter.compliance.secureFact.lev.document',
  name: 'LEVEntityAddress',
  documentation: 'The address as reflected on the LEV document entity profile.',

  properties: [
    {
      class: 'String',
      name: 'type',
      documentation: 'The type of address. This will reflect the address type as it is on the profile.'
    },
    {
      class: 'String',
      name: 'value',
      documentation: 'The actual address.'
    },
    {
      class: 'String',
      name: 'civicNumber',
      documentation: 'The civic (street) number from the address.'
    },
    {
      class: 'String',
      name: 'streetName',
      documentation: 'The street name from the address.'
    },
    {
      class: 'String',
      name: 'unitNumber',
      documentation: 'The unit number from the address.'
    },
    {
      class: 'String',
      name: 'city',
      documentation: 'The city from the address.'
    },
    {
      class: 'String',
      name: 'province',
      documentation: 'The province from the address.'
    },
    {
      class: 'String',
      name: 'postalCode',
      documentation: 'The postal code from the address.'
    },
    {
      class: 'String',
      name: 'country',
      documentation: 'The country from the address.'
    }
  ]
});
