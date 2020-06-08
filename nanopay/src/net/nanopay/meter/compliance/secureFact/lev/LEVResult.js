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
  name: 'LEVResult',

  properties: [
    {
      class: 'Int',
      name: 'resultId'
    },
    {
      class: 'String',
      name: 'entityName'
    },
    {
      class: 'String',
      name: 'entityType'
    },
    {
      class: 'String',
      name: 'normalizedEntityType'
    },
    {
      class: 'String',
      name: 'entityStatus'
    },
    {
      class: 'String',
      name: 'normalizedEntityStatus'
    },
    {
      class: 'Boolean',
      name: 'extraProvincial'
    },
    {
      class: 'String',
      name: 'jurisdiction'
    },
    {
      class: 'String',
      name: 'homeJurisdiction'
    },
    {
      class: 'String',
      name: 'formationDate'
    },
    {
      class: 'String',
      name: 'entityNumber'
    },
    {
      class: 'String',
      name: 'annualReturnCompliance'
    },
    {
      class: 'Boolean',
      name: 'closeMatch',
      documentation: `This field will have a value of 'true' if Securefact determines the entity to
        be the closest match to the search criteria and the Profile Report can be ordered.`
    },
    {
      class: 'String',
      name: 'nameStatus'
    },
    {
      class: 'FObjectArray',
      of: 'net.nanopay.meter.compliance.secureFact.lev.LEVChange',
      name: 'changes'
    },
    {
      class: 'String',
      name: 'confidenceScore'
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.meter.compliance.secureFact.lev.LEVIndividualScores',
      name: 'individualScores'
    },
  ]
  });
