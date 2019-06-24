foam.ENUM({
  package: 'net.nanopay.meter.reports',
  name: 'DateColumnOfReports',

  documentation: 'Date column for operational reports',

  values: [
    { name: 'DAILY',         label: 'Daily' },
    { name: 'YESTERDAY',     label: 'Yesterday' },
    { name: 'WEEKLY',        label: 'Weekly' },
    { name: 'MONTH_TO_DATE', label: 'Month to Date' },
    { name: 'LAST_MONTH',    label: 'Last Month' },
    { name: 'YEAR_TO_DATE',  label: 'Year to Date' },
    { name: 'TOTAL',         label: 'Total' }
  ]
});
