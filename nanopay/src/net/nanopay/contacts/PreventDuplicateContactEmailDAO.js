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
  package: 'net.nanopay.contacts',
  name: 'PreventDuplicateContactEmailDAO',
  extends: 'foam.dao.ProxyDAO',
  documentation: `
    The purpose of this DAO decorator is to prevent users from creating two
    contacts with the same email address.
  `,

  javaImports: [
    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.dao.Sink',
    'foam.nanos.auth.AuthenticationException',
    'foam.nanos.auth.Subject',
    'foam.nanos.auth.User',
    'foam.util.SafetyUtil',
    'net.nanopay.accounting.quickbooks.model.QuickbooksContact',
    
    'java.util.List',
    
    'static foam.mlang.MLang.AND',
    'static foam.mlang.MLang.EQ'
  ],

  messages: [
    { name: 'DUPLICATE_CONTACT_ERROR_MSG', message: 'You already have a contact with that email address' }
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(`
          public PreventDuplicateContactEmailDAO(X x, DAO delegate) {
            super(x, delegate);
          }    
        `
        );
      }
    }
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
        if ( ! ( obj instanceof PersonalContact ) ) {
          return super.put_(x, obj);
        }
    
        User user = ((Subject) x.get("subject")).getUser();
    
        if ( user == null ) {
          throw new AuthenticationException();
        }
    
        Contact toPut = (Contact) obj;
    
        if ( toPut.getBusinessId() != 0 && SafetyUtil.equals(toPut.getEmail(), "") ) {
          return super.put_(x, toPut);
        }
    
        Sink sink = new ArraySink();
        sink = getDelegate().inX(x)
          .where(AND(EQ(Contact.EMAIL, toPut.getEmail().toLowerCase()), EQ(Contact.OWNER, user.getId())))
          .limit(1)
          .select(sink);
        List data = ((ArraySink) sink).getArray();
    
        // Disregards the check for objects that are marked as deleted as they do not count as duplicate
        if ( obj instanceof User && ((User) obj).getDeleted() == true )
          return super.put_(x, toPut);
    
        if ( data.size() == 1 ) {
          Contact existingContact = (Contact) data.get(0);
          if ( existingContact.getId() != toPut.getId() && ! ( existingContact instanceof QuickbooksContact ) ) {
            throw new RuntimeException(DUPLICATE_CONTACT_ERROR_MSG);
          }
        }
    
        return super.put_(x, toPut);
      `
    }
  ]
});

