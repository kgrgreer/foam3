foam.CLASS({
  package: 'net.nanopay.flinks.model',
  name: 'FlinksAccountSummaryRequest',
  extends: 'net.nanopay.flinks.model.FlinksAccountRequest',

  documentation: 'model for Flinks Account Summary Request',

  properties: [
    {
      class: 'Boolean',
      name: 'DirectRefresh'
    }
  ]
});