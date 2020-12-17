/**
 * NANOPAY CONFIDENTIAL
 *
 * [2020] nanopay Corporation
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of nanopay Corporation.
 * The intellectual and technical concepts contained
 * herein are proprietary to nanopay Corporation
 * and may be covered by Canadian and Foreign Patents, patents
 * in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from nanopay Corporation.
 */

foam.CLASS({
  package: 'net.nanopay.interac',
  name: 'Iso20022',

  implements: [
    'foam.mlang.Expressions'
  ],

  requires: [
    'net.nanopay.model.BankAccount',
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
    'branchDAO',
    'bankAccountDAO',
    'invoiceDAO',
    'transactionDAO',
    'identificationDAO',
    'dateAndPlaceOfBirthDAO',
  ],

  constants: {
    GENERATE_POSTAL_ADDRESS: function (address) {
      var postalAddress = this.PostalAddress6.create({
        AdrTp: net.nanopay.iso20022.AddressType2Code.ADDR,
        TwnNm: address.city,
        CtrySubDvsn: address.regionId,
        Ctry: address.countryId
      });

      if ( ! address.buildingNumber && ! address.postalCode ) {
        // assume address field is unstructured address information
        // split address into chunks of 70 chars
        postalAddress.AdrLine = address.address.match(/.{1,70}/g).map(function (chunk) {
          return chunk;
        })
      } else {
        postalAddress.StrtNm = address.address;
        postalAddress.PstCd = address.postalCode;
        postalAddress.BldgNb = address.buildingNumber;
      }


      return postalAddress;
    },

    GENERATE_AGENT_DETAILS: function (bank) {
      var agentDetails = this.BranchAndFinancialInstitutionIdentification5.create({
        FinInstnId: {
          ClrSysMmbId: {
            ClrSysId: {
              Cd: bank.clearingSystemIdentification
            },
            MmbId: bank.memberIdentification
          },
          Nm: bank.name,
          PstlAdr: this.GENERATE_POSTAL_ADDRESS(bank.address)
        }
      });

      if ( bank.address.countryId === 'CA' ) {
        agentDetails.BrnchId = {
          Id: bank.branchId
        }
      }

      return agentDetails;
    },

    GENERATE_ENTITY_ACCOUNT: function (user, account) {
      return this.CashAccount24.create({
        Id: {
          Othr: {
            Id: account.accountNumber
          }
        },
        Ccy: account.currencyCode,
        Nm: ( user.type !== 'Business' ) ?
          user.firstName + ' ' + user.lastName :
          user.businessName
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
        entityDetails.Id = {
          OrgId: {
            AnyBIC: ( user.bankIdentificationCode ) ?
              user.bankIdentificationCode : undefined,
            Othr: identification
          }
        };
      } else {
        entityDetails.Id = {
          PrvtId: {
            DtAndPlcOfBirth: {
              BirthDt: new Date(birthplace.birthday),
              CityOfBirth: birthplace.birthplace.city,
              CtryOfBirth: birthplace.birthplace.countryId
            },
            Othr: identification
          }
        };
      }

      return entityDetails;
    },

    GENERATE_PACS008_MESSAGE: function (transaction, invoiceId) {
      if ( ! transaction )
        throw new Error('Please provide a transaction');

      var self = this;

      var invoice = null;
      var intermediaries = [];

      var payer = null;
      var payerBank = null;
      var payerAccount = null;
      var payerIdentification = null;
      var payerBirthPlace = null;

      var payee = null;
      var payeeBank = null;
      var payeeAccount = null;
      var payeeIdentification = null;
      var payeeBirthPlace = null;

      return Promise.all([ self.branchDAO.find(9), self.branchDAO.find(10) ]).then(function (result) {
        if ( ! result )
          throw new Error('Intermediaries not found');

        intermediaries = result;

        // only do a lookup if invoiceId is present
        return ( invoiceId ) ? self.invoiceDAO.find(invoiceId) : null;
      })
      .then(function (result) {
        if ( result )
          invoice = result;

        // get payer information
        return Promise.all([
          self.userDAO.find(transaction.payerId),
          self.bankAccountDAO.find(transaction.payerId),
          self.identificationDAO.where(self.EQ(self.Identification.OWNER, transaction.payerId)).select(),
          self.dateAndPlaceOfBirthDAO.where(self.EQ(self.DateAndPlaceOfBirth.USER, transaction.payerId)).limit(1).select()
        ]);
      })
      .then(function (result) {
        if ( ! result )
          throw new Error('Payer not found');

        payer = result[0];
        payerAccount = result[1];
        payerIdentification = result[2].array;
        payerBirthPlace = result[3].array[0];

        return self.branchDAO.find(payerAccount.branchId);
      })
      .then(function (result) {
        if ( ! result )
          throw new Error('Payer bank not found');

        payerBank = result;

        // get payee information
        return Promise.all([
          self.userDAO.find(transaction.payeeId),
          self.bankAccountDAO.find(transaction.payeeId),
          self.identificationDAO.where(self.EQ(self.Identification.OWNER, transaction.payeeId)).select(),
          self.dateAndPlaceOfBirthDAO.where(self.EQ(self.DateAndPlaceOfBirth.USER, transaction.payeeId)).limit(1).select()
        ])
      })
      .then(function (result) {
        if ( ! result )
          throw new Error('Payee not found');

        payee = result[0];
        payeeAccount = result[1];
        payeeIdentification = result[2].array;
        payeeBirthPlace = result[3].array[0];

        return self.branchDAO.find(payeeAccount.branchId);
      })
      .then(function (result) {
        if ( ! result )
          throw new Error('Payee bank not found');

        payeeBank = result;

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
                  Ccy: payeeAccount.currencyCode,
                  text: transaction.receivingAmount
                },
                IntrBkSttlmDt: transaction.date,
                InstdAmt: {
                  Ccy: payerAccount.currencyCode,
                  text: transaction.amount
                },
                XchgRate: transaction.rate,
                ChrgBr: net.nanopay.iso20022.ChargeBearerType1Code.SHAR,
                // TODO: removed hard coded fees post demo
                ChrgsInf: [
                  {
                    Amt: {
                      Ccy: 'CAD',
                      text: 0.80
                    },
                    Agt: self.GENERATE_AGENT_DETAILS(intermediaries[0])
                  },
                  {
                    Amt: {
                      Ccy: 'CAD',
                      text: 0.70
                    },
                    Agt: self.GENERATE_AGENT_DETAILS(payerBank)

                  }
                ],
                IntrmyAgt1: self.GENERATE_AGENT_DETAILS(intermediaries[0]),
                IntrmyAgt2: self.GENERATE_AGENT_DETAILS(intermediaries[1]),
                Dbtr: self.GENERATE_ENTITY_DETAILS(payer, payerIdentification, payerBirthPlace),
                DbtrAcct: self.GENERATE_ENTITY_ACCOUNT(payer, payerAccount),
                DbtrAgt: self.GENERATE_AGENT_DETAILS(payerBank),
                Cdtr: self.GENERATE_ENTITY_DETAILS(payee, payeeIdentification, payeeBirthPlace),
                CdtrAcct: self.GENERATE_ENTITY_ACCOUNT(payee, payeeAccount),
                CdtrAgt: self.GENERATE_AGENT_DETAILS(payeeBank),
//                 if proprietary use Cd, else use Prtry
//                Purp: transaction.purpose.proprietary ?
//                  { Cd: transaction.purpose.code } :
//                  { Prtry: transaction.purpose.code },
                // only add RltdRmtInf if invoice is present
                RltdRmtInf: ( invoice ) ? {
                  RmtId: foam.uuid.randomGUID().replace(/-/g, ''),
                  RmtLctnDtls: [
                    {
                      Mtd: 'URID',
                      ElctrncAdr: invoice.invoiceFileUrl
                    }
                  ]
                } : undefined,
                // only add RmtInf if transaction or notes are not null
                RmtInf: ( transaction.notes || invoice ) ? {
                  // only add notes if present
                  Ustrd: ( transaction.notes ) ?
                    transaction.notes.match(/.{1,140}/g).map(function (chunk) { return chunk; }) : undefined,
                  // only add invoice information if present
                  Strd: ( invoice ) ? {
                    RfrdDocInf: {
                      Tp: {
                        CdOrPrtry: {
                          Cd: 'CINV'
                        }
                      },
                      Nb: invoice.invoiceNumber,
                      RltdDt: invoice.issueDate
                    }
                  } : undefined
                } : undefined
              }
            ]
          }
        });
      });
    }
  }
});
