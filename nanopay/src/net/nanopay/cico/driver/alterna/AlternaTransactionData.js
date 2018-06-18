foam.CLASS({
  package: 'net.nanopay.cico.driver.alterna',
  name: 'AlternaTransactionData',
  extends: 'net.nanopay.cico.driver.CICOTransactionData',

  properties: [
    {
      class: 'String',
      name: 'confirmationLineNumber',
      visibility: foam.u2.Visibility.RO
    },
    {
      class: 'String',
      name: 'returnCode',
      visibility: foam.u2.Visibility.RO
    },
    {
      class: 'String',
      name: 'returnDate',
      visibility: foam.u2.Visibility.RO
    },
    {
      class: 'String',
      name: 'returnType',
      visibility: foam.u2.Visibility.RO
    },
  ]
});
