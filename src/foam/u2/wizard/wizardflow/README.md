# WizardFlow / Wizard DSL

WizardFlow is a [Fluent](../../../core/Fluent.js) DSL which describes the
creation of a wizard.

WizardFlow is also a [Sequence](../../../util/async/Sequence.js). Each call to
`.tag` or `.start` results in a ContextAgent being added to the sequence.

When a wizard is launched using this WizardFlow, the WizardFlow is installed
into the launch sequence and then this sequence is executed.

### Adding CRUNCH Requirements

We can add CRUNCH requirements to the wizard using the `AddCapabilityHierarchy`
context agent.

```javascript
foam.CLASS({
    package: 'com.example',
    name: 'MyWizardFlow',
    extends: 'foam.u2.wizard.wizardflow.WizardFlow',
    methods: [
        function sequence () {
            this
                .tag(this.EasyCrunchWizard, {})
                .tag(this.AddCapabilityHierarchy, {
                    capability: 'someCapability',
                    type: this.WizardType.UCJ
                })
        }
    ]
});
```

`capability` specifies the ID of the parent capability. All capabilities in
the tree (prerequisites of the parent) will be included as needed.
Each capability will generate up to 2 wizardlets - one occurring after its
prerequisites, and sometimes (ex: MinMaxCapability) one appearing before.

### Editing a Wizardlet

// TODO

### Adding a new Wizardlet

// TODO

### Decorating Loaders and Savers

// TODO

### Adding AlternateFlow Actions

// TODO

### Complicated Situations

// TODO

## Rationale Behind Launch Sequence

Using FOAM u2/u3, it would already be possible to describe something that
behaves like a wizard using a combination of StackView and custom logic.
The wizards created by `foam.u2.wizard` model more than just a sequence
of screens, however; these are dynamic wizards which may:
- change based on a user's state in CRUNCH
- be executed in different views (scrolling vs incremental)
- have heterogenous data sources/destinations (UCJs, DAOs, capable objects)
- be required to request arbitrary information mid-flow by the server
- route the user through different pathways based on previous input

It is therefore not possible to define the wizard statically. Instead
what is defined are instructions for creating the correct wizard - or at
least, the correct initial state for the wizard.

A wizard sequence may do things such as:
- include a capability hierarchy
- modify wizardlets from included capabilities
- add wizardlets for UX purposes (success screen, review page, etc)
- create alternate flow actions to minimize the number of clicks
- add wizardlets that allow the user to login or signup

## Rationale Behind Wizard DSL

Wizard sequences have been configured many different ways, including:
- base sequence written via Fluent in CrunchController
- sequenceExtras is capability's wizard config (EasyCrunchWizard)
- SequenceMenu using [FluentSpec](../../../util/FluentSpec.js)

Additionally, wizardlets meeting concerns like UX and getting an
authenticated user have been added via capabilities. This
creates a situation with two layers:
- capabilities representing data requirements
- capabilities representing other things:
  - UX requirements (success screen, review page, etc)
  - contextual requirements (an authenticated user)

The result of these additional capabilities for UX and contextual concerns
is either redundant capabilities (i.e. capability for each success screen), or
overengineered capability wizardlets (i.e. use LoaderInjectorSaver to configure
where a success screen loads its data from); consequentially either verbose
capability hierarchies or non-reusable capability hierarchies. (or, in some cases,
even both at the same time)

WizardFlow allows a wizard to be described as a sequence of instructions that
create the initial state, usually starting with wizardlets defined by capability
hierarchies and then adding mutations to meet other non-CRUNCH requirements.

Using this method, it is also possible to make a wizard that is completely
independant of any CRUNCH requirements.

## Writing a simple WizardFlow

### Boilerplate

A WizardFlow is created by extending WizardFlow and overriding a method named
`sequence`.

```javascript
foam.CLASS({
    package: 'com.example',
    name: 'MyWizardFlow',
    extends: 'foam.u2.wizard.wizardflow.WizardFlow',
    methods: [
        function sequence () {
            this
                .tag(this.EasyCrunchWizard, {})
        }
    ]
});
```

Here we added `EasyCrunchWizard` to the sequence. This is the configuration object.
Leaving it empty accepts the default configuration.
