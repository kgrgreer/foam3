foam.CLASS({
  package: 'net.nanopay.meter.clearing.ruler',
  name: 'BusinessClearingTimeRule',
  extends: 'net.nanopay.meter.clearing.ruler.ClearingTimeRule',

  javaImports: [
    'foam.nanos.logger.Logger',
    'foam.nanos.auth.User',
    'net.nanopay.account.Account',
    'net.nanopay.model.Business',
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
      }
    },
    {
      name: 'duration',
      validationPredicates: [ ]
    },
    {
      name: 'action',
      javaGetter: `
        return (x, obj, oldObj, ruler, agency) -> {
          Transaction transaction = (Transaction) obj;
          Account account = findAccount(x, transaction);
          User owner = account.findOwner(x);

          if ( owner instanceof Business
            && getBusiness() == owner.getId()
          ) {
            incrClearingTime(transaction);
            if ( getDuration() < 0 ) {
              int totalClearingTime = transaction.getClearingTimes().values()
                .stream().reduce(0, Integer::sum);
              if ( totalClearingTime <= 0 ) {
                String message = String.format(
                  "Rule %d (duration: %d) causes transaction %s total clearing time: %d.",
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
