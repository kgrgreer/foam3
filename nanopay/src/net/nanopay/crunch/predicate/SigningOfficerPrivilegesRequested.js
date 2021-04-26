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
  package: 'net.nanopay.crunch.predicate',
  name: 'SigningOfficerPrivilegesRequested',

  extends: 'foam.mlang.predicate.AbstractPredicate',
  implements: [ 'foam.core.Serializable' ],

  documentation: `
    Returns true if current 'agent' (user) requested signing officer privileges by answering the signing
    officer question with "yes".
  `,

  javaImports: [
    'foam.core.X',
    'foam.nanos.auth.Subject',
    'foam.nanos.auth.User',
    'foam.nanos.crunch.CapabilityJunctionStatus',
    'foam.nanos.crunch.CrunchService',
    'foam.nanos.crunch.UserCapabilityJunction',
    'net.nanopay.crunch.onboardingModels.SigningOfficerQuestion',
    'net.nanopay.model.Business'
  ],

  methods: [
    {
      name: 'f',
      javaCode: `
        if ( ! ( obj instanceof X ) ) return false;
        X x = (X) obj;
        CrunchService crunchService = (CrunchService) x.get("crunchService");
        User agent = ((Subject) x.get("subject")).getRealUser();
        User user = ((Subject) x.get("subject")).getUser();
        if ( agent == null || user == null || ! ( agent instanceof User ) || ! ( user instanceof Business ) ) return false;
        UserCapabilityJunction acj = crunchService.getJunction(x, "crunch.onboarding.signing-officer-question");
        if ( acj == null || acj.getStatus() != CapabilityJunctionStatus.GRANTED ) {
          return false;
        }
        SigningOfficerQuestion soq = (SigningOfficerQuestion) acj.getData();
        return soq != null && soq.getIsSigningOfficer();
      `
    }
  ]
});

  