foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'ErrorTransaction',
  extends: 'net.nanopay.tx.model.Transaction',
  swiftImplements: ['Error'],

  javaImports: [
    'net.nanopay.tx.model.TransactionStatus'
  ],

  properties: [
    {
      name: 'status',
      value: 'FAILED',
      javaFactory: `
        return net.nanopay.tx.model.TransactionStatus.FAILED;
      `
    },
    {
      name: 'errorMessage',
      class: 'String',
      visibility: 'RO',
      javaFactory: `
        if ( getException() != null ) {
          Exception e = (Exception) getException();
          return e.getMessage();
        }
        return null;
      `
    },
    {
      name: 'exception',
      class: 'Object',
      visibility: 'RO',
      // TODO: js detail view - sbow stack trace.
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.tx.model.Transaction',
      name: 'errorTransaction',
      visibility: 'RO'
    }
  ],
  methods: [
    {
      name: 'toString',
      javaType: 'String',
      javaCode: `
        StringBuilder sb = new StringBuilder();
        sb.append(this.getClass().getSimpleName());
        sb.append("(");
        sb.append("status: ");
        sb.append(getStatus());
        sb.append(",");
        sb.append("message: ");
        sb.append(getErrorMessage());
        if ( getErrorTransaction() != null ) {
          sb.append(",");
          sb.append("errorTransaction: ");
          sb.append(getErrorTransaction().toString());
        }
        sb.append(")");
        return sb.toString();
      `
    }
  ]
});
