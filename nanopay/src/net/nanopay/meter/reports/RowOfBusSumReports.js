foam.ENUM({
  package: 'net.nanopay.meter.reports',
  name: 'RowOfBusSumReports',

  documentation: 'Type row for business summary reports',

  values: [
    { name: 'REGISTRATION',           label: 'Registration' },
    { name: 'APPLICATION_SUBMITTED',  label: 'Application Submitted' },
    { name: 'APPROVED',               label: 'Approved' },
    { name: 'ACTIVE',                 label: 'Active' },
    { name: 'DECLINED',               label: 'Declined' },
    { name: 'LOCKED',                 label: 'Locked' }
  ]
});
