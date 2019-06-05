foam.CLASS({
  package: 'net.nanopay.payment',
  name: 'Payroll',
  documentation: 'Payroll model.',

  javaImports: [
    'java.util.Calendar',
    'java.util.Formatter'
  ],

  properties: [
     'timePeriod', 'executedBy',
    {
      class: 'String',
      name: 'note',
      javaFactory: `
     Formatter fmt = new Formatter();
     Calendar cal = Calendar.getInstance();
     return "nanopay " + fmt.format("%tb", cal) + " " + cal.get(Calendar.YEAR) + " Payroll";
      `
    },
    {
      class: 'String',
      name: 'group',
      value: 'payblii'
    },
    {
      class: 'String',
      name: 'spid',
      value: 'payblii.nanopay'
    },
    {
      class: 'Long',
      name: 'sourceAccount',
      value: 193
    },
    {
      class: 'String',
      name: 'company',
      value: 'nanopay'
    },
    {
      class: 'DateTime',
      name: 'executedAt'
    },
    {
      class: 'Double',
      name: 'total'
    },
    {
      class: 'FObjectArray',
      of: 'net.nanopay.payment.PayrollEntry',
      name: 'payrollEntries'
    }
  ]
  });
