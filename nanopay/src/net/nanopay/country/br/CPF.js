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
  package: 'net.nanopay.country.br',
  name: 'CPF',
  mixins: ['foam.u2.wizard.AbstractWizardletAware'],
  documentation: `
  NOTE : post and pr sets of data and birthday property set to minimize calls to api

    The Cadastro de Pessoas Físicas (CPF; Portuguese for "Natural Persons Register")
    is the Brazilian individual taxpayer registry identification, a permanent number
    attributed by the Brazilian Federal Revenue to both Brazilians and resident aliens
    who pay taxes or take part, directly or indirectly.
    It is canceled after some time after the person's death.
  `,

  implements: [
    'foam.core.Validatable',
    'foam.mlang.Expressions'
  ],

  javaImports: [
    'foam.core.XLocator',
    'foam.nanos.auth.Subject',
    'foam.nanos.auth.User',
    'foam.nanos.logger.Logger',
    'foam.util.SafetyUtil',
    'java.util.regex.Pattern',
    'net.nanopay.country.br.BrazilVerificationServiceInterface'
  ],

  imports: [
    'brazilVerificationService',
    'subject'
  ],

  constants: [
    { name: 'FORMATTED_CPF_PATTERN', javaType: 'Pattern', javaValue: 'Pattern.compile("^\\\\d{3}\\\\.\\\\d{3}\\\\.\\\\d{3}\\\\-\\\\d{2}$")' },
    { name: 'UNFORMATTED_CPF_PATTERN', javaType: 'Pattern', javaValue: 'Pattern.compile("^\\\\d{11}$")' },
    { name: 'CPF_LENGTH', javaType: 'int', value: 11 }
  ],

  messages: [
    { name: 'INVALID_CPF', message: 'Valid CPF number required' },
    { name: 'INVALID_CPF_CHECKED', message: 'Unable to validate CPF number and birthdate combination. Please update and try again.' },
    { name: 'INVALID_NAME', message: 'Click to verify name' },
    { name: 'INVALID_DATE_ERROR', message: 'Valid date of birth required' },
    { name: 'UNGER_AGE_LIMIT_ERROR', message: 'Must be at least 18 years old' },
    { name: 'OVER_AGE_LIMIT_ERROR', message: 'Must be under the age of 125 years old' }
  ],

  sections: [
    {
      name: 'collectCpf',
      title: 'Enter your Date of Birth and Cadastro de Pessoas Físicas(CPF)',
      navTitle: 'Signing officer\’s CPF number',
      help: 'Require your CPF'
    }
  ],

  properties: [
    foam.nanos.auth.User.BIRTHDAY.clone().copyFrom({
      section: 'collectCpf',
      label: 'Date of birth',
      validationPredicates: [
        {
          args: ['birthday'],
          predicateFactory: function(e) {
            return e.NEQ(net.nanopay.country.br.CPF.BIRTHDAY, null);
          },
          errorMessage: 'INVALID_DATE_ERROR'
        },
        {
          args: ['birthday'],
          predicateFactory: function(e) {
            var limit = new Date();
            limit.setDate(limit.getDate() - ( 18 * 365 ));
            return e.LT(net.nanopay.country.br.CPF.BIRTHDAY, limit);
          },
          errorMessage: 'UNGER_AGE_LIMIT_ERROR'
        },
        {
          args: ['birthday'],
          predicateFactory: function(e) {
            var limit = new Date();
            limit.setDate(limit.getDate() - ( 125 * 365 ));
            return e.GT(net.nanopay.country.br.CPF.BIRTHDAY, limit);
          },
          errorMessage: 'OVER_AGE_LIMIT_ERROR'
        }
      ]
    }),
    {
      class: 'FormattedString',
      name: 'data',
      help: `The CPF (Cadastro de Pessoas Físicas or Natural Persons Register) is a number assigned by the Brazilian revenue agency to both Brazilians and resident aliens who are subject to taxes in Brazil.`,
      label: 'Cadastro de Pessoas Físicas (CPF)',
      section: 'collectCpf',
      validationPredicates: [
        {
          args: ['data'],
          predicateFactory: function(e) {
            return e.OR(
              e.REG_EXP(net.nanopay.country.br.CPF.DATA, /^\d{3}\.\d{3}\.\d{3}\-\d{2}$/),
              e.REG_EXP(net.nanopay.country.br.CPF.DATA, /^\d{11}$/)
            );
          },
          errorMessage: 'INVALID_CPF'
        },
        {
          args: ['data', 'cpfName'],
          predicateFactory: function(e) {
            return e.AND(
              e.GT(
                foam.mlang.StringLength.create({
                  arg1: net.nanopay.country.br.CPF.CPF_NAME
                }), 0),
              e.OR(
                e.REG_EXP(net.nanopay.country.br.CPF.DATA, /^\d{3}\.\d{3}\.\d{3}\-\d{2}$/),
                e.REG_EXP(net.nanopay.country.br.CPF.DATA, /^\d{11}$/)
              ));
          },
          errorMessage: 'INVALID_CPF_CHECKED'
        }
      ],
      formatter: [3, '.', 3, '.', 3, '-', 2],
      view: function(_, X) {
        return foam.u2.FormattedTextField.create({
          formatter: this.formatter,
          returnFormatted: false
        }, X);
      }
    },
    {
      class: 'String',
      name: 'cpfName',
      label: '',
      section: 'collectCpf',
      hidden: true
    },
    {
      class: 'Boolean',
      name: 'verifyName',
      label: 'Is this the name of the person who owns this cpf?',
      section: 'collectCpf',
      view: function(_, X) {
        return {
          class: 'foam.u2.CheckBox',
          label$: X.data$.dot('cpfName')
        };
      },
      visibility: function(cpfName) {
        return cpfName ? foam.u2.DisplayMode.RW : foam.u2.DisplayMode.HIDDEN;
      },
      validationPredicates: [
        {
          args: ['verifyName'],
          predicateFactory: function(e) {
            return e.EQ(net.nanopay.country.br.CPF.VERIFY_NAME, true);
          },
          errorMessage: 'INVALID_NAME'
        }
      ]
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'user',
      hidden: true,
      factory: function() {
        return this.subject.realUser;
      },
      javaFactory: `
        return ((Subject) XLocator.get().get("subject")).getRealUser().getId();
      `
      // depricated but leaving for data migration - script to do this needed - then delete
    }
  ],

  methods: [
    function installInWizardlet(w) {
      this.onDetach(this.data$.sub(() => this.maybeSave(w)));
      this.onDetach(this.birthday$.sub(() => this.maybeSave(w)));
    },
    {
      name: 'clearFields',
      code: function() {
        this.cpfName = '';
        this.verifyName = false;
      }
    },
    {
      name: 'validate',
      javaCode: `
      var brazilVerificationService = (BrazilVerificationServiceInterface)
        x.get("brazilVerificationService");

      if ( ! ( brazilVerificationService instanceof NullBrazilVerificationService ) ) {
        // IMPORTANT: Any fix here may also apply to BrazilBusinessInfoData.js

        // These should be valid before making API call
        try {
          this.BIRTHDAY.validateObj(x, this);
          if ( getData() == null ||
            ( ! UNFORMATTED_CPF_PATTERN.matcher(getData()).matches() && ! FORMATTED_CPF_PATTERN.matcher(getData()).matches() ) ) {
            throw new foam.core.ValidationException(INVALID_CPF);
          }
        } catch ( foam.core.ValidationException e ) {
          this.setCpfName("");
          throw e;
        }

        var name = brazilVerificationService.getCPFNameWithBirthDate(
          x, getData(), getBirthday());

        if ( SafetyUtil.isEmpty(name) ) {
          setCpfName("");
          throw new foam.core.ValidationException(INVALID_CPF_CHECKED);
        }

        if ( ! SafetyUtil.equals(name, getCpfName()) ) {
          setCpfName(name);
          setVerifyName(false);
        }
      }

      if ( ! getVerifyName() )
          throw new foam.core.ValidationException(INVALID_NAME);

      foam.core.FObject.super.validate(x);
      `
    }
  ],

  listeners: [
    // CURRENT ISSUE: the api is getting called too many times
    // we want the api to only get called if the birthday and data properties are set and valid
    // initiallizing / cloning this model will trigger the copy of properties AND if the properties are set this will trigger a api call
    // now if the cpfName is set we can avoid the api call - but a property change needs to reset the cpfName
    // SO - listeners used in place of a property postSet to avoid initial call ... HMM
    {
      name: 'maybeSave',
      mergeDelay: 100, // only run every 100ms, otherwise trigger too many calls
      code: async function(w) {
        var validEnough = ( ! this.BIRTHDAY.validateObj[1].call(this) ) &&
          this.data.replace(/\D/g,'').length == this.CPF_LENGTH &&
          this.verifyName !== true;
        if ( validEnough ) w.save();
        else this.clearFields();
      }
    }
  ]
});
