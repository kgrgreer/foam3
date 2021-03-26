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
  package: 'net.nanopay.meter.clearing.ruler',
  name: 'BusinessClearingTimeRule',
  extends: 'net.nanopay.meter.clearing.ruler.ClearingTimeRule',

  javaImports: [
    'foam.nanos.logger.Logger',
    'foam.nanos.auth.User',
    'net.nanopay.account.Account',
    'net.nanopay.model.Business',
    'net.nanopay.meter.clearing.ClearingTimesTrait',
    'net.nanopay.tx.model.Transaction',
    'static foam.mlang.MLang.*'
  ],

  properties: [
    {
      class: 'Reference',
      of: 'net.nanopay.model.Business',
      name: 'business',
      required: true,
      view: function(_, X) {
        return {
          class: 'foam.u2.view.RichChoiceView',
          selectionView: { class: 'net.nanopay.auth.ui.UserSelectionView' },
          rowView: { class: 'net.nanopay.auth.ui.UserCitationView' },
          search: true,
          sections: [
            {
              heading: 'Businesses',
              dao: X.businessDAO
            }
          ]
        };
      },
      section: 'basicInfo'
    },
    {
      name: 'duration',
      validationPredicates: [ ]
    },
    {
      name: 'action',
      javaGetter: `
        return (x, obj, oldObj, ruler, rule, agency) -> {
          if ( ! (obj instanceof ClearingTimesTrait) ) {
            return;
          }

          Transaction transaction = (Transaction) obj;
          Account account = findAccount(x, transaction);
          User owner = account.findOwner(x);

          if ( owner instanceof Business
            && getBusiness() == owner.getId()
          ) {
            incrClearingTime(transaction);
            if ( getDuration() < 0 ) {
              int totalClearingTime = ((ClearingTimesTrait) transaction)
                .getClearingTimes().values().stream()
                .map(Long::intValue)
                .reduce(0, Integer::sum);
              if ( totalClearingTime < 0 ) {
                String message = String.format(
                  "Rule %s (duration: %d) causes transaction %s total clearing time: %d.",
                  getId(), getDuration(), transaction.getId(), totalClearingTime);
                ((Logger) x.get("logger")).info(message, this, transaction);
              }
            }
          }
        };
      `
    }
  ]
});
