foam.CLASS({
  package: 'net.nanopay.payment',
  name: 'Payroll',
  documentation: 'Payroll model.',

  javaImports: [
    'java.util.Calendar',
    'java.util.Formatter'
  ],

  properties: [
    {
      class: 'Long',
      name: 'id'
    },
    {
      class: 'String',
      name: 'timePeriod',
      javaFactory: `
      Formatter fmt = new Formatter();
      Calendar cal = Calendar.getInstance();
      return fmt.format("%tB", cal) + " " + cal.get(Calendar.YEAR);
       `
    },
    {
      class: 'String',
      name: 'note',
      javaFactory: `
     Formatter fmt = new Formatter();
     Calendar cal = Calendar.getInstance();
     return "nanopay " + getTimePeriod() + " Payroll";
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
      name: 'sourceAccount'
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
      class: 'String',
      name: 'executedBy'
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
