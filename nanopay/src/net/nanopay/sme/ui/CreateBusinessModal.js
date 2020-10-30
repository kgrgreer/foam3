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
  package: 'net.nanopay.sme.ui',
  name: 'CreateBusinessModal',
  extends: 'foam.u2.Controller',

  documentation: 'Create new business modal',

  requires: [
    'foam.log.LogLevel',
    'foam.nanos.auth.Address',
    'foam.nanos.auth.Country',
    'net.nanopay.model.Business'
  ],

  imports: [
    'businessDAO',
    'permittedCountryDAO',
    'notify'
  ],

  css: `
    ^ {
      width: 500px;
      background: white;
      padding: 20px;
    }
    .foam-u2-ActionView-closeModal {
      width: 60px;
      background: none !important;
      border: none !important;
      color: #525455;
      font-size: 16px;
      margin-right: 25px;
      position: relative;
      right: -525px;
    }
    ^ .description {
      font-size: 12px;
      text-align: center;
      margin-bottom: 20px;
    }
    ^ .foam-u2-ActionView-create {
      float: right;
    }
    ^ .foam-u2-TextField, ^ .foam-u2-tag-Select {
      width: 100%;
      margin-bottom: 20px;
    }
  `,

  properties: [
    {
      class: 'String',
      name: 'companyName'
    },
    {
      class: 'Reference',
      targetDAOKey: 'countryDAO',
      name: 'countryId',
      label: 'Country of operation',
      of: 'foam.nanos.auth.Country',
      documentation: 'Country address.',
      view: function(_, X) {
        var E = foam.mlang.Expressions.create();
        return foam.u2.view.ChoiceView.create({
          placeholder: 'Select your country',
          objToChoice: function(a) {
            return [a.id, a.name];
          },
          dao: X.data.permittedCountryDAO
        }, X);
      },
      required: true,
    },
    'updated'
  ],

  messages: [
    {
      name: 'DESCRIPTION',
      message: `
        Fill out information about your business. You'll be able to access
        this business on the switch business menu.`
    },
    { name: 'TITLE', message: 'Create a Business' },
    { name: 'SUCCESS_MESSAGE', message: 'Business successfully created' },
    { name: 'ERROR_MESSAGE', message: 'There was an error creating this business' }
  ],

  methods: [
    function initE() {
      this
        .addClass(this.myClass())
        .start('h2').add(this.TITLE).addClass('medium-header').end()
        .start().addClass('content')
          .start('p').addClass('description').add(this.DESCRIPTION).end()
          .start().addClass('input-label').add(this.COMPANY_NAME.label).end()
          .start(this.COMPANY_NAME).focus().end()
          .start().addClass('input-label').add(this.COUNTRY_ID.label).end()
          .start(this.COUNTRY_ID).end()
          .startContext({ data: this })
            .start()
              .start(this.CANCEL).end()
              .start(this.CREATE).end()
            .end()
          .endContext()
        .end();
    }
  ],

  actions: [
    {
      name: 'cancel',
      code: function(X) {
        X.closeDialog();
      }
    },
    {
      name: 'create',
      isEnabled: function(companyName, countryId) {
        return companyName && countryId;
      },
      code: async function(X) {
        var business = this.Business.create({
          organization: this.companyName,
          businessName: this.companyName,
          address: this.Address.create({ countryId: this.countryId }),
        });
        try {
          await this.businessDAO.put(business);
          this.updated = ! this.updated;
          this.notify(this.SUCCESS_MESSAGE, '', this.LogLevel.INFO, true);
        } catch (e) {
          this.notify(`${this.ERROR_MESSAGE} ${e}`, '', this.LogLevel.ERROR, true);
        }
        X.closeDialog();
      }
    }
  ]
});
