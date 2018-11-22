foam.CLASS({
  package: 'net.nanopay.integration.quick.model',
  name: 'QuickQueryAttachable',
  documentation: 'Class for Attachable import from Quick Accounting Software',
  properties: [
    {
      class: 'String',
      name: 'Note'
    },
    {
      class: 'String',
      name: 'domain'
    },
    {
      class: 'Boolean',
      name: 'sparse'
    },
    {
      class: 'String',
      name: 'Id'
    },
    {
      class: 'String',
      name: 'SyncToken'
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.integration.quick.model.QuickQueryMetaData',
      name: 'MetaData',
    },
    {
      class: 'FObjectArray',
      of: 'net'
    }
  ]
});
