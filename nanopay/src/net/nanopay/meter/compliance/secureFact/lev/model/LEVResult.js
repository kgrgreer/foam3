foam.CLASS({
  package: 'net.nanopay.meter.compliance.secureFact.lev.model',
  name: 'LEVResult',

  properties: [
    {
      class: 'Int',
      name: 'resultId',
    },
    {
      class: 'String',
      name: 'entityName',
    },
    {
      class: 'String',
      name: 'entityType',
    },
    {
      class: 'String',
      name: 'normalizedEntityType',
    },
    {
      class: 'String',
      name: 'entityStatus',
    },
    {
      class: 'String',
      name: 'normalizedEntityStatus',
    },
    {
      class: 'Boolean',
      name: 'extraProvincial',
    },
    {
      class: 'String',
      name: 'jurisdiction',
    },
    {
      class: 'String',
      name: 'homeJurisdiction',
    },
    {
      class: 'String',
      name: 'formationDate',
    },
    {
      class: 'String',
      name: 'entityNumber',
    },
    {
      class: 'String',
      name: 'annualReturnCompliance',
    },
    {
      class: 'Boolean',
      name: 'closeMatch',
      documentation: `This field will have a value of ‘true’ if Securefact determines the entity to
                      be the closest match to the search criteria and the Profile Report can be ordered.`
    },
    {
      class: 'String',
      name: 'nameStatus',
    },
    {
      class: 'FObjectArray',
      of: 'net.nanopay.meter.compliance.secureFact.lev.model.LEVChange',
      name: 'changes',
    },
    {
      class: 'String',
      name: 'confidenceScore',
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.meter.compliance.secureFact.lev.model.LEVIndividualScores',
      name: 'individualScores',
    },
  ]
  });
