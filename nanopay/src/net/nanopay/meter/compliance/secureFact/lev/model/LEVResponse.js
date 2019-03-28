foam.CLASS({
  package: 'net.nanopay.meter.compliance.secureFact.lev.model',
  name: 'LEVResponse',
  extends: 'net.nanopay.meter.compliance.secureFact.SecurefactResponse',

  javaImports: [
    'foam.util.SafetyUtil'
  ],

  tableColumns: [
    'id', 'name', 'entityId', 'closeMatches', 'searchId'
  ],

  properties: [
    {
      class: 'Int',
      name: 'searchId',
      documentation: 'Securefact unique search id.'
    },
    {
      class: 'String',
      name: 'closeMatches',
      label: 'Close Matches'
    },
    {
      class: 'Array',
      of: 'String',
      name: 'jurisdictionsUnavailable',
      documentation: 'If a jurisdiction is unavailable at the time of the search and results cannot be returned, it will be listed here.'
    },
    {
      class: 'FObjectArray',
      of: 'net.nanopay.meter.compliance.secureFact.lev.model.LEVResult',
      name: 'results'
    }
  ],

  methods: [
    {
      type: 'Boolean',
      name: 'hasCloseMatches',
      javaCode: `
        if ( ! SafetyUtil.isEmpty(getCloseMatches()) ) {
          int count = Integer.parseInt(getCloseMatches().split("/")[0]);
          return count > 0;
        }
        return false;
      `
    }
  ]
});
