foam.CLASS({
  package: 'net.nanopay.interac',
  name: 'Iso20022',

  requires: [
    'net.nanopay.iso20022.Pacs00800106'
  ],

  constants: {
    GENERATE_PACS008_MESSAGE: function () {
      var message = this.Pacs00800106.create({
        FIToFICstmrCdtTrf: {
          GrpHdr: {},
          CdtTrfTxInf: {},
        }
      });

      return message;
    }
  }
});