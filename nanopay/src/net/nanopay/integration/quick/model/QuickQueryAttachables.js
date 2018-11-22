foam.CLASS({
  package: 'net.nanopay.integration.quick.model',
  name: 'QuickQueryAttachables',
  documentation: 'Class for Attachable import from Quick Accounting Software',
  properties: [
    {
      class: 'FObjectArray',
      of: 'net.nanopay.integration.quick.model.QuickQueryAttachable',
      name: 'Attachable'
    }
  ]
});
