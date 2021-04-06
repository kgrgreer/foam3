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
  package: 'net.nanopay.tx.model',
  name: 'TransactionEntity',
  documentation: `This model represents the payer/payee of a transaction and is meant to storage transient.`,

  requires: ['net.nanopay.model.Business'],

  javaImports: [
    'foam.nanos.auth.User',
    'foam.util.SafetyUtil'
  ],

  properties: [
    {
      class: 'Long',
      name: 'id',
      visibility: 'RO'
    },
    {
      class: 'String',
      name: 'firstName',
      visibility: 'RO'
    },
    {
      class: 'String',
      name: 'lastName',
      visibility: 'RO'
    },
    {
      class: 'String',
      name: 'fullName',
      expression: function(firstName, lastName) {
        return `${firstName} ${lastName}`.trim();
      },
      javaFactory: `
        String name = getFirstName() + " " + getLastName();
        return SafetyUtil.isEmpty(name) ? name : name.trim();
      `
    },
    {
      class: 'String',
      name: 'businessName'
    },
    {
      class: 'String',
      name: 'displayName',
      expression: function(firstName, lastName, businessName, userClass) {
        var name = businessName.trim();
        if ( ! name ) {
          name = this.fullName.trim();
        }
        return name;
      },
      javaGetter: `
        String name = getBusinessName();
        if ( SafetyUtil.isEmpty(name) ) {
          name = getFullName();
        }
        return SafetyUtil.isEmpty(name) ? name : name.trim();
      `
    },
    {
      class: 'String',
      name: 'userClass'
    },
    {
      class: 'EMail',
      name: 'email'
    },
    {
      class: 'foam.nanos.fs.FileProperty',
      name: 'profilePicture',
      view: { class: 'foam.nanos.auth.ProfilePictureView' }
    }
  ],
  axioms: [
    {
      buildJavaClass: function(cls) {
        cls.extras.push(`
          public TransactionEntity(User user) {
            setId(user.getId());
            setFirstName(user.getFirstName());
            setLastName(user.getLastName());
            setEmail(user.getEmail());
            setUserClass(user.getClass().getName());
            setBusinessName(user.getBusinessName());
            setProfilePicture(user.getProfilePicture());
          }
        `);
      }
    }
  ]
});
