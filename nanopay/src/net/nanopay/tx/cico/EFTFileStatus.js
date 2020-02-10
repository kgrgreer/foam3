foam.ENUM({
  package: 'net.nanopay.tx.cico',
  name: 'EFTFileStatus',

  documentation: 'Status for EFT/AFT file. Purpose of the status is tom indicate the state of EFT/AFT files. ',

  values: [
    {
      name: 'GENERATED',
      label: 'Generated',
      documentation: 'EFT/AFT File has been generated and ready for sending out.',
      ordinal: 0
    },
    {
      name: 'SENT',
      label: 'Sent',
      documentation: 'EFT/AFT File has been sent out successfully.',
      ordinal: 1
    },
    {
      name: 'ACCEPTED',
      label: 'Accepted',
      documentation: 'EFT/AFT File was accepted and valid.',
      ordinal: 2
    },
    {
      name: 'FAILED',
      label: 'Failed',
      documentation: 'EFT/AFT File failed while sending out.',
      ordinal: 3
    },
    {
      name: 'REJECTED',
      label: 'Rejected',
      documentation: 'EFT/AFT File was rejected or not accepted.',
      ordinal: 4
    },
  ]
});
