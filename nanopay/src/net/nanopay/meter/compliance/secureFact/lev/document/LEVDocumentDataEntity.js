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
  name: 'LEVDocumentDataEntity',
  documentation: `The LEV document data entity details`,

  properties: [
    {
      class: 'String',
      name: 'name',
      documentation: 'The entity name as reflected on the profile report.'
    },
    {
      class: 'String',
      name: 'nameDifferentLanguage',
      documentation: 'The name of the entity in a secondary language, if available.'
    },
    {
      class: 'Array',
      of: 'String',
      name: 'otherRegisteredBusinessNames',
      documentation: 'Lists the business names registered by the entity.'
    },
    {
      class: 'String',
      name: 'number',
      documentation: 'The entity number as reflected on the profile report.'
    },
    {
      class: 'String',
      name: 'businessNumber',
      documentation: 'The BN15 which is composed of the BN9 assigned by the CRA.'
    },
    {
      class: 'String',
      name: 'type',
      documentation: 'The entity type, as reflected on the profile report.'
    },
    {
      class: 'String',
      name: 'subType',
      documentation: 'The entity sub-type, as reflected on the profile.'
    },
    {
      class: 'String',
      name: 'formationDate',
      documentation: 'The formation date of the entity.'
    },
    {
      class: 'String',
      name: 'registryFormationDate',
      documentation: 'Formation date for Quebec. Field will be null otherwise.'
    },
    {
      class: 'String',
      name: 'revivalDate',
      documentation: 'The revival date of the entity. If not revived will be null.'
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.meter.compliance.secureFact.lev.document.LEVLastDocumentFiled',
      name: 'lastDocumentFiled',
      documentation: 'The details of the last document filed.'
    },
    {
      class: 'String',
      name: 'annualReturnCompliance',
      documentation: 'The status of the entity in respect of its filing of annual returns.'
    },
    {
      class: 'FObjectArray',
      of: 'net.nanopay.meter.compliance.secureFact.lev.document.LEVNatureOfBusiness',
      name: 'natureOfBusiness',
      documentation: 'The nature of the business, as reported in the profile.'
    },
    {
      class: 'String',
      name: 'status',
      documentation: 'The status of the entity as reflected on the profile.'
    },
    {
      class: 'String',
      name: 'jurisdiction',
      documentation: 'The jurisdiction of the entity.'
    },
    {
      class: 'String',
      name: 'homeJurisdiction',
      documentation: 'The home jurisdiction of the entity.'
    },
    {
      class: 'FObjectArray',
      of: 'net.nanopay.meter.compliance.secureFact.lev.document.LEVEntityAddress',
      name: 'addresses',
      documentation: 'The addresses as reflected on the profile.'
    },
    {
      class: 'String',
      name: 'postalCodeScore',
      documentation: `The matching score for the provided postal code against the postal 
                      codes of addresses listed for the entity.`
    },
    {
      class: 'String',
      name: 'applicantFirstnameScore',
      documentation: `The matching score for the provided applicant first name against the
                      list of the parties for the entity.`
    },
    {
      class: 'String',
      name: 'applicantLastnameScore',
      documentation: `The matching score for the provided applicant last name when compared
                      against the list of parties of the entity.`
    }
  ]
});
