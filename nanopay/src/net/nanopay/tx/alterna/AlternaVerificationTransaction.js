foam.CLASS({
  package: 'net.nanopay.tx.alterna',
  name: 'AlternaVerificationTransaction',
  extends: 'net.nanopay.tx.cico.VerificationTransaction',

  properties: [
    {
      class: 'String',
      name: 'confirmationLineNumber',
      visibility: 'RO'
    },
    {
      class: 'String',
      name: 'returnCode',
      visibility: 'RO'
    },
    {
      class: 'String',
      name: 'returnDate',
      visibility: 'RO'
    },
    {
      class: 'String',
      name: 'returnType',
      visibility: 'RO'
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
      visibility: 'RO'
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
        if ( other instanceof AlternaVerificationTransaction) {
          setConfirmationLineNumber(((AlternaVerificationTransaction)other).getConfirmationLineNumber());
          setReturnCode(((AlternaVerificationTransaction)other).getReturnCode());
          setReturnDate(((AlternaVerificationTransaction)other).getReturnDate());
          setReturnType(((AlternaVerificationTransaction)other).getReturnType());
          setPadType(((AlternaVerificationTransaction)other).getPadType());
          setTxnCode(((AlternaVerificationTransaction)other).getTxnCode());
          setDescription(((AlternaVerificationTransaction)other).getDescription());
        }
      `
    },
  ]
});
