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
  name: 'BrazilBusinessInfoData',
  mixins: ['foam.u2.wizard.AbstractWizardletAware'],
  documentation: `
    Additional business information required for brazilian business registration
  `,

  implements: [
    'foam.core.Validatable',
    'foam.mlang.Expressions'
  ],

  javaImports: [
    'foam.nanos.logger.Logger',
    'foam.util.SafetyUtil',
    'java.util.regex.Pattern'
  ],

  imports: [
    'brazilVerificationService'
  ],

  constants: [
    { name: 'FORMATTED_CNPJ_PATTERN', javaType: 'Pattern', javaValue: 'Pattern.compile("^\\\\d{2}\\\\.\\\\d{3}\\\\.\\\\d{3}\\\\/\\\\d{4}\\\\-\\\\d{2}$")' },
    { name: 'UNFORMATTED_CNPJ_PATTERN', javaType: 'Pattern', javaValue: 'Pattern.compile("^\\\\d{14}$")' },
    { name: 'CNPJ_LENGTH', javaType: 'int', value: 14 }
  ],

  sections: [
    {
      name: 'businessInformation',
      title: `Enter the identification numbers for your business`,
      help: `Require Business' Identification Numbers`
    }
  ],

  messages: [
    { name: 'NO_CNPJ', message: '14-digit National Registry of Legal Entities Number required' },
    { name: 'CNPJ_INVALID', message: 'CNPJ invalid, please check your CNPJ number and try again' },
    { name: 'NO_NIRE', message: 'NIRE required' },
    { name: 'VERIFY_BUSINESS_NAME', message: 'Confirm your business name' }
  ],

  properties: [
    {
      class: 'FormattedString',
      name: 'cnpj',
      label: 'National Registry of Legal Entities(CNPJ)',
      required: true,
      documentation: `
          CNPJ (short for Cadastro Nacional da Pessoa Jurídica in Portuguese, or National Registry of Legal Entities) is an identification number issued to Brazilian companies by the Department of Federal Revenue of Brazil.
          Format of CNPJ - 14Insira seu CPF-digit number formatted as 00.000.000/0001-00
          The first eight digits identify the company, the four digits after the slash identify the branch or subsidiary ("0001" defaults to the headquarters), and the last two are check digits`,
      section: 'businessInformation',
      validationPredicates: [
        {
          args: ['cnpj', 'cnpjName'],
          predicateFactory: function(e) {
            return e.OR(
              e.REG_EXP(net.nanopay.country.br.BrazilBusinessInfoData.CNPJ, /^\d{2}\.\d{3}\.\d{3}\/\d{4}\-\d{2}$/),
              e.REG_EXP(net.nanopay.country.br.BrazilBusinessInfoData.CNPJ, /^\d{14}$/)
            );
          },
          errorMessage: 'NO_CNPJ'
        },
        {
          args: ['cnpj', 'cnpjName'],
          predicateFactory: function(e) {
            return e.AND(
              e.GT(
                net.nanopay.country.br.BrazilBusinessInfoData
                .CNPJ_NAME, 0),
              e.OR(
                e.REG_EXP(net.nanopay.country.br.BrazilBusinessInfoData.CNPJ, /^\d{2}\.\d{3}\.\d{3}\/\d{4}\-\d{2}$/),
                e.REG_EXP(net.nanopay.country.br.BrazilBusinessInfoData.CNPJ, /^\d{14}$/)
              )
            );
          },
          errorMessage: 'CNPJ_INVALID'
        }
      ],
      formatter: [2, '.', 3, '.', 3, '/', 4, '-', 2],
      postSet: function(o, n) {
        var validCnpj = this.CNPJ.validationPredicates[0].predicate.f(this);
        if ( validCnpj && o.replace(/\D/g,'') === n.replace(/\D/g,'') ) return;
        this.cnpjName = '';
        this.verifyName = false;
      }
    },
    {
      class: 'Boolean',
      name: 'verifyName',
      label: 'Is this your business?',
      section: 'businessInformation',
      view: function(_, X) {
        return {
          class: 'foam.u2.CheckBox',
          label$: X.data$.dot('cnpjName')
        };
      },
      visibility: function(cnpjName) {
        return cnpjName.length > 0 ? foam.u2.DisplayMode.RW : foam.u2.DisplayMode.HIDDEN;
      },
      validationPredicates: [
        {
          args: ['verifyName'],
          predicateFactory: function(e) {
            return e.EQ(net.nanopay.country.br.BrazilBusinessInfoData.VERIFY_NAME, true);
          },
          errorMessage: 'VERIFY_BUSINESS_NAME'
        }
      ]
    },
    {
      class: 'String',
      name: 'nire',
      label: 'State Commercial Identification Number(NIRE)',
      required: true,
      documentation: `NIRE is the State Commercial Identification Number used by the State Commercial Board.`,
      section: 'businessInformation'
    },
    {
      class: 'String',
      name: 'ie',
      label: 'State Inscription(IE)',
      documentation: `IE is the State Tax Identification Number used by the State Department of Taxation.
          Businesses that sell goods are required to have an IE, used mainly to pay ICMS, tax on the distribution of goods and services.`,
      section: 'businessInformation'
    },
    {
      class: 'String',
      name: 'im',
      label: 'Municipal Inscription(IM)',
      documentation: `IM is the Municipal Tax Identification Number used by the City Department of Taxation.
          Businesses that sell services are required to have an IM, used mainly to pay ISS, Sales Tax on Services.`,
      section: 'businessInformation'
    },
    {
      class: 'String',
      name: 'cnpjName',
      label: '',
      hidden: true,
      section: 'businessInformation'
    }
  ],

  methods: [
    function installInWizardlet(w) {
      this.onDetach(this.cnpj$.sub(() => {
        if ( this.cnpj.replace(/\D/g,'').length == this.CNPJ_LENGTH && this.verifyName !== true ) {
          w.save();
        } else {
          this.cnpjName = '';
          this.verifyName = false;
        }
      }));
    },
    {
      name: 'getCNPJBusinessName',
      code:  async function(cnpj) {
        return await this.brazilVerificationService.getCNPJName(this.__subContext__, cnpj);
      }
    },
    {
      name: 'validate',
      javaCode: `
        var brazilVerificationService = (BrazilVerificationServiceInterface)
          x.get("brazilVerificationService");

        if ( ! ( brazilVerificationService instanceof NullBrazilVerificationService ) ) {
          // IMPORTANT: Any fix here may also apply to CPF.js

          // This should be valid before making API call
          try {
            if ( getCnpj() == null ||
              ( ! UNFORMATTED_CNPJ_PATTERN.matcher(getCnpj()).matches() && ! FORMATTED_CNPJ_PATTERN.matcher(getCnpj()).matches() ) ) {
              throw new foam.core.ValidationException(NO_CNPJ);
            }
          } catch ( foam.core.ValidationException e ) {
            this.setCnpjName("");
            throw e;
          }

          var name = brazilVerificationService.getCNPJName(
            x, getCnpj());

          if ( SafetyUtil.isEmpty(name) ) {
            setCnpjName("");
            throw new foam.core.ValidationException(CNPJ_INVALID);
          }

          if ( ! SafetyUtil.equals(name, getCnpjName()) ) {
            setCnpjName(name);
            setVerifyName(false);
          }
        }

        if ( ! getVerifyName() ) {
          throw new foam.core.ValidationException(CNPJ_INVALID);
        }

        if ( SafetyUtil.isEmpty(getNire()) ) {
          throw new foam.core.ValidationException(NO_NIRE);
        }

        foam.core.FObject.super.validate(x);
      `
    }
  ]
});
