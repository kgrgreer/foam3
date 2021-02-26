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
  package: 'net.nanopay.msp',
  name: 'MspInfo',
  ids: ['spid'],

  documentation: 'The base model for the Multi Service Provider Setup.',

  tableColumns: [
    'spid',
    'adminUserEmail',
    'adminUserFirstname',
    'adminUserLastname',
    'appName',
    'description'
  ],

  searchColumns: [
    'spid',
    'adminUserFirstname',
    'adminUserLastname',
    'appName'
  ],

  properties: [
    {
      class: 'String',
      name: 'spid',
      validationPredicates: [
        {
          args: ['spid'],
          predicateFactory: function(e) {
            return e.REG_EXP(net.nanopay.msp.MspInfo.ID, /^[a-z0-9]+$/);
          },
          errorString: 'Invalid character(s) in spid.'
        }
      ],
      required: true
    },
    {
      class: 'StringArray',
      name: 'capabilityPermissions'
    },
    {
      class: 'Reference',
      of: 'foam.nanos.theme.Theme',
      name: 'theme',
      documentation: `Reference existing theme to use as a template for the new spid.`,
      value: 'A7FBB672-D395-4C30-B5EE-F737B8079BCD',
      tableCellFormatter: function(value, obj, axiom) {
        this.__subSubContext__.themeDAO
          .find(value)
          .then(theme => this.add(theme.getName()))
          .catch(_ => {
            this.add(value);
          });
      },
      view: (_, X) => {
        return {
          class: 'foam.u2.view.RichChoiceView',
          search: true,
          sections: [
            {
              dao: X.themeDAO
            }
          ]
        };
      }
    },
    {
      class: 'EMail',
      name: 'adminUserEmail',
      required: true
    },
    {
      class: 'Password',
      name: 'adminUserPassword',
      required: true
    },
    {
      class: 'String',
      name: 'adminUserFirstname',
      required: true
    },
    {
      class: 'String',
      name: 'adminUserLastname',
      required: true
    },
    {
      class: 'StringArray',
      name: 'domain',
      factory: function() {
        return [];
      },
      javaFactory: 'return new String[0];',
      required: true
    },
    {
      class: 'String',
      name: 'appName',
      required: true
    },
    {
      class: 'String',
      name: 'description'
    },
    {
      class: 'String',
      name: 'backofficeGroupUrl',
      value: null
    },
    {
      class: 'String',
      name: 'smeGroupUrl',
      value: null
    },
    {
      class: 'StringArray',
      name: 'menuPermissions'
    },
    {
      class: 'StringArray',
      name: 'countryPermissions'
    },
    {
      class: 'StringArray',
      name: 'currencyPermissions'
    },
    {
      class: 'StringArray',
      name: 'corridorPermissions'
    },
    {
      class: 'StringArray',
      name: 'plannerPermissions'
    },
    {
      class: 'StringArray',
      name: 'businessMenuPermissions'
    },
  ]
});
