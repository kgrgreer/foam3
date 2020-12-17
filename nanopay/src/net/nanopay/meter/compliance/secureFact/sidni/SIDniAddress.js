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
  package: 'net.nanopay.meter.compliance.secureFact.sidni',
  name: 'SIDniAddress',

  documentation: `Represents SIDni address`,

  properties: [
    {
      class: 'String',
      name: 'addressType',
      required: true,
      documentation: 'Type of address, Current or Former'
    },
    {
      class: 'String',
      name: 'addressLine',
      required: true,
      documentation: `Individual's street address. example: 1531 King Street`
    },
    {
      class: 'String',
      name: 'city',
      required: true
    },
    {
      class: 'String',
      name: 'province',
      required: true
    },
    {
      class: 'String',
      name: 'postalCode',
      required: true
    },
    {
      class: 'String',
      name: 'country',
      documentation: 'Only CA is supported right now',
      value: 'CA'
    }
  ]
});
