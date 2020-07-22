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
  package: 'net.nanopay.contacts.ui.modal',
  name: 'BusinessNameSearch',

  documentation: 'Property modal for BusinessNameSearchWizardView.',

  implements: [
    'foam.mlang.Expressions'
  ],

  requires: [
    'foam.dao.NullDAO',
    'foam.dao.PromisedDAO',
    'foam.mlang.sink.Count',
    'net.nanopay.auth.PublicBusinessInfo',
    'net.nanopay.contacts.Contact',
    'net.nanopay.model.Business'
  ],

  imports: [
    'publicBusinessDAO',
    'user',
    'theme'
  ],

  sections: [
    {
      name: 'search',
      title: 'Search by Business Name',
      subTitle: function() {
        return this.SEARCH_BUSINESS_1 + this.theme.appName + this.SEARCH_BUSINESS_2
      }
    },
    {
      name: 'confirmation',
      title: ''
    }
  ],

  messages: [
    { name:'SEARCH_BUSINESS_1', message:'Search a business on '},
    { name:'SEARCH_BUSINESS_2', message:' to add them to your contacts. For better results, search using their registered business name and location.'}
  ],

  properties: [
    {
      class: 'String',
      name: 'filter',
      documentation: 'This property is the data binding for the search field',
      section: 'search',
      label: 'Business Name',
      placeholder: 'Search business name',
      type: 'search',
      view: {
        class: 'foam.u2.view.IconTextFieldView',
        icon: 'images/ablii/search.png',
        onKey: true,
        focused: true
      }
    },
    {
      class: 'Int',
      name: 'connectedCount',
      documentation: `
        The number of connected businesses in the
        connctedBusiness dao after filtering.
      `,
      section: 'search',
      visibility: 'HIDDEN'
    },
    {
      class: 'Int',
      name: 'unconnectedCount',
      documentation: `
        The number of unconnected businesses in the
        unconnctedBusiness dao after filtering.
      `,
      section: 'search',
      visibility: 'HIDDEN'
    },
    {
      class: 'Int',
      name: 'countBusinesses',
      documentation: `
        Total number of businesses after filtering
        including the connected and unconnected businesses.
      `,
      section: 'search',
      visibility: 'HIDDEN',
      expression: function(connectedCount, unconnectedCount) {
        return connectedCount + unconnectedCount;
      }
    },
    {
      class: 'StringArray',
      name: 'permissionedCountries',
      documentation: 'Array of countries user has access to based on currency.read.permission',
      section: 'search',
      visibility: 'HIDDEN',
      factory: function(){
        return  [this.user.address.countryId];
      }
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'unconnectedBusinesses',
      documentation: `
        This property is to query all unconnected businesses related to
        the current acting business.
      `,
      section: 'search',
      visibility: 'HIDDEN',
      expression: function(filter) {
        if ( filter.length < 2 ) {
          return this.NullDAO.create({ of: this.PublicBusinessInfo });
        } else {
          return this.PromisedDAO.create({
            promise: this.user.contacts
              .select(this.MAP(this.Contact.BUSINESS_ID))
              .then((mapSink) => {
                var dao = this.publicBusinessDAO
                  .where(
                    this.AND(
                      this.NEQ(this.Business.ID, this.user.id),
                      this.OR(
                        this.CONTAINS_IC(this.Business.ORGANIZATION, filter),
                        this.CONTAINS_IC(this.Business.OPERATING_BUSINESS_NAME, filter)
                      ),
                      this.NOT(this.IN(this.Business.ID, mapSink.delegate.array)),
                      this.IN(this.DOT(net.nanopay.model.Business.ADDRESS, foam.nanos.auth.Address.COUNTRY_ID), this.permissionedCountries)
                    )
                  );
                dao
                  .select(this.Count.create())
                  .then((sink) => {
                    this.unconnectedCount = sink != null ? sink.value : 0;
                  });
                return dao;
              })
          });
        }
      }
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'connectedBusinesses',
      documentation: `
        This property is to query all connected businesses related to
        the current acting business.
      `,
      section: 'search',
      visibility: 'HIDDEN',
      expression: function(filter) {
        if ( filter.length < 2 ) {
          return this.NullDAO.create({ of: this.PublicBusinessInfo });
        } else {
          return this.PromisedDAO.create({
            promise: this.user.contacts
              .select(this.MAP(this.Contact.BUSINESS_ID))
              .then((mapSink) => {
                var dao = this.publicBusinessDAO
                  .where(
                    this.AND(
                      this.NEQ(this.Business.ID, this.user.id),
                      this.OR(
                        this.CONTAINS_IC(this.Business.ORGANIZATION, filter),
                        this.CONTAINS_IC(this.Business.OPERATING_BUSINESS_NAME, filter)
                      ),
                      this.IN(this.Business.ID, mapSink.delegate.array)
                    )
                  );
                dao
                  .select(this.Count.create())
                  .then((sink) => {
                    this.connectedCount = sink != null ? sink.value : 0;
                  });
                return dao;
              })
          });
        }
      }
    },
    {
      class: 'String',
      name: 'searchBusinessesCount',
      documentation: `Construct the searching count string.`,
      section: 'search',
      visibility: 'HIDDEN',
      expression: function(filter, countBusinesses) {
        if ( filter.length > 1 ) {
          if ( countBusinesses > 1 ) {
            return `Showing ${countBusinesses} of ${countBusinesses} results`;
          } else {
            return `Showing ${countBusinesses} of ${countBusinesses} result`;
          }
        }
        return '';
      }
    },
    {
      name: 'businessList',
      documentation: 'Display property for the list of queried businesses.',
      section: 'search',
      label: '',
      view: { class: 'net.nanopay.contacts.ui.modal.BusinessListView' }
    },
    {
      class: 'FObjectProperty',
      name: 'contact',
      documentation: 'The contact object of the selected business.',
      section: 'confirmation',
      label: '',
      view: { class: 'net.nanopay.contacts.ui.modal.ContactConfirmationView' }
    }
  ]
});
