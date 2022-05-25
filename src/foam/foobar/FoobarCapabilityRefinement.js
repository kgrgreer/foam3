foam.CLASS({
    package: 'foam.foobar',
    name: 'FoobarCapabilityRefinement',
    refines: 'foam.nanos.crunch.Capability',

    properties: [
        {
            class: 'Map',
            name: 'args',
            documentation: `
                Initial values for a capability's data, corresponding to the
                model specified by 'of'.
            `
        }
    ]
});