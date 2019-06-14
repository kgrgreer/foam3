foam.ENUM({
  package: 'net.nanopay.alarming',
  name: 'AlarmReason',

  values: [
    { name: 'NONE', label: ' No alarm' },
    { name: 'CONGESTION', label: 'Congestion' },
    { name: 'CREDENTIALS', label: 'Invalid credentials' },
    { name: 'TIMEOUT', label: 'A request timed out' },
    { name: 'MANUAL', label: 'Manually started alarm' },
  ]
});
