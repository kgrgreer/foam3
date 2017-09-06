foam.CLASS({
  package: 'net.nanopay.interac',
  name: 'Iso20022',

  requires: [
    'net.nanopay.iso20022.Pacs00800106'
  ],

  imports: [
    'userDAO',
    'transactionDAO'
  ],

  constants: {
    GENERATE_PACS008_MESSAGE: function (transactionId) {
      var self = this;

      var transaction = null;
      var payer = null;
      var payee = null;
      var groupHeader = null;
      var transactionInfo = {};
      var transactions = [];

      var msgId = foam.uuid.randomGUID().replace(/-/g, '');
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

        transactionInfo = {
          PmtId: {
            EndToEndId: transaction.referenceNumber,
            TxId: msgId,
            ClrSysRef: '123'
          },
          IntrBkSttlmAmt: {
            Ccy: 'INR',
            xmlValue: transaction.total
          },
          IntrBkSttlmDt: transaction.date,
          InstdAmt: {
            Ccy: 'CAD',
            xmlValue: transaction.total
          },
          XchgRate: transaction.rate,
          ChrgBr: net.nanopay.iso20022.ChargeBearerType1Code.SHAR,
          ChrgsInf: [
            {
              Amt: {
                Ccy: 'CAD',
                xmlValue: 0.80
              },
              Agt: {
                FinInstnId: {
                  Nm: 'ICICI Bank Canada',
                  ClrSysMmbId: {
                    ClrSysId: {
                      Cd: 'CACPA'
                    },
                    MmbId: '340'
                  },
                  PstlAdr: {
                    AdrTp: 'ADDR',
                    StrtNm: 'King St W, Suite 2130',
                    BldgNb: '130',
                    PstCd: 'M5X1B1',
                    TwnNm: 'Toronto',
                    CtrySubDvsn: 'Ontario',
                    Ctry: 'CA'
                  }
                },
                BrnchId: {
                  Id: '10002'
                }
              }
            },
            {
              Amt: {
                Ccy: 'CAD',
                xmlValue: 0.70
              },
              Agt: {
                FinInstnId: {
                  Nm: 'TD Bank',
                  ClrSysMmbId: {
                    ClrSysId: {
                      Cd: 'CACPA'
                    },
                    MmbId: '004'
                  },
                  PstlAdr: {
                    AdrTp: 'ADDR',
                    StrtNm: 'King St W',
                    BldgNb: '55',
                    PstCd: 'M5K1A2',
                    TwnNm: 'Toronto',
                    CtrySubDvsn: 'Ontario',
                    Ctry: 'CA'
                  }
                },
                BrnchId: {
                  Id: '10202'
                }
              }
            }
          ]
        }

        transactions.push(transactionInfo);

        return self.Pacs00800106.create({
          FIToFICstmrCdtTrf: {
            GrpHdr: groupHeader,
            CdtTrfTxInf: transactions
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