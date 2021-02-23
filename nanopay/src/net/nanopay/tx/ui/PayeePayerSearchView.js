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
  package: 'net.nanopay.tx.ui',
  name: 'PayeePayerSearchView',
  extends: 'foam.u2.Controller',

  documentation: 'A custom search view to facilitate searching transactions by payer or payee name.',

  implements: [
    'foam.mlang.Expressions'
  ],

  requires: [
    'foam.dao.ArraySink',
    'foam.nanos.auth.User',
    'net.nanopay.account.Account',
    'net.nanopay.tx.model.Transaction'
  ],

  imports: [
    'accountDAO',
    'userDAO'
  ],

  css: `
    ^ {
      padding: 24px 16px;
      box-sizing: border-box;
      min-width: 214px;
    }
  `,

  properties: [
    {
      class: 'String',
      name: 'payerOrPayeeName',
      label: 'Name',
      trim: true,
      placeholder: 'Press Enter key to submit',
      view: { class: 'foam.u2.TextField', focused: true },
      postSet: async function(_, name) {
        if ( ! name ) {
          this.predicate = this.True.create();
          return;
        }

        // Look up users/businesses
        var sink = await this.userDAO
          .where(
            this.OR(
              this.CONTAINS_IC(this.User.ORGANIZATION, name),
              this.CONTAINS_IC(this.User.BUSINESS_NAME, name),
              this.CONTAINS_IC(this.User.FIRST_NAME, name),
              this.CONTAINS_IC(this.User.LAST_NAME, name)
            )
          )
          .select(this.MAP(this.User.ID, this.ArraySink.create()));
        var userIds = sink.delegate.array;

        // Look up accounts
        sink = await this.accountDAO
          .where(this.IN(this.Account.OWNER, userIds))
          .select(this.MAP(this.Account.ID, this.ArraySink.create()));
        var accountIds = sink.delegate.array;

        // Set `predicate`
        this.predicate = this.OR(
          this.IN(this.Transaction.SOURCE_ACCOUNT, accountIds),
          this.IN(this.Transaction.DESTINATION_ACCOUNT, accountIds)
        );
      }
    },
    {
      class: 'foam.mlang.predicate.PredicateProperty',
      name: 'predicate',
      documentation: `All SearchViews must have a predicate as required by the
          SearchManager. The SearchManager will read this predicate and use it
          to filter the dao being displayed in the view.`,
      factory: function() {
        return this.True.create();
      }
    },
    {
      name: 'name',
      documentation: 'Required by SearchManager.',
      value: 'transaction payer/payee search view'
    }
  ],

  methods: [
    function initE() {
      this.SUPER();
      this.addClass(this.myClass());
      this.add(this.PAYER_OR_PAYEE_NAME);
    },

    /**
     * Clears the fields to their default values.
     * Required on all SearchViews. Called by ReciprocalSearch.
     */
    function clear() {
      this.payeeOrPayerName = '';
    }
  ]
});
