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
  package: 'net.nanopay.crunch.registration',
  name: 'UserRegistrationData',

  documentation: `This model represents the basic info of a User that must be collect after first login.`,
  
  sections: [
    {
      name: 'userRegistrationSection',
      title: 'Your information'
    }
  ],
  
  properties: [
    {
      class: 'String',
      name: 'firstName',
      section: 'userRegistrationSection',
      view: {
        class: 'foam.u2.TextField',
        placeholder: 'Jane'
      },
      required: true,
      documentation: 'First name of the user.'
    },
    {
      class: 'String',
      name: 'lastName',
      section: 'userRegistrationSection',
      view: {
        class: 'foam.u2.TextField',
        placeholder: 'Doe'
      },
      required: true,
      documentation: 'Last name of the user.'
    },
    {
      class: 'PhoneNumber',
      name: 'phoneNumber',
      section: 'userRegistrationSection',
      required: true,
      documentation: 'Phone number of the user.'
    }
  ]
});
  