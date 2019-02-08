foam.CLASS({
  package: 'net.nanopay.meter.compliance.secureFact.sidni.model',
  name: 'SIDniErrors',
  extends: 'net.nanopay.meter.compliance.secureFact.sidni.model.BasicResponseObject',
  documentation: `The Error object for SIDni`,

  properties: [
    {
      class: 'FObjectArray',
      of: 'net.nanopay.meter.compliance.secureFact.sidni.model.SIDniErrorComponent',
      name: 'errors',
    },
  ]
});
