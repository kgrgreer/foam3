foam.ENUM({
  package: 'net.nanopay.tx.loan',
  name: 'LoanFrequency',

  documentation: 'Frequency of loan payments.',

  values: [
    { name: 'DAILY',           label: 'Daily' },
    { name: 'WEEKLY',          label: 'Weekly' },
    { name: 'MONTHLY',         label: 'Monthly' },
    { name: 'YEARLY',          label: 'Yearly' }
  ]
});
