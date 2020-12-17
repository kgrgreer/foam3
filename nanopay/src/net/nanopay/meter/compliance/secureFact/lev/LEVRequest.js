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
  package: 'net.nanopay.meter.compliance.secureFact.lev',
  name: 'LEVRequest',
  extends: 'net.nanopay.meter.compliance.secureFact.SecurefactRequest',

  properties: [
    {
      class: 'String',
      name: 'searchType',
      required: true,
      documentation: 'Performs search against entityName or entityNumber'
    },
    {
      class: 'String',
      name: 'entityName',
      documentation: 'Max 350 characters. This or entityNumber is required.'
    },
    {
      class: 'String',
      name: 'entityNumber',
      documentation: 'Max 50 characters. This or entityName is required.'
    },
    {
      class: 'String',
      name: 'country',
      required: true,
      documentation: 'CA only.',
      value: 'CA'
    },
    {
      class: 'String',
      name: 'jurisdiction',
      required: true,
      documentation: 'Jurisdiction where search should be conducted. CD = Canada federal.'
    },
    {
      class: 'String',
      name: 'customerReference',
      documentation: 'Identifier for the transaction from customer.'
    },
    {
      class: 'String',
      name: 'formationDate',
      documentation: 'Entity formation date.'
    },
    {
      class: 'String',
      name: 'entityType',
      documentation: 'Entity type of the entity'
    },
    {
      class: 'String',
      name: 'address',
      documentation: 'Reccomended postal code only.'
    },
    {
      class: 'FObjectArray',
      of: 'net.nanopay.meter.compliance.secureFact.lev.LEVApplicant',
      name: 'applicant',
      documentation: 'Can only have 1 entry, but an array is required.'
    }
  ]
  });
