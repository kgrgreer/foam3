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
      name: 'resultId',
      order: 10,
      gridColumns: 6
    },
    {
      class: 'Boolean',
      name: 'closeMatch',
      documentation: `This field will have a value of 'true' if Securefact determines the entity to
        be the closest match to the search criteria and the Profile Report can be ordered.`,
      order: 20,
      gridColumns: 3
    },
    {
      class: 'String',
      name: 'confidenceScore',
      order: 25,
      gridColumns: 3
    },
    {
      class: 'String',
      name: 'entityName',
      order: 30,
      gridColumns: 6
    },
    {
      class: 'String',
      name: 'entityType',
      order: 40,
      gridColumns: 3
    },
    {
      class: 'String',
      name: 'normalizedEntityType',
      order: 50,
      gridColumns: 3
    },
    {
      class: 'String',
      name: 'entityStatus',
      order: 60,
      gridColumns: 6
    },
    {
      class: 'String',
      name: 'normalizedEntityStatus',
      order: 70,
      gridColumns: 6
    },
    {
      class: 'Boolean',
      name: 'extraProvincial',
      order: 80,
      gridColumns: 6
    },
    {
      class: 'String',
      name: 'jurisdiction',
      order: 90,
      gridColumns: 3
    },
    {
      class: 'String',
      name: 'homeJurisdiction',
      order: 100,
      gridColumns: 3
    },
    {
      class: 'String',
      name: 'formationDate',
      order: 110,
      gridColumns: 6
    },
    {
      class: 'String',
      name: 'entityNumber',
      order: 120,
      gridColumns: 6
    },
    {
      class: 'String',
      name: 'annualReturnCompliance',
      order: 130,
      gridColumns: 6
    },
    {
      class: 'String',
      name: 'nameStatus',
      order: 140,
      gridColumns: 6
    },
    {
      class: 'FObjectArray',
      of: 'net.nanopay.meter.compliance.secureFact.lev.LEVChange',
      name: 'changes',
      order: 160
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.meter.compliance.secureFact.lev.LEVIndividualScores',
      name: 'individualScores',
      order: 170,
      gridColumns: 6
    },
  ]
  });
