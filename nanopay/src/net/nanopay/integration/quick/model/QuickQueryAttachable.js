foam.CLASS({
  package: 'net.nanopay.integration.quick.model',
  name: 'QuickQueryAttachable',
  documentation: 'Class for Attachable import from Quick Accounting Software',
  properties: [
    {
      class: 'String',
      name: 'FileName'
    },
    {
      class: 'String',
      name: 'FileAccessUri'
    },
    {
      class: 'String',
      name: 'TempDownloadUri'
    },
    {
      class: 'Long',
      name: 'Size'
    },
    {
      class: 'String',
      name: 'ContentType'
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
      of: 'net.nanopay.integration.quick.model.QuickQueryAttachableReference',
      name: 'AttachableRef'
    }
  ]
});
