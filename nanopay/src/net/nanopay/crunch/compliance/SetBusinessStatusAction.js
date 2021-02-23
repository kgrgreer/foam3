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
  package: 'net.nanopay.crunch.compliance',
  name: 'SetBusinessStatusAction',
  implements: [
    'foam.nanos.ruler.RuleAction'
  ],
  documentations: 'A rule action to toggle setting business status',

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.auth.User',
    'foam.nanos.crunch.UserCapabilityJunction',
    'net.nanopay.model.Business',
    'foam.nanos.auth.LifecycleState'
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        agency.submit(x, new ContextAgent() {
          @Override
          public void execute(X x) {
            DAO userDAO = (DAO) x.get("localUserDAO");
            User user = (User) userDAO.find(((UserCapabilityJunction) obj).getSourceId());

            try {
              Business business = (Business) user.fclone();
              business.setLifecycleState(LifecycleState.ACTIVE);
              userDAO.put(business);
            } catch(Exception e) {
              throw new UnsupportedOperationException("Business : " + user.getId() + " compliance not set - but UCJ granted" + "Error: " + e);
            }
          }
        }, "Toggle Business Status Set");
      `
    }
  ]
 })
