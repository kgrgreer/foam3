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
  package: 'net.nanopay.meter',
  name: 'ContactDetailView',
  extends: 'foam.u2.detail.SectionedDetailView',

  requires: [
    'foam.core.Property',
    'net.nanopay.contacts.Contact',
    'net.nanopay.accounting.xero.model.XeroContact',
    'net.nanopay.accounting.quickbooks.model.QuickbooksContact',
  ],

  properties: [
    {
      name: 'propertyWhitelist',
      factory: function() {
        var self = this;
        var model = this.Contact.clone();
        var syncedAxiom = this.Property.create({
          class: 'Boolean',
          name: 'syncedFromAccounting',
          label: 'Synced from accounting?',
          view: 'foam.u2.CheckBox',
          factory: function() {
            return self.QuickbooksContact.isInstance(this) ||
                   self.XeroContact.isInstance(this);
          }
        });
        model.installAxiom(syncedAxiom);
        return [
          this.Contact.ID,
          this.Contact.ORGANIZATION,
          this.Contact.EMAIL,
          this.Contact.CREATED,
          this.Contact.OWNER,
          this.Contact.SIGN_UP_STATUS,
          this.Contact.DELETED,
          this.Contact.SYNCED_FROM_ACCOUNTING,
          this.Contact.ADDRESS,
          this.Contact.ACCOUNTS,
        ];
      }
    },
    {
      name: 'config',
      value: {
        signUpStatus: { label: 'Ablii sign-up status' },
        created: { label: 'Date created' },
        owner: { label: 'Created by' },
      }
    }
  ]
});
