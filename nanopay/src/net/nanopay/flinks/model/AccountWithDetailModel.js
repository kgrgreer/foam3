foam.CLASS({
  package: 'net.nanopay.flinks.model',
  name: 'AccountWithDetailModel',
  extends: 'net.nanopay.flinks.model.AccountModel',

  documentation: 'model for the Flinks account with detail model',

  properties: [
    {
      // javaType: 'net.nanopay.flinks.model.HolderModel',
      // javaInfoType: 'foam.core.AbstractFObjectPropertyInfo',
      // javaJSONParser: 'new foam.lib.json.FObjectParser(net.nanopay.flinks.model.HolderModel.class)',
      class: 'FObjectProperty',
      of: 'net.nanopay.flinks.model.HolderModel',
      name: 'Holder'
    },
    {
      class: 'FObjectArray',
      of: 'net.nanopay.flinks.model.AccountTransactionModel',
      name: 'Transactions'
    },
    {
      class: 'String',
      name: 'TransitNumber'
    },
    {
      class: 'String',
      name: 'InstitutionNumber'
    }
  ]
});