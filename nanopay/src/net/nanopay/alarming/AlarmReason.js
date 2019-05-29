foam.ENUM({
  package: 'net.nanopay.alarming',
  name: 'AlarmReason',

  values: [
    { name: 'NONE', label: ' No alarm' },
    { name: 'MISSING_PAIR', label: 'No responses receieved for sent requests'},
    { name: 'SEND_RECEIVE_MISMATCH', label: 'More sends then recieves' },
    { name: 'TIMEOUT', label: 'A request timed out' },
  ]
});
