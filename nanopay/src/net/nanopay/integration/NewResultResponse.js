foam.CLASS({
  package: 'net.nanopay.integration',
  name: 'NewResultResponse',
  extends: 'net.nanopay.integration.ResultResponse',

  properties: [
    {
      class: 'FObjectArray',
      of: 'net.nanopay.integration.ContactMismatchPair',
      name: 'syncContactsResult'
    }
  ]
});
