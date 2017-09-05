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
      var self = this;
      var transaction = null;

//      return self.transactionDAO.find(transactionId).then(function (transaction) {
//      });

      var msgId = foam.uuid.randomGUID().replace(/-/g, '');
      var message = this.Pacs00800106.create({
        FIToFICstmrCdtTrf: {
          GrpHdr: {
            MsgId: msgId,
            CreDtTm: new Date(),
            NbOfTxs: 1,
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
          CdtTrfTxInf: [
            {
              PmtId: {
                TxId: msgId
              },
              IntrBkSttlmAmt: 0.0,
              IntrBkSttlmDt: new Date(),
              InstdAmt: 0.0,
              XchgRate: 0.0,
              ChrgBr: net.nanopay.iso20022.ChargeBearerType1Code.SHAR,
              ChrgsInf: [],
              IntrmyAgt1: {
                // agent details
              },
              IntrmyAgt2: {
                // agent details
              },
              Dbtr: {
                // entity details
                Nm: 'Mach Engineering',
                PstlAdr: {
                  AdrTp: net.nanopay.iso20022.AddressType2Code.ADDR,
                  StrtNm: '123 Avenue',
                  PstCd: 'M2G1K9',
                  TwnNm: 'Toronto',
                  CtrySubDvsn: 'Ontario',
                  Ctry: 'Canada'
                },
                Id: {
                  OrgId: {
                  }
                },
                CtctDtls: {
                  PhneNb: '+1 (907)-787-2493',
                  EmailAdr: 'smitham.cristina@beahan.ca',
                }
              },
              DbtrAcct: {
                // entity account
              },
              DbtrAgt: {
                // agent details
              },
              CdtrAgt: {
                // agent details
              },
              Cdtr: {
                // entity details
                Nm: '360 Design',
                PstlAdr: {
                  AdrLine: [
                    '3/1, West Patel Nagar, New Delhi, Delhi 110008, India'
                  ]
                },
                Id: {
                  OrgId: {
                  }
                },
                CtctDtls: {
                  PhneNb: '+91 11 2588 8257',
                  EmailAdr: 'haylee_kautzer@gmail.com'
                }
              },
              CdtrAcct: {
                // entity account
                Id: {
                  Othr: {
                    Id: '12345678910112345',
                  }
                },
                Tp: {
                },
                Ccy: 'INR',
                Nm: '360 Design'
              },
            }
          ],
        }
      });

      return message;
    }
  }
});