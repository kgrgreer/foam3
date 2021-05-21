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
  package: 'net.nanopay.bank',
  name: 'BankWeekend',

  implements: [
    'foam.mlang.Expressions'
  ],

  properties: [
    {
      class: 'Reference',
      of: 'foam.nanos.auth.Country',
      name: 'countryId',
      view: function(_, X) {
        return foam.u2.view.ChoiceView.create({
          dao: X.countryDAO,
          objToChoice: function(a) {
            return [a.id, a.name];
          },
          placeholder: 'Select a Country'
        });
      }
    },
    {
      class: 'Reference',
      targetDAOKey: 'regionDAO',
      name: 'regionId',
      label: 'Region',
      of: 'foam.nanos.auth.Region',
      view: function(_, X) {
        var choices = X.data.slot(function(countryId) {
          return X.regionDAO.where(this.EQ(foam.nanos.auth.Region.COUNTRY_ID, countryId || ''));
        });
        return foam.u2.view.ChoiceView.create({
          placeholder: 'Select a Region',
          objToChoice: function(region) {
            return [region.id, region.name];
          },
          dao$: choices
        });
      }
    },
    {
      class: 'Boolean',
      name: 'saturday',
      value: true
    },
    {
      class: 'Boolean',
      name: 'sunday',
      value: true
    }
  ]
});
