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
  name: 'SIDniRequest',
  extends: 'net.nanopay.meter.compliance.secureFact.SecurefactRequest',

  documentation: `The request object for a SIDni validation request.`,

  properties: [
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.meter.compliance.secureFact.sidni.SIDniCustomer',
      name: 'customer',
      required: true
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.meter.compliance.secureFact.sidni.SIDniName',
      name: 'name',
      required: true
    },
    {
      class: 'FObjectArray',
      of: 'net.nanopay.meter.compliance.secureFact.sidni.SIDniAddress',
      name: 'address',
      required: true,
      documentation: 'Has to have current address. Max size of 2'
    },
    {
      class: 'FObjectArray',
      of: 'net.nanopay.meter.compliance.secureFact.sidni.SIDniPhone',
      name: 'phone'
    },
    {
      class: 'String',
      name: 'dateOfBirth',
      required: true,
      documentation: 'Must be YYYY-MM-DD format.'
    },
    {
      class: 'String',
      name: 'sin',
      documentation: 'Social insurance number. Must be 9 digits'
    }
  ]
});
