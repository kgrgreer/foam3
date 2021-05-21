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
  name: 'NatureCodePaymentProviderJunctionRefinement',
  refines: 'net.nanopay.country.br.NatureCodePaymentProviderJunction',

  properties: [
    {
      class: 'Long',
      name: 'id',
    },
    {
      class: 'String',
      name: 'sourceId',
      view: function(_, X) {
        return foam.u2.view.ChoiceView.create({
          objToChoice: function(natureCode) {
            return [natureCode.id, natureCode.name];
          },
          dao: X.natureCodeDAO,
          placeholder: '--'
        });
      }
    },
    {
      class: 'String',
      name: 'targetId',
      view: function(_, X) {
        return foam.u2.view.ChoiceView.create({
          objToChoice: function(paymentProvider) {
            return [paymentProvider.id, paymentProvider.name];
          },
          dao: X.paymentProviderDAO,
          placeholder: '--'
        });
      }
    }
  ]
});
