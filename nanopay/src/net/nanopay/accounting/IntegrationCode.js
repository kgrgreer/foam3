foam.ENUM({
  package: 'net.nanopay.accounting',
  name: 'IntegrationCode',

  documentation: 'Status on compliance',

  values: [
    { name: 'NONE',       label: 'None' },
    { name: 'XERO',       label: 'Xero' },
    { name: 'QUICKBOOKS', label: 'Quickbooks' }
  ]
});
