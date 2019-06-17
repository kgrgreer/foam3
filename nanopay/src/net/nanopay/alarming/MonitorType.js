foam.ENUM({
  package: 'net.nanopay.alarming',
  name: 'MonitorType',

  documentation: 'Types of monitoring',

  values: [
    { name: 'CONGESTION', label: 'Congestion monitoring' },
    { name: 'CREDENTIALS', label: 'Valid credentials monitoring' },
    { name: 'OTHER', label: 'Other OM Monitoring' },
  ]
});
