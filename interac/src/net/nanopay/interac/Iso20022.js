foam.CLASS({
  package: 'net.nanopay.interac',
  name: 'Iso20022',

  implements: [
    'foam.mlang.Expressions'
  ],

  requires: [
    'net.nanopay.interac.model.Identification',
    'net.nanopay.interac.model.DateAndPlaceOfBirth',
    'net.nanopay.iso20022.Pacs00800106',
    'net.nanopay.iso20022.CashAccount24',
    'net.nanopay.iso20022.PostalAddress6',
    'net.nanopay.iso20022.PartyIdentification43',
    'net.nanopay.iso20022.PersonIdentification5',
    'net.nanopay.iso20022.OrganisationIdentification8',
    'net.nanopay.iso20022.GenericOrganisationIdentification1',
    'net.nanopay.iso20022.BranchAndFinancialInstitutionIdentification5'
  ],

  imports: [
    'userDAO',
    'transactionDAO',
    'identificationDAO',
    'dateAndPlaceOfBirthDAO',
  ],

  constants: {
    GENERATE_POSTAL_ADDRESS: function (address) {
      return this.PostalAddress6.create({
        AdrTp: net.nanopay.iso20022.AddressType2Code.ADDR,
        StrtNm: address.address,
        TwnNm: address.city,
        CtrySubDvsn: address.regionId,
        Ctry: address.countryId
      });
    },

    GENERATE_AGENT_DETAILS: function (agent) {
      var agentDetails = this.BranchAndFinancialInstitutionIdentification5.create({
        FinInstnId: {
          ClrSysMmbId: {
            ClrSysId: {
              // TODO: determine code based on country
              Cd: ''
            },
            // TODO: determine whether to use FI ID or IFSC Code
            MbmId: ''
          },
          Nm: '',
          // PstlAdr: this.GENERATE_POSTAL_ADDRESS(null)
        }
      });

      // TODO: add BranchIdentification if Canadian agent

      return agentDetails;
    },

    GENERATE_ENTITY_ACCOUNT: function (user) {
      return this.CashAccount24.create({
        Id: {
          Othr: {
            Id: '123123'
          }
        },
        Ccy: 'CAD',
        // TODO: change to business name if not a business
        Nm: user.firstName + ' ' + user.lastName
      });
    },

    GENERATE_ENTITY_DETAILS: function (user, identification, birthplace) {
      var self = this;

      var entityDetails = this.PartyIdentification43.create({
        Nm: user.firstName + ' ' + user.lastName,
        PstlAdr: this.GENERATE_POSTAL_ADDRESS(user.address),
        CtctDtls: {
          PhneNb: user.phone,
          EmailAdr: user.email
        }
      });

      // transform identification variable into pacs008 format
      identification = identification.map(function (id) {
        return {
          Id: id.identifier,
          SchmeNm: {
            Cd: id.code
          },
          Issr: id.issuer
        }
      })

      if ( user.type === 'Business' ) {
        // TODO: model organisation identification
        entityDetails.Id = {
          OrgId: {
            Othr: identification
          }
        };
      } else {
        entityDetails.Id = {
          PrvtId: {
            DtAndPlcOfBirth: {
              // BirthDt: new Date(birthplace.birthday),
              CityOfBirth: birthplace.birthplace.city,
              CtryOfBirth: birthplace.birthplace.countryId
            },
            Othr: identification
          }
        };
      }

      return entityDetails;
    },

    GENERATE_PACS008_MESSAGE: function (transactionId) {
      var self = this;

      var transaction = null;

      var payer = null;
      var payerIdentification = null;
      var payerBirthPlace = null;

      var payee = null;
      var payeeIdentification = null;
      var payeeBirthPlace = null;

      return self.transactionDAO.find(transactionId).then(function (result) {
        if ( ! result )
          throw new Error('Transaction not found');

        transaction = result;

        // get payer information
        return Promise.all([
          self.userDAO.find(transaction.payerId),
          self.identificationDAO.where(self.EQ(self.Identification.OWNER, transaction.payerId)).select(),
          self.dateAndPlaceOfBirthDAO.where(self.EQ(self.DateAndPlaceOfBirth.USER, transaction.payerId)).limit(1).select()
        ]);
      })
      .then(function (result) {
        if ( ! result )
          throw new Error('Payer not found');

        payer = result[0];
        payerIdentification = result[1].array;
        payerBirthPlace = result[2].array[0];

        // get payee information
        return Promise.all([
          self.userDAO.find(transaction.payeeId),
          self.identificationDAO.where(self.EQ(self.Identification.OWNER, transaction.payeeId)).select(),
          self.dateAndPlaceOfBirthDAO.where(self.EQ(self.DateAndPlaceOfBirth.USER, transaction.payeeId)).limit(1).select()
        ])
      })
      .then(function (result) {
        if ( ! result ) throw new Error('Payee not found');

        payee = result[0];
        payeeIdentification = result[1].array;
        payeeBirthPlace = result[2].array[0];

        var msgId = foam.uuid.randomGUID().replace(/-/g, '');
        return self.Pacs00800106.create({
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
                  xmlValue: transaction.receivingAmount
                },
                IntrBkSttlmDt: transaction.date,
                InstdAmt: {
                  // TODO: remove hardcoded CAD
                  Ccy: 'CAD',
                  xmlValue: transaction.amount
                },
                XchgRate: transaction.rate,
                ChrgBr: net.nanopay.iso20022.ChargeBearerType1Code.SHAR,
                ChrgsInf: [], // TODO populate fees
                // TODO: populate IntrmyAgt1 & 2
                Dbtr: self.GENERATE_ENTITY_DETAILS(payer, payerIdentification, payerBirthPlace),
                DbtrAcct: self.GENERATE_ENTITY_ACCOUNT(payer),
                DbtrAgt: self.GENERATE_AGENT_DETAILS(null),
                Cdtr: self.GENERATE_ENTITY_DETAILS(payee, payeeIdentification, payeeBirthPlace),
                CdtrAcct: self.GENERATE_ENTITY_ACCOUNT(payee),
                CdtrAgt: self.GENERATE_AGENT_DETAILS(null)
              }
            ]
          }
        });
      });
    }
  }
});