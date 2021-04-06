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

/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'net.nanopay.auth.email',
  name: 'DoNotSolicit',

  documentation: 'Email CASTLe opt-out registry.',

  // TODO: other services such as phone (sms), social media, ...

  implements: [
    'foam.nanos.auth.CreatedAware',
    'foam.nanos.auth.CreatedByAware',
    'foam.nanos.auth.LastModifiedAware',
    'foam.nanos.auth.LastModifiedByAware',
    'foam.nanos.auth.ServiceProviderAware'
  ],

  imports: [
    'userDAO',
  ],

  tableColumns: [
    'firstName',
    'lastName',
    'email',
    'doNotSolicit',
    'doNotContact',
  ],

  properties: [
    {
      class: 'String',
      name: 'id',
      visibility: 'RO'
    },
    {
      documentation: 'email of user opting out of solitations.',
      name: 'email',
      class: 'String',
      required: true
    },
    {
      name: 'firstName',
      class: 'String',
    },
    {
      name: 'lastName',
      class: 'String',
    },
    {
      documentation: 'Do not send solitation emails.',
      name: 'doNotSolicit',
      class: 'Boolean',
      value: true
    },
    {
      documentation: 'Do not email under any circumstances.',
      name: 'doNotContact',
      class: 'Boolean'
    },
    {
      name: 'notes',
      class: 'String',
      view: { class: 'foam.u2.tag.TextArea', rows: 5, cols: 80 },
    },
    {
      documentation: 'Creation date.',
      name: 'created',
      class: 'DateTime',
      visibility: 'RO',
    },
    {
      documentation: `The id of the user who created the transaction.`,
      name: 'createdBy',
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      visibility: 'RO',
      tableCellFormatter: function(value, obj) {
        obj.userDAO.find(value).then(function(user) {
          if ( user ) {
            if ( user.email ) {
              this.add(user.email);
            }
          }
        }.bind(this));
      }
    },
    {
      documentation: `The id of the agent who created the transaction.`,
      name: 'createdByAgent',
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      visibility: 'RO',
      tableCellFormatter: function(value, obj) {
        obj.userDAO.find(value).then(function(user) {
          if ( user ) {
            if ( user.email ) {
              this.add(user.email);
            }
          }
        }.bind(this));
      }
    },
    {
      documentation: 'Last modified date.',
      name: 'lastModified',
      class: 'DateTime',
      visibility: 'RO',
    },
    {
      documentation: `The id of the user who created the transaction.`,
      name: 'lastModifiedBy',
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      visibility: 'RO',
      tableCellFormatter: function(value, obj) {
        obj.userDAO.find(value).then(function(user) {
          if ( user ) {
            if ( user.email ) {
              this.add(user.email);
            }
          }
        }.bind(this));
      }
    },
    {
      name: 'lastModifiedByAgent',
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      visibility: 'RO',
      tableCellFormatter: function(value, obj) {
        obj.userDAO.find(value).then(function(user) {
          if ( user ) {
            if ( user.email ) {
              this.add(user.email);
            }
          }
        }.bind(this));
      }
    },
    {
      name: 'spid',
      class: 'Reference',
      of: 'foam.nanos.auth.ServiceProvider',
      readPermissionRequired: true
    }
  ]
});

