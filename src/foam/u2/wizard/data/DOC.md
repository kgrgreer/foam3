
# Wizard Data Access

## Helpful Definitions

### Types of CRUNCH Wizards

There are three types of CRUNCH wizards with respect to data access:
- UCJ Wizard
- Capable Wizard
- Transient Wizard

The **Loader** and **Saver** interfaces were created to allow data to move
between wizardlets and make any flow possible for UX purposes. This also
allows Capability-defined wizards that interact with data outside of CRUNCH,
including context, service calls, DAOs, etc. These wizards are called
"transient wizards" because the data inside the capabilities that make
up the wizard are discarded once it is completed, and the only data that
persist are those which are saved elsewhere.

#### UCJ Wizard

A UCJ wizard is created using `CrunchController.createWizardSequence`.
The **WAOSettingAgent** has the default setting of `UCJ`, which means
wizardlets will be given a UserCapabilityJunctionWAO by default.

Note that if a wizard has a ProxyWAO chain with no terminal WAO the chain
will become decorators on what WAOSettingAgent provides.

Each wizardlet's data will be wrapped in a **UserCapabilityJunction**
and stored in `userCapabilityJunctionDAO`.

#### Capable Wizard

A Capable wizard is created using `CrunchController.createCapableWizardSequence`,
where an object implementing **Capable** must be provided.
The **WAOSettingAgent** is set to `CAPABLE`, which means wizardlets will
be given a CapableWAO by default.

Each wizardlet's data will be wrapped in a **CapabilityJunctionPayload**
and stored in the `capablePayloads` property of the **Capable** object.

#### Transient Wizard

While UCJ and Capable wizards are defined by capabilities that describe the
required data and dependencies between them,
transient wizards are defined by capabilities that describe UI/UX requirements
(or "screens") and the dependencies between them.

A Transient Wizard is a special case of Capable wizard. The provided
**Capable** object is simply an instance of **BaseCapable** and is
meant to be discarded at the end of the wizard flow.

## Classes

```
// TODO: If these descriptions are moved to the 'documentation' property of the
//   respective models, can this section of the markdown file be generated?
```

### SplitWAO (`foam.u2.wizard.wao`)

The **SplitWAO** implementation of **WAO** allows the **Loader**s and **Saver**s
to be used in wizardlets.

By default, SplitWAO uses **NullSaver** and **NullLoader**.

Currently NullSaver doesn't delegate to the next WAO, so even though SplitWAO
extends ProxyWAO it will not delegate to the next WAO by default. This is by
design as SplitWAO is intended for use in transient wizards.

### Loader (interface)

A Loader implements the asynchronous method `load({})`. This method may return
any value.

The method uses named parameters, so an object (empty or otherwise) must be
passed as the first argument.

The `old` parameter of this method can specify existing data before loading,
which loaders can use in any way. However, a loader should never fail if this
value is undefined.

### Saver (interface)

A Saver implements the asynchronous method `save(data)`. This method should
return the object that was saved, or a new version of the object after saving.

Typically savers are idempotent, so if you call a saver with the same object
more than once it should not produce any side-effects not observed when calling
only once.

### Canceler (interface)

A canceler implements the asynchronous method `cancel()`. This can be used to
implement what happens when a wizardlet's `isAvailable` property changes to
`false`.

### CreateLoader

CreateLoader simply yields an FObject created according to the given spec.

Example (in a wizardlet's spec)

```javascript
wao: {
  class: 'foam.u2.wao.SplitWAO',
  loader: {
    class: 'foam.u2.wizard.data.CreateLoader',
    spec: {
      class: 'foam.nanos.cron.TimeHMS',
      hour: 1,
      minute: 2,
      second: 3
    }
  }
}
```

### ContextLoader

ContextLoader will load a value from the context specified by `path`.
Dotted paths are handled intuitively, so a path of `subject.user.id`
will provide the user's id as a raw (not wrapped by a holder) value.

Example (in a wizarldet's spec)

```javascript
wao: {
  class: 'foam.u2.wao.SplitWAO',
  loader: {
    class: 'foam.u2.wizard.data.ContextLoader',
    path: 'subject.user.id'
  }
}
```

### CopyPayloadsLoader

This loader has two delegates: `capableLoader` and `delegate`.
`capableLoader` should yield a Capable object, as should `delegate`.
Payloads on the object obtained from `capableLoader` will be copied
to the object obtained from `delegate`.

### MapLoader

MapLoader allows loading values into a map. By default it delegates to a `CreateLoader` which creates a `MapHolder`. Therefore, the value obtained by a `MapHolder` with no arguments is a `MapHolder` with an empty map as its `value`.

Example (in a wizardlet's spec):

```javascript
wao: {
  class: 'foam.u2.wizard.wao.SplitWAO',
  loader: {
    class: 'foam.u2.wizard.data.MapLoader',
    args: {
      userId: {
        class: 'foam.u2.wizard.data.ContextLoader',
        path: 'subject.user.id'
      }
    }
  }
}
```

The example above will take `subject.user.id` from context and load it into the `userId` key of the `MapHolder`'s `value`.

### DAOSaver

Simply saves the data to the specified DAO.

### InlineTransientSaver

InlineTransientSaver is a "side-effect" ProxySaver which allows a transient wizard to be loaded dynamically. This could be based on a requirement from another service, known by another wizardlet or in context.

Example (in a wizardlet's spec)

```javascript
wao: {
  class: 'foam.u2.wao.SplitWAO',
  saver: {
    class: 'foam.u2.wizard.data.InlineTransientSaver',
    wizardSpecLoader: {
      class: 'foam.u2.wizard.data.PrerequisiteLoader',
      prerequisiteCapabilityId: 'net.nanopay.transfer.TestRequestQuotePut',
      loadFromPath: 'selectedPlan'
    }
  }
}
```

The `wizardSpecLoader` should be a `Loader` that gets a "wizard spec" (a capability's `id` or a Capable object). In the example above, the wizard spec is loaded from a property called `selectedPlan` on a prerequisite's data. In this case `selectedPlan` holds a `Capable`.

### LoaderInjectorSaver

LoaderInjectorSaver is a "side effect" ProxySaver which changes the `loader` of a SplitWAO on a proceeding wizardlet. This is useful when you want to re-use a CRUNCH subtree for some transient wizard but would like it to obtain data from a different location (perhaps another prerequisite of the aggregating capability). This is intended to provide a better alternative to `FacadeWizardlet` and `FacadeWizardletSaver`.

```
wao: {
  class: 'foam.u2.wizard.wao.SplitWAO',
  saver: {
    class: 'foam.u2.wizard.data.LoaderInjectorSaver',
    wizardletId: 'bank_CA_data',
    loader: {
      class: 'foam.u2.wizard.data.PrerequisiteLoader',
      prerequisiteCapabilityId: 'myTransientWizard_selectedAccount'
    }
  }
}
```

The example above is a saver that will replace the loader on a capability called `bank_CA_data` so it contains the desired bank account by the time the user reaches that screen.