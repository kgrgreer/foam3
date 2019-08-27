foam.CLASS({
  package: 'net.nanopay.tx.alterna',
  name: 'AlternaCOTransaction',
  extends: 'net.nanopay.tx.cico.COTransaction',

  javaImports: [
    'java.util.Arrays',
    'net.nanopay.account.Account',
    'net.nanopay.account.TrustAccount',
    'net.nanopay.tx.model.TransactionStatus',
    'net.nanopay.tx.Transfer'
  ],

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
      visibility: foam.u2.Visibility.RO
    },
    {
      name: 'institutionNumber',
      class: 'String',
      value: '842',
      visibility: 'Hidden'
    }
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
        setConfirmationLineNumber(((AlternaCOTransaction)other).getConfirmationLineNumber());
        setReturnCode(((AlternaCOTransaction)other).getReturnCode());
        setReturnDate(((AlternaCOTransaction)other).getReturnDate());
        setReturnType(((AlternaCOTransaction)other).getReturnType());
        setPadType(((AlternaCOTransaction)other).getPadType());
        setTxnCode(((AlternaCOTransaction)other).getTxnCode());
        setDescription(((AlternaCOTransaction)other).getDescription());
      `
    },
    {
      name: 'isActive',
      type: 'Boolean',
      javaCode: `
         return
           getStatus().equals(TransactionStatus.PENDING) ||
           getStatus().equals(TransactionStatus.DECLINED);
      `
    }
  ]
});
