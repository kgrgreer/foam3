foam.CLASS({
  package: 'net.nanopay.fx.interac.model',
  name: 'RequiredAgentFields',
  properties: [
    {
      class: 'Boolean',
      name: 'BICFI',
      visibility: 'RO'
    },
    {
      class: 'Boolean',
      name: 'branchIdentification',
      expression: function(memberCode) {
        if ( memberCode === 'CACPA' ) return true;
        return false;
      }
    },
    {
      class: 'Boolean',
      name: 'memberId',
      visibility: 'RO',
      value: true
    },
    {
      class: 'String',
      name: 'memberCode',
      visibility: 'RO',
      documentation: 'Set by RequiredUserFields which checks for SENDER || RECEIVER'
    }
  ]
});
