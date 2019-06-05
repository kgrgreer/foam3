foam.CLASS({
  package: 'net.nanopay.payment',
  name: 'PayrollEntry',
  documentation: 'Payroll entry for a single payee',

  properties: [
    {
      class: 'Long',
      name: 'employeeId',
    },
    {
      class: 'String',
      name: 'email',
    },
    {
      class: 'String',
      name: 'firstName',
    },
    {
      class: 'String',
      name: 'lastName',
    },
    {
      class: 'String',
      name: 'institutionNo',
    },
    {
      class: 'String',
      name: 'branchId',
    },
    {
      class: 'String',
      name: 'bankAccountNo',
    },
    {
      class: 'String',
      name: 'dcaNo',
    },
    {
      class: 'String',
      name: 'transactionId',
    },
//    {
//      class: 'Long',
//      name: 'account',
//    },
    {
      class: 'Double',
      name: 'amount'
    },
    {
      class: 'foam.core.Enum',
      name: 'status',
      of: 'net.nanopay.tx.model.TransactionStatus',
      value: 'COMPLETED'
    }
  ]
});
