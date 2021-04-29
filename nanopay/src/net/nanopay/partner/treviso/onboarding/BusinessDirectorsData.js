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
    { name: 'SKIP_DIRECTORS_MSG', message: 'Administrators and Legal Representatives are not required' }
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
      class: 'Boolean',
      name: 'skipDirectors',
      documentation: 'Make directors optional if set to true',
      label: '',
      section: 'directorsInfoSection',
      visibility: function(businessDirectors) {
        return businessDirectors.length > 0 ? foam.u2.DisplayMode.HIDDEN : foam.u2.DisplayMode.RW;
      },
      view: function(_, X) {
        return {
          class: 'foam.u2.CheckBox',
          label: X.data.SKIP_DIRECTORS_MSG
        }
      },
      postSet: function (_, newVal) {
        if (newVal) {
          this.businessDirectors = [];
        }
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
      visibility: function(skipDirectors) {
        return skipDirectors ? foam.u2.DisplayMode.HIDDEN : foam.u2.DisplayMode.RW;
      },
      validateObj: function(skipDirectors, businessDirectors, businessDirectors$errors) {
        if ( skipDirectors ) return;

        if ( ! businessDirectors || businessDirectors.length === 0 )
          return this.NO_DIRECTOR_INFO;

        if ( businessDirectors$errors && businessDirectors$errors.length )
          return this.DIRECTOR_INFO_NOT_VALID;
      },
      validationStyleEnabled: false
    }
  ],

  methods: [
    function installInWizardlet(w) {
      var directorsInstalled = [];
      var installDirector = () => {
        this.businessDirectors.forEach(director => {
          if ( directorsInstalled.includes(director) ) return;
          directorsInstalled.push(director);
          director.installInWizardlet(w);
        })
      }
      installDirector();
      this.businessDirectors$.sub(installDirector);
    },
    {
      name: 'validate',
      javaCode: `
        if ( getSkipDirectors() ) return;

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
