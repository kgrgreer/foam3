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
  name: 'CertifyDataReviewed',
  extends: 'foam.nanos.crunch.RenewableData',

  implements: [
    'foam.core.Validatable',
    'foam.mlang.Expressions'
  ],

  imports: [
    'auth'
  ],

  javaImports: [
    'foam.nanos.auth.Subject',
    'foam.nanos.auth.User'
  ],

  messages: [
    { name: 'REVIEW_REQUIRED_ERROR', message: 'All data must be reviewed by a signing officer' }
  ],

  sections: [
    {
      name: 'reviewDataSection',
      permissionRequired: true
    }
  ],

  properties: [
    {
      class: 'Boolean',
      name: 'canReview',
      section: 'reviewDataSection',
      transient: true,
      hidden: true,
      expression: function() {
        var self = this;
        this.auth.check(this.__subContext__, "certifydatareviewed.rw.reviewed").then((result) => { 
          self.canReview = result;
        });
      }
    },
    {
      class: 'Boolean',
      name: 'reviewed',
      section: 'reviewDataSection',
      documentation: 'Whether the data was reviewed',
      label: 'I certify all data has been reviewed.',
      visibility: function(canReview) {
        return canReview ? foam.u2.DisplayMode.RW : foam.u2.DisplayMode.HIDDEN;
      },
      validationPredicates: [
        {
          args: ['reviewed'],
          predicateFactory: function(e) {
            return e.EQ(net.nanopay.crunch.onboardingModels.CertifyDataReviewed.REVIEWED, true);
          }, 
          errorMessage: 'REVIEW_REQUIRED_ERROR'
        }
      ]
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'signingOfficer',
      section: 'reviewDataSection',
      hidden: true
    },
    {
      class: 'String',
      name: 'requireSigningOfficerReview',
      value: 'All data must be reviewed by signing officer of this business prior to approval.',
      section: 'reviewDataSection',
      visibility: function(canReview) {
        return canReview ? foam.u2.DisplayMode.HIDDEN : foam.u2.DisplayMode.RO;
      }
    }
  ],

  methods: [
    {
      name: 'validate',
      javaCode: `
        if ( ! getReviewed() ) {
          throw new IllegalStateException("Must acknowledge all data has been reviewed.");
        }

        long signingOfficerId = (((Subject) x.get("subject")).getRealUser()).getId();
        setSigningOfficer(signingOfficerId);
      `
    }
  ]
});
