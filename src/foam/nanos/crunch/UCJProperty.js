/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.crunch',
  name: 'UCJProperty',
  extends: 'foam.mlang.predicate.PredicateProperty',
  documentation: `
    UCJProperty references a UCJ via a predicate. This property can be used to
    associate a UCJ with an instance either by UUID or by a subject and
    capability id.
    UCJProperty properties will render in an inline CRUNCH wizard.`
  `,

  imports: [
    'crunchService'
  ],

  properties: [
    ['transient', true],
    ['of', 'foam.nanos.crunch.UserCapabilityJunction'],
    {
      name: 'capability',
      class: 'String'
    },
    {
      name: 'view',
      value: { class: 'foam.u2.crunch.UCJReferenceView' }
    },
    {
      name: 'adapt',
      value: function (_, o) {
        const e = foam.mlang.Expressions.create();
        if ( foam.String.isInstance(o) ) {
          return e.EQ(foam.nanos.crunch.UserCapabilityJunction.ID, o);
        }
        if ( ! foam.Object.isInstance(o) && ! foam.Array.isInstance(o) ) {
          throw new Error('valid UCJProperty values are: string, object, array');
        }
        o = foam.Array.isInstance(o) ? { sourceId: o[0], targetId: o[1] } : o;
        return e.AND(
          e.EQ(
            foam.nanos.crunch.UserCapabilityJunction.SOURCE_ID,
            o.sourceId
          ),
          e.EQ(
            foam.nanos.crunch.UserCapabilityJunction.TARGET_ID,
            o.targetId
          )
        );
      }
    }
  ]
});
