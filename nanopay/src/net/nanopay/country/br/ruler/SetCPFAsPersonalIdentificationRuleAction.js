/**
 * NANOPAY CONFIDENTIAL
 *
 * [2021] nanopay Corporation
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
  package: 'net.nanopay.country.br.ruler',
  name: 'SetCPFAsPersonalIdentificationRuleAction',

  documentation: 'Set user personal identification according to CPF data.',

  implements: ['foam.nanos.ruler.RuleAction'],

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.auth.User',
    'foam.nanos.crunch.UserCapabilityJunction',
    'net.nanopay.country.br.CPF',
    'net.nanopay.model.PersonalIdentification',
    'java.time.LocalDate',
    'java.time.ZoneId',
    'java.util.Date',
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        agency.submit(x, new ContextAgent() {
          @Override
          public void execute(X x) {
            var ucj = (UserCapabilityJunction) obj;

            var cpf = (CPF) ucj.getData();
            if ( cpf != null ) {
              var user = (User) ucj.findSourceId(x).fclone();
              var identification = user.getIdentification();
              if ( identification == null ) {
                identification = new PersonalIdentification();
              }
              // See CPF identification type in identificationTypes.jrl
              identification.setIdentificationTypeId(10L);
              identification.setCountryId("BR");
              identification.setIdentificationNumber(cpf.getData());
              identification.setIssuer(cpf.getIssuer());

              // Update user
              user.setIdentification(identification);
              ((DAO) x.get("localUserDAO")).inX(x).put(user);
            }
         }
        }, "Set CPF As Personal Identification");
      `
    }
  ]
});
