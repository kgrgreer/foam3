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
  package: 'net.nanopay.contacts.facade',
  name: 'FacadeContact',

  documentation: `This model is a facade to the contact`,

  implements: [ 'foam.mlang.Expressions' ],

  requires: [
    'foam.nanos.auth.Address',
    'net.nanopay.bank.BankAccount'
  ],

  sections: [
    {
      name: 'userInformation'
    },
    {
      name: 'businessAddressInformation'
    }
  ],

  properties: [
    net.nanopay.contacts.Contact.ID.clone().copyFrom({
      gridColumns:6,
      section: 'userInformation',
      order: 20
    }),
    net.nanopay.contacts.Contact.ORGANIZATION.clone().copyFrom({
      gridColumns:6,
      label: 'Company Name',
      section: 'userInformation',
      order: 20
    }),
    net.nanopay.contacts.Contact.FIRST_NAME.clone().copyFrom({
      gridColumns:6,
      section: 'userInformation',
      order: 20
    }),
    net.nanopay.contacts.Contact.LAST_NAME.clone().copyFrom({
      gridColumns:6,
      section: 'userInformation',
      order: 20
    }),
    net.nanopay.contacts.Contact.EMAIL.clone().copyFrom({
      gridColumns:6,
      section: 'userInformation',
      order: 40
    }),
    net.nanopay.contacts.Contact.BANK_ACCOUNT.clone().copyFrom({
      gridColumns:6,
      section: 'userInformation',
      order: 40,
      updateVisibility: 'RO'
    }),
    //TODO delete
    net.nanopay.account.Account.OWNER.clone().copyFrom({
      gridColumns:6,
      section: 'userInformation',
      order: 40,
      updateVisibility: 'RO',
      hidden: true
    }),
    foam.nanos.auth.User.GROUP.clone().copyFrom({
      gridColumns:6,
      section: 'userInformation',
      order: 40,
      updateVisibility: 'RO',
      hidden: true
    }),
    net.nanopay.contacts.Contact.IS_CONSENT.clone().copyFrom({
      gridColumns:6,
      section: 'userInformation',
      order: 40,
      updateVisibility: 'RO'
    }),
    net.nanopay.account.Account.IS_DEFAULT.clone().copyFrom({
      gridColumns:6,
      section: 'userInformation',
      order: 40,
      updateVisibility: 'RO',
      hidden: true
    }),
    //TODO delete
    net.nanopay.contacts.Contact.PASSWORD_HISTORY.clone().copyFrom({
      gridColumns:6,
      section: 'userInformation',
      order: 40,
      updateVisibility: 'RO'
    }),
    //TODO delete
    net.nanopay.contacts.Contact.PASSWORD.clone().copyFrom({
      gridColumns:6,
      section: 'userInformation',
      order: 40,
      updateVisibility: 'RO'
    }),
    net.nanopay.contacts.Contact.BUSINESS_ADDRESS.clone().copyFrom({
      gridColumns:12,
      section: 'businessAddressInformation',
      order: 40,
      updateVisibility: 'RO'
    }),
    net.nanopay.contacts.Contact.STATUS.clone().copyFrom({
      label: 'Registration Status',
      gridColumns:6,
      section: 'userInformation',
      order: 110
    }),
    net.nanopay.contacts.Contact.COUNTRIES.clone().copyFrom({
      label: 'Registration Status',
      gridColumns:6,
      section: 'userInformation',
      order: 110
    }),
//     net.nanopay.contacts.PersonalContact.CREATE_BANK_ACCOUNT.clone().copyFrom({
//       label: 'Registration Status',
//       gridColumns:6,
//       section: 'userInformation',
//       order: 110
//     }),
    {
      class: 'Boolean',
      name: 'isEdit',
      documentation: `Set to true when editing a contact from
      contact controller.`,
      value: false,
      visibility: 'HIDDEN'
    },
    {
      // REVIEW: this should be storageTransient - believe it's just used for
      // capability input.
      class: 'Boolean',
      name: 'confirm',
      documentation: `True if the user confirms their relationship with the contact.`,
      includeInDigest: false,
      section: 'userInformation',
      gridColumns: 6,
      visibility: 'HIDDEN'
    },
  ]
});
