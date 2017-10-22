foam.CLASS({
  package: 'net.nanopay.model',
  name: 'Account',
  //TODO: GET RID OF EXTENTIONS WHEN RELATIONSHIPS WITH JAVA
  extends: 'foam.core.FObject',
  properties: [
    {
      class: 'Long',
      name: 'id'
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.model.AccountLimit',
      name: 'limit'
    },
    {
      class: 'Long',
      name: 'balance'
    }
  ]
});
