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
  extends: 'net.nanopay.crunch.onboardingModels.BusinessOwnershipData2',
  documentation: `
    This model represents the detailed information of a Business Ownership.
    This model is the Brazil extension of the generic BusinessOwnershipData model.
  `,

  imports: [
    'crunchService'
  ],

  properties: [
    {
      name: 'owners',
      of: 'net.nanopay.partner.treviso.onboarding.BRBeneficialOwner'
    },
    {
      name: 'soUsersDAO',
      // TODO: there may be a better way to do this without replacing the
      //       entire factory here.
      factory: function() {
        var self = this;
        var x = this.__subContext__;
        var daoSpec = { of: this.ownerClass };
        var adao = foam.dao.ArrayDAO.create(daoSpec);
        var pdao = foam.dao.PromisedDAO.create(daoSpec);

        var capabilityValues = {};

        // function in sink
        var index = 0;
        var sinkFn = so => {
          var obj = this.ownerClass.create({
            id: ++index,
            business: this.businessId,
            mode: 'percent'
          }, x).fromUser(so);
          for ( let prop of Object.keys(capabilityValues) ) {
            obj[prop] = capabilityValues[prop];
          }
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

          if ( cpf && values[0].status == foam.nanos.crunch.CapabilityJunctionStatus.GRANTED ) {
            ['verifyName', 'cpfName'].forEach(
              name => capabilityValues[name] = cpf[name]);
          }
          if ( so && values[1].status == foam.nanos.crunch.CapabilityJunctionStatus.GRANTED ) {
            ['hasSignedContratosDeCambio', 'pepHioRelated'].forEach(
              name => capabilityValues[name] = cpf[name]);
          }
          if ( doc1 && values[2].status == foam.nanos.crunch.CapabilityJunctionStatus.GRANTED ) {
            // Treviso removed the requirement for the address doc
            // todo confirm the logic of duplicationg doc setting to both these requirements
            capabilityValues['documentsOfAddress'] = doc1.documents;
            capabilityValues['documentsOfId'] = doc1.documents;
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
  ]
});
