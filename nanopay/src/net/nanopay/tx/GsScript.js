foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'GsScript',
  extends: 'foam.nanos.script.Script',

  javaImports: [
    'net.nanopay.tx.model.Transaction'
  ],

  properties: [
    {
      class: 'foam.core.Blob',
      name: 'file'
    }
  ],

  methods: [

  ]
});
