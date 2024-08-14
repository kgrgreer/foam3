/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.crunch.lite',
  name: 'CapableAdapterDAO',
  extends: 'foam.dao.AbstractDAO',

  javaImports: [
    'foam.core.X',
    'foam.dao.DAO',
    'foam.dao.MDAO',
    'foam.dao.Subscription',
    'java.util.Arrays',
    'java.util.ArrayList',
    'java.util.List',
    'foam.dao.ArraySink',
    'foam.nanos.crunch.CapabilityJunctionPayload'
  ],

  documentation: `
    Adapts a Capable object to the DAO interface.
  `,

  properties: [
    {
      name: 'capable',
      class: 'FObjectProperty',
      of: 'foam.nanos.crunch.lite.Capable'
    },
    // {
    //   name: 'of',
    //   value: 'foam.nanos.crunch.lite.CapablePayloads'
    // }
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
        CapabilityJunctionPayload payload = (CapabilityJunctionPayload) obj;

        CapabilityJunctionPayload[] payloads = getCapable().getCapablePayloads();
        for ( int i = 0 ; i < payloads.length ; i++ ) {
          if (
            payload.getCapability().equals(
              payloads[i].getCapability()
            )
          ) {
            payloads[i] = payload;
            return obj;
          }
        }

        payloads = Arrays.copyOf(payloads, payloads.length + 1);
        payloads[payloads.length - 1] = payload;
        getCapable().setCapablePayloads(payloads);
        return obj;
      `,
      code: async function (x, obj) {
        return this.ifFoundElseIfNotFound_(
          obj.capability,
          (payloads, i) => {
            payloads[i] = obj;
            this.pubPayloadsUpdate_();
            return obj;
          },
          (payloads) => {
            payloads.push(obj);
            this.pubPayloadsUpdate_();
            return obj;
          }
        );
      }
    },
    {
      name: 'remove_',
      javaCode: `
        CapabilityJunctionPayload payload = (CapabilityJunctionPayload) obj;

        CapabilityJunctionPayload[] payloads = getCapable().getCapablePayloads();

        List<CapabilityJunctionPayload> newPayloadsList = new ArrayList<>();

        for ( int i = 0; i < payloads.length; i++ ){
          if ( ! payload.getCapability().equals(payloads[i].getCapability()) ){
            newPayloadsList.add(payloads[i]);
          }
        }

        if ( payloads.length == newPayloadsList.size() ){
          return null;
        }

        CapabilityJunctionPayload[] newPayloads =
          newPayloadsList.toArray(new CapabilityJunctionPayload[0]);
        getCapable().setCapablePayloads(newPayloads);

        return obj;
      `,
      code: async function (x, obj) {
        return this.ifFoundElseIfNotFound_(
          obj.capability,
          (payloads, i) => {
            payloads.splice(i, 1);
            this.pubPayloadsUpdate_();
            return obj;
          },
          (payloads) => obj
        );
      }
    },
    {
      name: 'find_',
      javaCode: `
        CapabilityJunctionPayload obj = null;
        String idString = null;

        if ( id instanceof CapabilityJunctionPayload ) {
          obj = (CapabilityJunctionPayload) id;
          idString = obj.getCapability();
        } else {
          idString = (String) id;
        }

        var payloads = getCapable().getCapablePayloads();
        for ( int i = 0 ; i < payloads.length ; i++ ) {
          if ( payloads[i] == obj
            || payloads[i].getCapability().equals(idString)
          ) {
            return payloads[i];
          }
        }

        return null;
      `,
      code: async function (x, obj) {
        let capability = typeof obj == 'string'
          ? obj : obj.capability ;
        return this.ifFoundElseIfNotFound_(
          capability,
          (payloads, i) => { return payloads[i] },
          (payloads) => null
        );
      }
    },
    {
      name: 'select_',
      javaCode: `
        var decoratedSink = decorateSink(x, sink, skip, limit, order, predicate);
        var sub = new Subscription();

        for ( var payload : getCapable().getCapablePayloads() ) {
          if ( sub.getDetached() ) break;
          decoratedSink.put(payload, sub);
        }

        return sink;
      `,
      code: async function (x, sink, skip, limit, order, predicate) {
        var resultSink = sink || this.ArraySink.create({ of: this.of });
        sink = this.decorateSink_(resultSink, skip, limit, order, predicate);

        var detached = false;
        var sub = foam.core.FObject.create();
        sub.onDetach(function() { detached = true; });

        for ( const payload of this.capable.capablePayloads ) {
          if ( detached ) break;
          sink.put(payload, sub);
        }

        sink.eof();
        return sink;
      }
    },
    {
      name: 'ifFoundElseIfNotFound_',
      flags: ['web'],
      code: function (capability, ifFound, ifNotFound) {
        var found = false;
        var foundReturn = null;
        payloads = this.capable.capablePayloads;
        for ( var i = 0 ; i < payloads.length ; i++ ) {
          if ( capability == payloads[i].capability ) {
            foundReturn = ifFound(payloads, i);
            found = true;
          }
        }

        if ( found ) return foundReturn;
        return ifNotFound(payloads);
      }
    },
    {
      name: 'pubPayloadsUpdate_',
      flags: ['web'],
      code: function () {
        // A publish on propertyChange isn't enough here; slots won't update if
        //   the object is identical.
        var temp = [ ...this.capable.capablePayloads ];
        this.capable.capablePayloads = [];
        this.capable.capablePayloads.push(...temp);
      }
    }
  ]
});
