/**
 * This refinement is necessary because of the way the class loader works.
 *
 * CreatedBy property is a reference of User however User model has property
 * that reference to File therefore a separate refinement is needed to add
 * The CreatedBy property after both File and User models are loaded.
 */
foam.CLASS({
  package: 'foam.nanos.fs',
  name: 'FileCreatedByAwareRefinement',
  refines: 'foam.nanos.fs.File',

  implements: [
    'foam.nanos.auth.CreatedAware',
    'foam.nanos.auth.CreatedByAware'
  ],

  mixins: [
    'foam.nanos.auth.CreatedAware',
    'foam.nanos.auth.CreatedByAware'
  ]
});
