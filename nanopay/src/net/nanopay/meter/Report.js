foam.CLASS({
  package: 'net.nanopay.meter',
  name: 'Report',
  extends: 'foam.nanos.script.Script',

  properties: [
    {
      name: 'output',
      preSet: function(_, newVal) {
        return newVal;
      },
      javaSetter: `
      output_ = val;
      outputIsSet_ = true;
      `
    }
  ]
});
