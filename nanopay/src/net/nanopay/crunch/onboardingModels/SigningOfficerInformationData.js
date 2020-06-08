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
  package: 'net.nanopay.crunch.onboardingModels',
  name: 'SigningOfficerInformationData',

  implements: [ 
    'foam.core.Validatable'
  ],

  imports: [
    'subject'
  ],

  messages: [
    { name: 'INVALID_SO_DATA', message: 'One or more fields of the Signing Officer Data is not valid.' }
  ],

  properties: [
    {
      name: 'soPersonalData',
      label: 'Signing Officer Personal Information',
      class: 'FObjectProperty',
      of: 'net.nanopay.crunch.onboardingModels.SigningOfficerPersonalData',
      view: { class: 'foam.u2.detail.VerticalDetailView' },
      storageTransient: true,
      factory: function() {
        return net.nanopay.crunch.onboardingModels.SigningOfficerPersonalData.create({ countryId: this.countryId }, this);
      },
      validationPredicates: [
        {
          args: [ 'soPersonalData' ],
          predicateFactory: function(e) {
            return e.AND(
              e.EQ(foam.mlang.IsValid.create({
                arg1: net.nanopay.crunch.onboardingModels.SigningOfficerInformationData.SO_PERSONAL_DATA
              }), true),
              e.NEQ(net.nanopay.crunch.onboardingModels.SigningOfficerInformationData.SO_PERSONAL_DATA, null)
            );
          },
          errorMessage: 'INVALID_SO_DATA'
        }
      ]
    },
    {
      name: 'countryId',
      class: 'Reference',
      of: 'foam.nanos.auth.Country',
      transient: true,
      hidden: true,
      factory: function() {
        var userCountry = this.subject.user && this.subject.user.address ? this.subject.user.address.countryId : null;
        return userCountry;
      }
    }
  ],

  methods: [
    {
      name: 'validate',
      javaCode: `
        java.util.List<foam.core.PropertyInfo> props = getClassInfo().getAxiomsByClass(foam.core.PropertyInfo.class);
        for ( foam.core.PropertyInfo prop : props ) {
          try {
            prop.validateObj(x, this);
          } catch ( IllegalStateException e ) {
            throw e;
          }
        }
      `
    }
  ]
});
