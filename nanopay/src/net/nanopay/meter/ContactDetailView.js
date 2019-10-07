foam.CLASS({
  package: 'net.nanopay.meter',
  name: 'ContactDetailView',
  extends: 'foam.u2.DetailView',

  requires: [
    'foam.core.Property',
    'net.nanopay.contacts.Contact',
    'net.nanopay.accounting.xero.model.XeroContact',
    'net.nanopay.accounting.quickbooks.model.QuickbooksContact',
  ],

  css: `
    ^ {
      background-color: #fafafa;
      border: 1px solid #e2e2e3;
      border-radius: 4px;
      margin-top: 8px;
    }

    ^ td {
      padding: 8px 16px;
    }

    ^ .foam-u2-PropertyView-label {
      font-weight: bold;
    }
  `,

  properties: [
    {
      name: 'properties',
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
          this.Contact.BUSINESS_NAME,
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
