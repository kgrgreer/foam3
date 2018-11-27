foam.CLASS({
  package: 'net.nanopay.flinks.model',
  name: 'FlinksAccountsDetailResponse',
  extends: 'net.nanopay.flinks.model.FlinksResponse',

  documentation: 'model for Flinks accounts detail response',

  tableColumns: [ 'id', 'userId', 'RequestId', 'HttpStatusCode' ],

  properties: [
    {
      class: 'Long',
      name: 'id',
      visibility: 'RO'
    },
    {
      class: 'FObjectArray',
      of: 'net.nanopay.flinks.model.AccountWithDetailModel',
      name: 'Accounts',
      visibility: 'RO'
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'userId',
      documentation: 'User for whom Flinks data is pulled',
      visibility: 'RO'
    }
  ]
});
