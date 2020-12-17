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
  name: 'ContactMigrationRule',

  documentation: `
    Migrates contacts and invoices to a newly onboarded Business with a bank
    account.
  `,

  implements: ['foam.nanos.ruler.RuleAction'],

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.mlang.sink.Count',
    'foam.nanos.logger.Logger',
    'java.util.List',
    'net.nanopay.account.Account',
    'net.nanopay.admin.model.ComplianceStatus',
    'net.nanopay.bank.BankAccount',
    'net.nanopay.bank.BankAccountStatus',
    'net.nanopay.invoice.model.Invoice',
    'net.nanopay.model.Business',
    'static foam.mlang.MLang.*'
  ],

  messages: [
    {
      name: 'DESCRIBE_TEXT',
      message: 'Migrates contacts and invoices to a newly onboarded Business with a bank account.'
    },
    {
      name: 'BUSINESS_NOT_FOUND',
      message: 'Business not found'
    }
  ],

  properties: [
    {
      javaType: 'foam.core.PropertyInfo',
      javaInfoType: 'foam.core.AbstractObjectPropertyInfo',
      name: 'property',
      documentation: 'The property that references the Business.'
    }
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        DAO localAccountDAO = ((DAO) x.get("localAccountDAO")).inX(x);
        DAO localBusinessDAO = ((DAO) x.get("localBusinessDAO")).inX(x);

        long businessId = (Long) getProperty().get(obj);
        final Business business = (Business) localBusinessDAO.find(businessId);

        if ( business == null ) return;

        boolean passedCompliance = business.getCompliance() == ComplianceStatus.PASSED;

        // Check if the Business passed compliance just now.
        boolean justPassedCompliance = false;

        if ( obj instanceof Business && ! passedCompliance ) {
          Business oldBusiness = (Business) oldObj;
          Business newBusiness = (Business) obj;
          justPassedCompliance =
            oldBusiness.getCompliance() == ComplianceStatus.REQUESTED &&
            newBusiness.getCompliance() == ComplianceStatus.PASSED;
        }

        // Avoid doing the work below if we know they haven't passed compliance.
        if ( ! passedCompliance && ! justPassedCompliance ) return;

        Count count = (Count) localAccountDAO
          .where(
            AND(
              INSTANCE_OF(BankAccount.getOwnClassInfo()),
              EQ(BankAccount.STATUS, BankAccountStatus.VERIFIED),
              EQ(Account.OWNER, business.getId())
            )
          )
          .select(new Count());

        boolean hasVerifiedBankAccount = count.getValue() > 0;
        boolean justVerifiedBankAccount = false;

        // Check if they're either verifying an existing bank account or
        // creating a verified bank account right now.
        if ( obj instanceof BankAccount && ! hasVerifiedBankAccount ) {
          BankAccount oldBankAccount = (BankAccount) oldObj;
          BankAccount newBankAccount = (BankAccount) obj;
          justVerifiedBankAccount =
            (
              oldBankAccount == null ||
              (
                oldBankAccount != null &&
                oldBankAccount.getStatus() == BankAccountStatus.UNVERIFIED
              )
            ) &&
            newBankAccount.getStatus() == BankAccountStatus.VERIFIED;
        }

        if (
          (hasVerifiedBankAccount && justPassedCompliance) ||
          (passedCompliance && justVerifiedBankAccount)
        ) {
          agency.submit(x, new ContextAgent() {
            @Override
            public void execute(X x) {
              migrateContactsAndInvoices(x, business);
            }
          }, "Contact Migration Rule");
        }
      `
    },
    {
      name: 'migrateContactsAndInvoices',
      args: [
        {
          type: 'foam.core.X',
          name: 'x'
        },
        {
          type: 'net.nanopay.model.Business',
          name: 'business'
        }
      ],
      javaCode: `
        DAO tokenDAO = ((DAO) x.get("localTokenDAO")).inX(x);

        ExternalContactToken token = (ExternalContactToken) tokenDAO
          .find(EQ(ExternalContactToken.BUSINESS_ID, business.getId()));

        if ( token == null ) {
          Logger logger = (Logger) x.get("logger");
          logger.warning("Token is null when migrating the contact.");
          return;
        }

        String inviteeEmail = token.getBusinessEmail();

        DAO localContactDAO = ((DAO) x.get("localContactDAO")).inX(x);
        ArraySink contactSink = (ArraySink) localContactDAO
          .where(EQ(Contact.EMAIL, inviteeEmail))
          .select(new ArraySink());
        List<Contact> contacts = contactSink.getArray();

        /**
         * Update the contacts based on the original contact's email
         * which is stored in the external contact token.
         */
        for ( Contact contact : contacts ) {
          Contact updatedContact = (Contact) contact.fclone();
          updatedContact.setBusinessId(business.getId());
          updatedContact.setSignUpStatus(ContactStatus.READY);
          updatedContact.setEmail(business.getEmail());
          localContactDAO.put(updatedContact);
          migrateInvoices(x, contact, business);
        }
      `
    },
    {
      name: 'migrateInvoices',
      args: [
        {
          type: 'foam.core.X',
          name: 'x'
        },
        {
          type: 'net.nanopay.contacts.Contact',
          name: 'contact'
        },
        {
          type: 'net.nanopay.model.Business',
          name: 'business'
        }
      ],
      javaCode: `
        DAO invoiceDAO = ((DAO) x.get("invoiceDAO")).inX(x);
        long contactId = contact.getId();
        ArraySink sink = (ArraySink) invoiceDAO
          .where(OR(
            EQ(Invoice.PAYEE_ID, contactId),
            EQ(Invoice.PAYER_ID, contactId)))
          .select(new ArraySink());
        List<Invoice> invoices = sink.getArray();

        for ( Invoice invoice : invoices ) {
          Invoice updatedInvoice = (Invoice) invoice.fclone();

          if ( invoice.getPayerId() == contactId ) {
            updatedInvoice.setPayerId(business.getId());
          } else {
            updatedInvoice.setPayeeId(business.getId());
          }

          invoiceDAO.put(updatedInvoice);
        }
      `
    }
  ]
});
