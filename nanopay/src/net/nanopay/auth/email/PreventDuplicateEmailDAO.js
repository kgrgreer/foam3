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
  package: 'net.nanopay.auth.email',
  name: 'PreventDuplicateEmailDAO',

  documentation: 'DAO decorator that prevents putting a user with the same email',

  javaImports: [
    'net.nanopay.model.Business',
    'net.nanopay.contacts.Contact',
    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.dao.ProxyDAO',
    'foam.nanos.auth.User',
    'static foam.mlang.MLang.*',
    'foam.mlang.sink.Count',
    'foam.util.Email',
    'foam.util.SafetyUtil',
  ],

  extends: 'foam.dao.ProxyDAO',

  methods: [
    {
      name: 'put_',
      javaCode: `
  if ( obj instanceof Business || obj instanceof Contact ) {
    return super.put_(x, obj);
  }

  User user = (User) obj;
  boolean newUser = ( getDelegate().find(user.getId()) == null );

  if ( newUser ) {
    if ( SafetyUtil.isEmpty(user.getEmail()) ) {
      throw new RuntimeException("Email required");
    }

    if ( ! Email.isValid(user.getEmail()) ) {
      throw new RuntimeException("Invalid Email");
    }
  }

  Count count = new Count();
  count = (Count) ((DAO) getX().get("userUserDAO"))
      .where(AND(
        EQ(User.EMAIL, user.getEmail()),
        NEQ(User.ID,  user.getId())
      )).limit(1).select(count);

  if ( count.getValue() == 1 ) {
    throw new RuntimeException("This email address is unavailable: " + user.getEmail());
  }

  return super.put_(x, obj);
      `,
   }
  ],

  axioms: [
    {
      buildJavaClass: function(cls) {
        cls.extras.push(`
public PreventDuplicateEmailDAO(foam.core.X x, foam.dao.DAO delegate) {
  super(x, delegate);
}
        `);
      },
    },
  ],
});
