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
  name: 'BusinessDirectorsData',

  implements: [
    'foam.core.Validatable',
    'foam.mlang.Expressions'
  ],

  imports: [
    'businessDAO',
    'subject'
  ],

  javaImports: [
    'net.nanopay.partner.treviso.onboarding.BRBusinessDirector',
  ],

  messages: [
    { name: 'NO_DIRECTOR_INFO', message: 'Director information required' },
    { name: 'DIRECTOR_INFO_NOT_VALID', message: 'Director information is not valid' },
    { name: 'NO_DIR_NEEDED', message: 'No Business Directors required for this business type. Please proceed to next step.' }
  ],

  sections: [
    {
      name: 'directorsInfoSection',
      title: 'Director information',
      help: 'Require business director information'
    }
  ],

properties: [
    {
      name: 'needDirector',
      class: 'Boolean',
      section: 'directorsInfoSection',
      documentation: 'a hack for updating businessTypeId',
      hidden: true,
      transient: true,
      getter: function() {
        var self = this;
        this.businessDAO.find(this.subject.user.id).then((business) => {
          if ( ! business ) return;
          
          self.businessTypeId = business.businessTypeId;

          // Clear directors if directors are not required for this business type
          if ( self.businessTypeId < 4 ) {
            self.businessDirectors = [];
          }
        });
      }
    },
    {
      name: 'businessTypeId',
      class: 'Long',
      section: 'directorsInfoSection',
      hidden: true,
      storageTransient: true
    },
    {
      class: 'String',
      name: 'noDirectorsNeeded',
      section: 'directorsInfoSection',
      getter: function() {
        return this.NO_DIR_NEEDED;
      },
      visibility: function(businessTypeId, needDirector) {
        return businessTypeId < 4 ? foam.u2.DisplayMode.RO : foam.u2.DisplayMode.HIDDEN;
      }
    },
    {
      class: 'FObjectArray',
      name: 'businessDirectors',
      documentation: 'Array of business directors.',
      label: '',
      of: 'net.nanopay.partner.treviso.onboarding.BRBusinessDirector',
      section: 'directorsInfoSection',
      view: function(_, x) {
        return {
          class: 'net.nanopay.sme.onboarding.BusinessDirectorArrayView',
          mode: 'RW',
          enableAdding: true,
          enableRemoving: true,
          defaultNewItem: net.nanopay.partner.treviso.onboarding.BRBusinessDirector.create({}, x),
          name: 'director'
        };
      },
      visibility: function(businessTypeId, needDirector) {
         return businessTypeId < 4 ? foam.u2.DisplayMode.HIDDEN : foam.u2.DisplayMode.RW;
      },
      validateObj: function(businessTypeId, businessDirectors, businessDirectors$errors) {
        if ( businessTypeId < 4 ) return;
        if ( ! businessDirectors || businessDirectors.length == 0 )
          return this.NO_DIRECTOR_INFO;
        if ( businessDirectors$errors && businessDirectors$errors.length  )
          return this.DIRECTOR_INFO_NOT_VALID;
      },
      autoValidate: true,
      validationTextVisible: true,
      validationPredicates: [
        {
          args: ['businessTypeId', 'businessDirectors'],
          predicateFactory: function(e) {
            return e.OR(
              e.HAS(net.nanopay.partner.treviso.onboarding.BusinessDirectorsData.BUSINESS_DIRECTORS),
              e.AND(
                e.GT(net.nanopay.partner.treviso.onboarding.BusinessDirectorsData.BUSINESS_TYPE_ID, 0),
                e.LT(net.nanopay.partner.treviso.onboarding.BusinessDirectorsData.BUSINESS_TYPE_ID, 4),
              )
            );
          },
          errorMessage: 'NO_DIRECTOR_INFO'
        }
      ]
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

        for ( BRBusinessDirector director : getBusinessDirectors()  ) director.validate(x);
      `
    }
  ]
});
