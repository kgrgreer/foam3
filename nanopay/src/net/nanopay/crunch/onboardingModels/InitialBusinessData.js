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
  name: 'InitialBusinessData',

  implements: [
    'foam.core.Validatable'
  ],

  requires: [
    'foam.nanos.auth.Address',
    'net.nanopay.model.Business'
  ],

  imports: [
    'countryDAO',
    'permittedCountryDAO',
    'user',
    'subject'
  ],

  javaImports: [
    'foam.nanos.auth.Address'
  ],

  sections: [
    {
      name: 'businessRegistration',
      title: 'Business Details',
      help: `Please enter business details.`
    },
    {
      name: 'businessAddress',
      title: 'Business Address',
      help: `Please enter your business' address.`
    }
  ],

  messages: [
    { name: 'QUEBEC_NOT_SUPPORTED_ERROR', message: 'This application does not currently support businesses in Quebec. We are working hard to change this! If you are based in Quebec, check back for updates.' },
    { name: 'INVALID_ADDRESS_ERROR', message: 'Invalid address.' },
    { name: 'SAME_AS_BUSINESS_ADDRESS_LABEL', message: 'Mailing address is same as business address.' }
  ],

  properties: [
    {
      class: 'Reference',
      of: 'net.nanopay.model.Business',
      name: 'businessId',
      visibility: 'HIDDEN'
    },
    {
      class: 'String',
      name: 'businessName',
      documentation: 'Legal name of business.',
      section: 'businessRegistration',
      required: true,
      visibility: function() {
        if ( this.subject.user.businessName ) {
          return foam.u2.DisplayMode.RO;
        } else {
          return foam.u2.DisplayMode.RW;
        }
      },
      factory: function() {
        return this.subject.user.businessName
      }
    },
    {
      class: 'PhoneNumber',
      name: 'companyPhone',
      documentation: 'Phone number of the business.',
      label: 'Company Phone #',
      section: 'businessRegistration',
      required: true
    },
    {
      class: 'PhoneNumber',
      name: 'fax',
      documentation: 'Fax number of the business.',
      label: 'Fax #',
      section: 'businessRegistration',
      validationPredicates: [
        {
          args: ['fax'],
          predicateFactory: function(e) {
            const PHONE_NUMBER_REGEX = /^(?:\+?)(999|998|997|996|995|994|993|992|991|990|979|978|977|976|975|974|973|972|971|970|969|968|967|966|965|964|963|962|961|960|899|898|897|896|895|894|893|892|891|890|889|888|887|886|885|884|883|882|881|880|879|878|877|876|875|874|873|872|871|870|859|858|857|856|855|854|853|852|851|850|839|838|837|836|835|834|833|832|831|830|809|808|807|806|805|804|803|802|801|800|699|698|697|696|695|694|693|692|691|690|689|688|687|686|685|684|683|682|681|680|679|678|677|676|675|674|673|672|671|670|599|598|597|596|595|594|593|592|591|590|509|508|507|506|505|504|503|502|501|500|429|428|427|426|425|424|423|422|421|420|389|388|387|386|385|384|383|382|381|380|379|378|377|376|375|374|373|372|371|370|359|358|357|356|355|354|353|352|351|350|299|298|297|296|295|294|293|292|291|290|289|288|287|286|285|284|283|282|281|280|269|268|267|266|265|264|263|262|261|260|259|258|257|256|255|254|253|252|251|250|249|248|247|246|245|244|243|242|241|240|239|238|237|236|235|234|233|232|231|230|229|228|227|226|225|224|223|222|221|220|219|218|217|216|215|214|213|212|211|210|98|95|94|93|92|91|90|86|84|82|81|66|65|64|63|62|61|60|58|57|56|55|54|53|52|51|49|48|47|46|45|44|43|41|40|39|36|34|33|32|31|30|27|20|7|1)?[0-9]{0,14}$/;
              return e.OR(
                e.EQ(foam.mlang.StringLength.create({ arg1: net.nanopay.crunch.onboardingModels.InitialBusinessData.FAX }), 0),
                e.REG_EXP(net.nanopay.crunch.onboardingModels.InitialBusinessData.FAX, PHONE_NUMBER_REGEX)
              );
          },
          errorString: 'Invalid fax number.'
        }
      ]
    },
    {
      class: 'EMail',
      name: 'email',
      documentation: 'Company email.',
      label: 'Email Address',
      section: 'businessRegistration'
    },
    {
      class: 'Boolean',
      name: 'signInAsBusiness',
      value: true,
      hidden: true
    },
    net.nanopay.model.Business.ADDRESS.clone().copyFrom({
      section: 'businessAddress',
      documentation: 'Business address.',
      label: '',
      view: function(_, X) {
        var m = foam.mlang.Expressions.create();
        var countryId = X.data ? X.data.countryId : null;
        var dao = countryId ? 
          X.permittedCountryDAO.where(m.EQ(foam.nanos.auth.Country.ID, countryId)) :
          X.permittedCountryDAO;

        return {
          class: 'net.nanopay.sme.ui.AddressView',
          customCountryDAO: dao,
          showValidation: true
        };
      },
      autoValidate: false,
      validationPredicates: [
        {
          args: ['address', 'address$regionId', 'address$errors_'],
          predicateFactory: function(e) {
            return e.NEQ(e.DOT(net.nanopay.crunch.onboardingModels.InitialBusinessData.ADDRESS, foam.nanos.auth.Address.REGION_ID), 'QC');
          },
          errorMessage: 'QUEBEC_NOT_SUPPORTED_ERROR'
        },
        {
          args: ['address', 'address$errors_'],
          predicateFactory: function(e) {
            return e.EQ(foam.mlang.IsValid.create({
                arg1: net.nanopay.crunch.onboardingModels.InitialBusinessData.ADDRESS
              }), true);
          },
          errorMessage: 'INVALID_ADDRESS_ERROR'
        }
      ]
    }),
    {
      class: 'Boolean',
      name: 'sameAsBusinessAddress',
      section: 'businessAddress',
      documentation: `
        Determines whether the business address and its mailing address are the same.
      `,
      label: '',
      view: function(_, X) {
        return foam.u2.CheckBox.create({ label: X.data.SAME_AS_BUSINESS_ADDRESS_LABEL });
      }
    },
    net.nanopay.model.Business.MAILING_ADDRESS.clone().copyFrom({
      documentation: 'Business mailing address.',
      section: 'businessAddress',
      // TODO: Add a JS getter.
      javaGetter: `
        return getSameAsBusinessAddress() ? getAddress() : mailingAddress_;
      `,
      visibility: function(sameAsBusinessAddress) {
        return sameAsBusinessAddress ? foam.u2.DisplayMode.HIDDEN : foam.u2.DisplayMode.RW;
      },  
      view: function(_, X) {
        return {
          class: 'net.nanopay.sme.ui.AddressView',
          customCountryDAO: X.data.countryDAO,
          showValidation: true
        };
      },
      autoValidate: false,
      validationPredicates: [
        {
          args: ['mailingAddress', 'mailingAddress$errors_', 'sameAsBusinessAddress'],
          predicateFactory: function(e) {
            return e.OR(
              e.EQ(net.nanopay.crunch.onboardingModels.InitialBusinessData.SAME_AS_BUSINESS_ADDRESS, true),
              e.EQ(foam.mlang.IsValid.create({
                  arg1: net.nanopay.crunch.onboardingModels.InitialBusinessData.MAILING_ADDRESS
                }), true)
            );
          },
          errorMessage: 'INVALID_ADDRESS_ERROR'
        }
      ]
    })
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
