foam.CLASS({
  package: 'net.nanopay.integration.quick.model',
  name: 'QuickQueryAttachableReference',
  documentation: 'Class for Attachable import from Quick Accounting Software',
  properties: [
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.integration.quick.model.QuickQueryAttachableEntityReference',
      name: 'EntityRef'
    },
    {
      class: 'Boolean',
      name: 'IncludeOnSend'
    }
  ]
});
