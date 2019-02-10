foam.CLASS({
  package: 'net.nanopay.tx.alterna',
  name: 'AlternaVerificationTransaction',
  extends: 'net.nanopay.tx.cico.VerificationTransaction',

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
    {
      class: 'String',
      name: 'padType'
    },
    {
      class: 'String',
      name: 'txnCode'
    },
    {
      class: 'String',
      name: 'description',
      swiftName: 'description_',
      visibility: foam.u2.Visibility.RO
    },
  ],
  methods: [
    {
      name: 'limitedCopyFrom',
      args: [
        {
          name: 'other',
          type: 'net.nanopay.tx.model.Transaction'
        },
      ],
      javaCode: `
        super.limitedCopyFrom(other);
        setReturnType(((AlternaVerificationTransaction)other).getReturnType());
        setConfirmationLineNumber(((AlternaVerificationTransaction)other).getConfirmationLineNumber());
        setReturnCode(((AlternaVerificationTransaction)other).getReturnCode());
        setReturnDate(((AlternaVerificationTransaction)other).getReturnDate());
        setReturnType(((AlternaVerificationTransaction)other).getReturnType());
        setPadType(((AlternaVerificationTransaction)other).getPadType());
        setTxnCode(((AlternaVerificationTransaction)other).getTxnCode());
        setDescription(((AlternaVerificationTransaction)other).getDescription());
      `
    },
  ]
});
