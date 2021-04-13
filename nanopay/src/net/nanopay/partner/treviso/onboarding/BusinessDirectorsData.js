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
  mixins: ['foam.u2.wizard.AbstractWizardletAware'],

  implements: [
    'foam.core.Validatable',
    'foam.mlang.Expressions'
  ],

  imports: [
    'businessDAO',
    'subject'
  ],

  javaImports: [
    'net.nanopay.partner.treviso.onboarding.BRBusinessDirector'
  ],

  messages: [
    { name: 'ADD_NAME', message: 'Administrators or Legal Representatives' },
    { name: 'NO_DIRECTOR_INFO', message: 'Administrators or Legal Representatives information required' },
    { name: 'DIRECTOR_INFO_NOT_VALID', message: 'Administrators or Legal Representatives information is not valid' },
    { name: 'NO_DIR_NEEDED', message: 'No Administrators or Legal Representatives required for this business type. Please proceed to next step.' }
  ],

  sections: [
    {
      name: 'directorsInfoSection',
      title: 'Administrators and Legal Representatives',
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
      label: 'no administrators and legal representatives needed',
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
          name: x.data.ADD_NAME
        };
      },
      // visibility: function(businessTypeId, needDirector) {
      //   return businessTypeId < 4 ? foam.u2.DisplayMode.HIDDEN : foam.u2.DisplayMode.RW;
      // },
      // validateObj: function(businessTypeId, businessDirectors, businessDirectors$errors) {
      //   if ( businessTypeId < 4 ) return;
      //   if ( ! businessDirectors || businessDirectors.length == 0 )
      //     return this.NO_DIRECTOR_INFO;
      //   if ( businessDirectors$errors && businessDirectors$errors.length )
      //     return this.DIRECTOR_INFO_NOT_VALID;
      // },
      validationStyleEnabled: false
    }
  ],

  methods: [
    function installInWizardlet(w) {
      // Eliminate flicker from FObjectArray updates
      w.reloadAfterSave = false;
    },
    {
      name: 'validate',
      javaCode: `
        if (getBusinessTypeId() < 4) return;

        // validate directors
        if (getBusinessDirectors() == null || getBusinessDirectors().length == 0) {
          throw new IllegalStateException(NO_DIRECTOR_INFO);
        }

        for (BRBusinessDirector director : getBusinessDirectors()) {
          try {
            director.validate(x);
          } catch (RuntimeException e) {
            throw new IllegalStateException(DIRECTOR_INFO_NOT_VALID);
          }
        }
      `
    }
  ]
});
