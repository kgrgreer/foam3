foam.CLASS({
  package: 'net.nanopay.interac',
  name: 'Iso20022',

  requires: [
    'net.nanopay.iso20022.Pacs00800106',
    'net.nanopay.iso20022.CashAccount24',
    'net.nanopay.iso20022.PartyIdentification43',
    'net.nanopay.iso20022.BranchAndFinancialInstitutionIdentification5'
  ],

  imports: [
    'userDAO',
    'transactionDAO'
  ],

  constants: {
    GENERATE_AGENT_DETAILS: function (agent) {
      return this.BranchAndFinancialInstitutionIdentification5.create({

      });
    },

    GENERATE_ENTITY_ACCOUNT: function (user) {
      return this.CashAccount24.create({
        Id: {
          Othr: {
            Id: '123123'
          }
        },
        Ccy: 'CAD',
        Nm: 'Mac Engineering'
      });
    },

    GENERATE_ENTITY_DETAILS: function (user) {
      var entityDetails = this.PartyIdentification43.create({
        Nm: user.firstName + ' ' + user.lastName,
        PstlAdr: {
          AdrTp: net.nanopay.iso20022.AddressType2Code.ADDR,
          StrtNm: user.address.address,
          TwnNm: user.address.city,

          // TODO: fill in address information
        },
        CtctDtls: {
          PhneNb: user.phone,
          EmailAdr: user.email
        }
      });

      if ( user.type === 'Business' ) {
        entityDetails.Id.OrgId = {

        }
      } else {

      }

      return entityDetails;
    },

    GENERATE_PACS008_MESSAGE: function (transactionId) {
      var self = this;

      var transaction = null;
      var payer = null;
      var payee = null;

      return self.transactionDAO.find(transactionId).then(function (result) {
        if ( ! result ) throw new Error('Transaction not found');
        transaction = result;
        return self.userDAO.find(transaction.payerId);
      })
      .then(function (result) {
        if ( ! result ) throw new Error('Payer not found');
        payer = result;
        return self.userDAO.find(transaction.payeeId);
      })
      .then(function (result) {
        if ( ! result ) throw new Error('Payee not found');
        payee = result;

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
                  TxId: msgId,
                  ClrSysRef: Math.floor(Math.random() * (999999 - 1 + 1)) + 1
                },
                IntrBkSttlmAmt: {
                  // TODO: remove hardcoded INR
                  Ccy: 'INR',
                  // TODO: populate IntrBkSttlmAmt with real value
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
      });
    }
  }
});