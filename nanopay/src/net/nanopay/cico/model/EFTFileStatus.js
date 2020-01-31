foam.ENUM({
  package: 'net.nanopay.cico.model',
  name: 'EFTFileStatus',

  documentation: 'Status for EFT/AFT file. Purpose of the status is tom indicate the state of EFT/AFT files. ',

  values: [
    {
      name: 'PENDING',
      label: 'Pending',
      documentation: 'EFT/AFT File has not been picked for sending out.',
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
  ]
});
