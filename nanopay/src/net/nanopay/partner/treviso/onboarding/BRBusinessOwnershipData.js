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
  package: 'net.nanopay.partner.treviso.onboarding',
  name: 'BRBusinessOwnershipData',
  extends: 'net.nanopay.crunch.onboardingModels.BusinessOwnershipData',
  documentation: `
    This model represents the detailed information of a Business Ownership.
    This model is the Brazil extension of the generic BusinessOwnershipData model.
  `,

  imports: [
    'businessEmployeeDAO',
    'crunchService',
    'ctrl',
    'signingOfficerJunctionDAO',
    'subject'
  ],

  javaImports: [
    'net.nanopay.partner.treviso.onboarding.BRBeneficialOwner',
    'java.util.stream.Collectors',
    'java.util.Set',
    'java.util.List'
  ],

  messages: [
    { name: 'SIGNINGOFFICER_DATA_FETCHING_ERR', message: 'Failed to find this signing officer info' }
  ],

  sections: [
    {
      name: 'ownershipAmountSection',
      title: 'Enter the number of people who own 25% or more of the business either directly or indirectly.',
      navTitle: 'Number of owners',
      help: `In accordance with banking laws, we need to document the percentage of ownership of any individual with a 25% + stake in the company.
      Please have owner address and date of birth ready.`,
    },
    {
      class: 'net.nanopay.crunch.onboardingModels.OwnerSection',
      index: 1,
      isAvailable: function(amountOfOwners) {
        return amountOfOwners >= 1;
      }
    },
    {
      class: 'net.nanopay.crunch.onboardingModels.OwnerSection',
      index: 2,
      isAvailable: function(amountOfOwners) {
        return amountOfOwners >= 2;
      }
    },
    {
      class: 'net.nanopay.crunch.onboardingModels.OwnerSection',
      index: 3,
      isAvailable: function(amountOfOwners) {
        return amountOfOwners >= 3;
      }
    },
    {
      class: 'net.nanopay.crunch.onboardingModels.OwnerSection',
      index: 4,
      isAvailable: function(amountOfOwners) {
        return amountOfOwners >= 4;
      }
    },
    {
      name: 'reviewOwnersSection',
      title: 'Review the list of owners',
      isAvailable: function(amountOfOwners) {
        return amountOfOwners > 0;
      }
    }
  ],

  properties: [
    {
      name: 'amountOfOwners',
      view: {
        class: 'foam.u2.view.RadioView',
        choices: [
          0, 1, 2, 3, 4
        ],
        isHorizontal: true
      },
      validationPredicates: [
        {
          args: ['amountOfOwners'],
          predicateFactory: function(e) {
            return e.AND(
              e.GTE(net.nanopay.partner.treviso.onboarding
                .BRBusinessOwnershipData.AMOUNT_OF_OWNERS, 0),
              e.LTE(net.nanopay.partner.treviso.onboarding
                .BRBusinessOwnershipData.AMOUNT_OF_OWNERS, 4)
            );
          },
          errorMessage: 'NO_AMOUNT_OF_OWNERS_SELECTED_ERROR'
        }
      ]
    },
    {
      name: 'soUsersDAO',
      factory: function() {
        var self = this;
        var x = this.ctrl.__subContext__;
        var adao = foam.dao.ArrayDAO.create({
          of: net.nanopay.partner.treviso.onboarding.BRBeneficialOwner
        });
        var pdao = foam.dao.PromisedDAO.create({
          of: net.nanopay.partner.treviso.onboarding.BRBeneficialOwner
        });

        // function in sink
        var sinkFn = so => {
          var obj = net.nanopay.partner.treviso.onboarding.BRBeneficialOwner.create(
            {
              id: ++self.index,
              firstName: so.firstName,
              lastName: so.lastName,
              jobTitle: so.jobTitle,
              business: this.subject.user.id,
              address: so.address,
              birthday: so.birthday,
              mode: 'percent',
              email: so.email,
              cpf: cpf,
              cpfName: cpfName,
              verifyName: verifyName,
              hasSignedContratosDeCambio: hasSignedContratosDeCambio,
              documentsOfAddress: documentsOfAddress,
              documentsOfId: documentsOfId,
              PEPHIORelated: pepHioRelated
            }, x);
            adao.put(obj);
        };

        // set the hidden properties from capabilities
        var hasSignedContratosDeCambio, pepHioRelated;
        var cpf, verifyName, cpfName;
        var documentsOfId = foam.nanos.fs.FileArray.create();
        var documentsOfAddress = foam.nanos.fs.FileArray.create();
        
        Promise.all([
          this.crunchService.getJunction(x, 'fb7d3ca2-62f2-4caf-a84c-860392e4676b'),
          this.crunchService.getJunction(x, '777af38a-8225-87c8-dfdf-eeb15f71215f-123'),
          this.crunchService.getJunction(x, '8ad3c898-db32-11ea-87d0-0242ac130003')
        ]).then(values => {
          let cpf  = values[0] ? values[0].data : '';
          let so   = values[1] ? values[1].data : '';
          let doc1 = values[2] ? values[2].data : '';

          if ( values[0].status == foam.nanos.crunch.CapabilityJunctionStatus.GRANTED && cpf ) {
            verifyName = cpf.verifyName;
            cpfName = cpf.cpfName;
          }
          if ( values[1].status == foam.nanos.crunch.CapabilityJunctionStatus.GRANTED && so ) {
            hasSignedContratosDeCambio = so.hasSignedContratosDeCambio;
            pepHioRelated = so.PEPHIORelated;
          }
          if ( values[2].status == foam.nanos.crunch.CapabilityJunctionStatus.GRANTED && doc1 ) {
            // Treviso removed the requirement for the address doc
            // todo confirm the logic of duplicationg doc setting to both these requirements
            documentsOfAddress = doc1.documents;
            documentsOfId = doc1.documents;
          }

          // POPULATE DAO
          this.signingOfficerJunctionDAO
          .where(this.EQ(net.nanopay.model.BusinessUserJunction
            .SOURCE_ID, this.subject.user.id))
          .select(this.PROJECTION(net.nanopay.model.BusinessUserJunction
            .TARGET_ID))
          .then(sos => {
            this.businessEmployeeDAO
              .where(this.IN(foam.nanos.auth.User.ID, sos.projection))
              .select({ put: sinkFn })
              .then(() => pdao.promise.resolve(adao));
          });
        }).catch(err => {
          this.notify(this.SIGNINGOFFICER_DATA_FETCHING_ERR, '', this.LogLevel.ERROR, true);
        });

        return pdao;
      }
    },

    // Ownership Amount Section
    {
      class: 'net.nanopay.crunch.onboardingModels.OwnerProperty',
      ownerModel: 'net.nanopay.partner.treviso.onboarding.BRBeneficialOwner',
      index: 1
    },
    {
      class: 'net.nanopay.crunch.onboardingModels.OwnerProperty',
      ownerModel: 'net.nanopay.partner.treviso.onboarding.BRBeneficialOwner',
      index: 2
    },
    {
      class: 'net.nanopay.crunch.onboardingModels.OwnerProperty',
      ownerModel: 'net.nanopay.partner.treviso.onboarding.BRBeneficialOwner',
      index: 3
    },
    {
      class: 'net.nanopay.crunch.onboardingModels.OwnerProperty',
      ownerModel: 'net.nanopay.partner.treviso.onboarding.BRBeneficialOwner',
      index: 4
    },
    // Review Owners Section
    {
      name: 'beneficialOwnersTable',
      factory: function() {
        return foam.dao.EasyDAO.create({
          of: 'net.nanopay.partner.treviso.onboarding.BRBeneficialOwner',
          seqNo: true,
          daoType: 'MDAO'
        });
      },
      visibility: function(amountOfOwners) {
        return amountOfOwners > 0 ?
          foam.u2.DisplayMode.RO : foam.u2.DisplayMode.HIDDEN;
      }
    }
  ]
});
