foam.CLASS({
  package: 'net.nanopay.interac',
  name: 'Iso20022',

  requires: [
    'net.nanopay.iso20022.Pacs00800106'
  ],

  imports: [
    'transactionDAO'
  ],

  constants: {
    GENERATE_PACS008_MESSAGE: function (transactionId) {
      var message = this.Pacs00800106.create({
        FIToFICstmrCdtTrf: {
          GrpHdr: {
            MsgId: '',
            CreDtTm: new Date(),
            NbOfTxs: 0,
            CtrlSum: 0.0,
            SttlmInf: {
              SttlmMtd: net.nanopay.iso20022.SettlementMethod1Code.CLRG,
              ClrSys: {
                Prtry: 'NPAY'
              }
            },
            PmtTpInf: {
              InstrPrty: net.nanopay.iso20022.Priority2Code.NORM,
              LclInstrm: {
                Prtry: 'BOOK'
              }
            },
          },
          CdtTrfTxInf: [],
        }
      });

      return message;
    }
  }
});