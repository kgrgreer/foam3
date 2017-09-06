foam.CLASS({
  package: 'net.nanopay.interac',
  name: 'Iso20022',

  requires: [
    'net.nanopay.iso20022.Pacs00800106',
    'net.nanopay.iso20022.PartyIdentification43'
  ],

  imports: [
    'userDAO',
    'transactionDAO'
  ],

  constants: {
    GENERATE_ENTITY_DETAILS: function (user) {
      return this.PartyIdentification43.create({
        Nm: user.firstName + ' ' + user.lastName,
        PstlAdr: {
          AdrTp: net.nanopay.iso20022.AddressType2Code.ADDR,
          // TODO: fill in address information
        },
        Id: {
          // TODO: fill in identification based on user type (user vs business)
        },
        CtctDtls: {
          PhneNb: user.phone,
          EmailAdr: user.email
        }
      });
    },

    GENERATE_PACS008_MESSAGE: function (transactionId) {
      var self = this;

      var transaction = null;
      var payer = null;
      var payee = null;
      var groupHeader = null;
      var transactionInfo = {};
      var transactions = [];

      var message = this.Pacs00800106.create({
        FIToFICstmrCdtTrf: {
          GrpHdr: {

          },
          CdtTrfTxInf: []
        }
      });

      return self.transactionDAO.find(transactionId).then(function (result) {
        if ( ! result ) throw new Error('Transaction not found');
        transaction = result;

        groupHeader = {
          MsgId: msgId,
          CreDtTm: transaction.date,
          NbOfTxs: 1,
          CtrlSum: transaction.total,
          SttlmInf: {
            SttlmMtd: net.nanopay.iso20022.SettlementMethod1Code.CLRG,
            ClrSys: {
              Prtry: 'NPAY'
            }
          },
          PmtTpInf: {
            InstrPrty: net.nanopay.iso20022.Priority2Code.NORM,
            LclInstrm: {
              Prtry: 'IMPS'
            }
          }
        }

        return self.userDAO.find(transaction.payerId);
      })
      .then(function (result) {
        if ( ! result ) throw new Error('Payer not found');
        payer = null;
        return self.userDAO.find(transaction.payeeId);
      })
      .then(function (result) {
        if ( ! result ) throw new Error('Payee not found');
        payee = null;

        var msgId = foam.uuid.randomGUID().replace(/-/g, '');
        return this.Pacs00800106.create({
          FIToFICstmrCdtTrf: {
            GrpHdr: {
              MsgId: msgId,
              CreDtTm: transaction.date,
              NbOfTxs: 1,
              CtrlSum: transaction.total,
              SttlmInf: {
                SttlmMtd: net.nanopay.iso20022.SettlementMethod1Code.CLRG,
                ClrSys: {
                  Prtry: 'NPAY'
                }
              },
              PmtTpInf: {
                InstrPrty: net.nanopay.iso20022.Priority2Code.NORM,
                LclInstrm: {
                  Prtry: 'IMPS'
                }
              }
            },
            CdtTrfTxInf: [
              {
                PmtId: {
                  EndToEndId: transaction.referenceNumber,
                  TxId: msgId
                  // TODO: populate ClrSysRef
                },
                IntrBkSttlmAmt: {
                  // TODO: populate IntrBkSttlmAmt with real values and remove hard coded INR
                  Ccy: 'INR',
                  xmlValue: transaction.total
                },
                IntrBkSttlmDt: transaction.date,
                InstdAmt: {
                  // TODO: remove hardcoded CAD
                  Ccy: 'CAD',
                  xmlValue: transaction.total
                },
                XchgRate: transaction.rate,
                ChrgBr: net.nanopay.iso20022.ChargeBearerType1Code.SHAR,
                ChrgsInf: [], // TODO populate fees
                // TODO: populate IntrmyAgt1 & 2
                Dbtr: this.GENERATE_ENTITY_DETAILS(payer),
                // TODO: populate DbtrAcct and DbtrAgt
                Cdtr: self.GENERATE_ENTITY_DETAILS(payee),
                // TODO: populate CdtrAcct and CdtrAgt

              }
            ]
          }
        });
      })
      .catch(function (err) {
        return null;
      })

//      // fetch transaction
//      return self.transactionDAO.find(transactionId).then(function (result) {
//        if ( ! result ) return null;
//        transaction = result;
//        // fetch payer
//        return self.userDAO.find(transaction.payerId);
//      })
//      .then(function (result) {
//        if ( ! result ) return null;
//        payer = result;
//        // fetch payee
//        return self.userDAO.find(transaction.payeeId);
//      })
//      .then(function (result) {
//        if ( ! result ) return null;
//        payee = result;
//
//
//      })
//      .catch(function (err) {
//        console.log('err =', err);
//        return null;
//      });

//      var msgId = foam.uuid.randomGUID().replace(/-/g, '');
//      var message = this.Pacs00800106.create({
//        FIToFICstmrCdtTrf: {
//          GrpHdr: {
//            MsgId: msgId,
//            CreDtTm: new Date(),
//            NbOfTxs: 1,
//            CtrlSum: 0.0,
//          },
//          CdtTrfTxInf: [
//            {
//              PmtId: {
//                TxId: msgId
//              },
//              IntrBkSttlmAmt: 0.0,
//              IntrBkSttlmDt: new Date(),
//              InstdAmt: 0.0,
//              XchgRate: 0.0,
//              ChrgBr: net.nanopay.iso20022.ChargeBearerType1Code.SHAR,
//              ChrgsInf: [],
//              IntrmyAgt1: {
//                // agent details
//              },
//              IntrmyAgt2: {
//                // agent details
//              },
//              Dbtr: {
//                // entity details
//                Nm: 'Mach Engineering',
//                PstlAdr: {
//                  AdrTp: net.nanopay.iso20022.AddressType2Code.ADDR,
//                  StrtNm: '123 Avenue',
//                  PstCd: 'M2G1K9',
//                  TwnNm: 'Toronto',
//                  CtrySubDvsn: 'Ontario',
//                  Ctry: 'Canada'
//                },
//                Id: {
//                  OrgId: {
//                  }
//                },
//                CtctDtls: {
//                  PhneNb: '+1 (907)-787-2493',
//                  EmailAdr: 'smitham.cristina@beahan.ca',
//                }
//              },
//              DbtrAcct: {
//                // entity account
//              },
//              DbtrAgt: {
//                // agent details
//              },
//              CdtrAgt: {
//                // agent details
//              },
//              Cdtr: {
//                // entity details
//                Nm: '360 Design',
//                PstlAdr: {
//                  AdrLine: [
//                    '3/1, West Patel Nagar, New Delhi, Delhi 110008, India'
//                  ]
//                },
//                Id: {
//                  OrgId: {
//                  }
//                },
//                CtctDtls: {
//                  PhneNb: '+91 11 2588 8257',
//                  EmailAdr: 'haylee_kautzer@gmail.com'
//                }
//              },
//              CdtrAcct: {
//                // entity account
//                Id: {
//                  Othr: {
//                    Id: '12345678910112345',
//                  }
//                },
//                Tp: {
//                },
//                Ccy: 'INR',
//                Nm: '360 Design'
//              },
//            }
//          ],
//        }
//      });
//
//      return message;
    }
  }
});