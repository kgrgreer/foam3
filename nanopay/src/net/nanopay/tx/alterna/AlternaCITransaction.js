foam.CLASS({
  package: 'net.nanopay.tx.alterna',
  name: 'AlternaCITransaction',
  extends: 'net.nanopay.tx.cico.CITransaction',

  javaImports: [
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.account.Account',
    'net.nanopay.account.TrustAccount',
    'net.nanopay.tx.model.TransactionStatus',
    'net.nanopay.tx.Transfer',
    'java.util.Arrays',
    'foam.dao.DAO',
    'net.nanopay.bank.BankAccount',
    'net.nanopay.bank.BankAccountStatus',
    'foam.util.SafetyUtil'
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
      value: 'ATB',
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
        setConfirmationLineNumber(((AlternaCITransaction)other).getConfirmationLineNumber());
        setReturnCode(((AlternaCITransaction)other).getReturnCode());
        setReturnDate(((AlternaCITransaction)other).getReturnDate());
        setReturnType(((AlternaCITransaction)other).getReturnType());
        setPadType(((AlternaCITransaction)other).getPadType());
        setTxnCode(((AlternaCITransaction)other).getTxnCode());
        setDescription(((AlternaCITransaction)other).getDescription());
      `
    },
    {
      name: 'isActive',
      type: 'Boolean',
      javaCode: `
         return
           getStatus().equals(TransactionStatus.COMPLETED);
      `
    },

  ]
});
