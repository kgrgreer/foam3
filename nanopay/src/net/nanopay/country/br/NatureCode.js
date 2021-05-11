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
  package: 'net.nanopay.country.br',
  name: 'NatureCode',
  extends: 'foam.nanos.crunch.Capability',

  messages: [
    { name: 'ENTER_NATURE_CODE', message: 'Please enter a Nature Code' }
  ],

  properties: [
    {
      name: 'id'
    },
    {
      name: 'name',
      required: true
    },
    {
      class: 'String',
      name: 'operationType',
      validateObj: function(operationType) {
        var regex = /^[0-9]{5}$/;
        if ( ! regex.test(operationType) ) {
          return this.ENTER_NATURE_CODE;
        }
      },
      section: 'basicInfo'
    },
    {
      class: 'Int',
      name: 'tipo',
      description: 'Mapped property that gets sent to the property to exchange',
      value: 4,
      hidden: true
    },
    {
      name: 'icon',
      hidden: true
    },
    {
      name: 'description',
      hidden: true
    },
    {
      name: 'notes',
      hidden: true
    },
    {
      name: 'price',
      hidden: true
    },
    {
      name: 'keywords',
      hidden: true
    },
    {
      name: 'version',
      hidden: true
    },
    {
      name: 'enabled',
      hidden: true
    },
    {
      name: 'visible',
      hidden: true
    },
    {
      name: 'expiry',
      hidden: true
    },
    {
      name: 'duration',
      hidden: true
    },
    {
      name: 'gracePeriod',
      hidden: true
    },
    {
      name: 'of',
      hidden: true,
      value: net.nanopay.country.br.NatureCodeData
    },
    {
      name: 'permissionsGranted',
      hidden: true
    },
    {
      name: 'permissionsIntercepted',
      hidden: true
    },
    {
      name: 'daoKey',
      hidden: true
    },
    {
      name: 'contextDAOFindKey',
      hidden: true
    },
    {
      name: 'interceptIf',
      hidden: true
    },
    {
      name: 'availabilityPredicate',
      hidden: true
    },
    {
      name: 'reviewRequired',
      hidden: true
    },
    {
      name: 'associatedEntity',
      hidden: true
    },
    {
      name: 'wizardlet',
      transient: true,
      hidden: true
    },
    {
      name: 'wizardletConfig',
      transient: true,
      hidden: true
    },
    {
      name: 'dependents',
      hidden: true
    },
    {
      name: 'prerequisites',
      hidden: true
    },
    {
      name: 'deprecating',
      hidden: true
    },
    {
      name: 'deprecated',
      hidden: true
    },
    {
      name: 'users',
      hidden: true
    },
    {
      name: 'categories',
      hidden: true
    }
  ],

  methods: [
    function toSummary() {
      return this.toString();
    },
    {
      name: 'toString',
      type: 'String',
      code: function() {
        return this.operationType + ' - ' + this.name;
      },
      javaCode: `
        return getOperationType() + " - " + getName();
      `
    }
  ]
});
