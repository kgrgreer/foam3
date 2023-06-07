# Wizard Debugging Guide

```javascript
//@docmeta
{
    todo: [
        'document FluentSpec and link here',
        'update wizard inspector code after Kristina\'s PR is merged'
    ]
}
```

## Using the Wizard Inspector

Opening the wizard inspector in the console can be done with this code snippet:
```
ctrl.crunchController.lastActiveWizard.OPEN_WIZARD_INSPECTOR.code.call(
  ctrl.crunchController.lastActiveWizard
)
```

A popup blocker may prevent this from functioning. This will open the wizard
inspector for the active wizard. In theory there should only be one wizard
running at a time since any action that tries to launch a new wizard should
inline its wizardlets with the currently active one. This assumption is
accurate when WizardRunner is used but could be violated when wizards are
opened using other methods.

## How is your wizard opened?

There are different types of events that can trigger a wizard, so if you want
to find the code or configuration ((WizardFlow/)Sequence or Capability) that describes a wizard you may need to first identify how it's being opened.
**These are the usual ways a wizard is invoked:**
- User clicks a menu of class SequenceMenu...
  - ...and the sequence is one that launches a wizard
    - all sequences are wizard sequences (at the time of writing this),
      but this is circumstancial/incidental.
- User clicks a capability in the Crunch Store
- User tries to perform an action that results in a CRUNCH intercept
- User has signed in and needs to complete general admission

Sometimes something may not look like a wizard but it's using wizard technology.
A good clue that this is happening is if something in the UI changes dynamically
based on CRUNCH. Here are a couple examples:
- NANOS' approval subsystem displays a user's capability data when an operator
  is reviewing approval requests. This involves all of the wizard ingredients:
  a launch sequence, a wizard controller, and a wizard view; but it's included
  inside another page rather than displaying in a popup.
- Crunch Lab and CRUNCH wizards both use GraphBuilder to manage the complexity
  of traversing a DAG (directed acyclic graph - the data structure of CRUNCH).

### SequenceMenu Wizards

If you click a menu item and a wizard opens as a result, chances are it was
launched by a SequenceMenu. Keep in mind that other UI buttons outside the
app's navigation view may launch a menu.
When you find the menu entry, it will look something like this:

```javascript
p({
    id: 'some-menu',
    handler: {
        class: 'foam.nanos.menu.SequenceMenu',
        parentMethod: ['crunchController', 'createWizardSequence'],
        sequence: [
            // ...
        ]
    }
})
```

There are a couple things to unpack here: `parentMethod` and `sequence`.
- `parentMethod` is a tuple of [contextKey, method name] and should point
to a method that returns a Sequence. For wizards these are methods of
`crunchController` such as `createWizardSequence` or
`createTransientWizardSequence`. Most of the sequences are actually
modified versions of what `createWizardSequence` returns.
- `sequence` is an array of FluentSpec objects which modify the sequence.

There are also a couple different configuations of a wizard sequence you
might come across:
- the legacy configuration (let's call it V1 for this doc)
- the WizardFlow configuration (let's call it V2 for this doc)
- the ideal future configuration (let's call it V* for this doc)

#### V1: Legacy SequenceMenu Configuration

- Sequence is based on `createWizardSequence` or `createTransientSequence`
- Explicit configuration exists to replace the old wizardlet creation logic
  with the new wizardlet creation logic:

  ```
  {
    class: "foam.util.AddBeforeFluentSpec",
    reference: "CreateWizardletsAgent",
    spec: {
      class: "foam.u2.crunch.wizardflow.LoadCapabilityGraphAgent"
    }
  },
  {
    class: "foam.util.AddBeforeFluentSpec",
    reference: "CreateWizardletsAgent",
    spec: {
      class: "foam.u2.crunch.wizardflow.GraphWizardletsAgent"
    }
  },
  {
    class: "foam.util.RemoveFluentSpec",
    reference: "CreateWizardletsAgent"
  }
  ```

#### V2: WizardFlow SequenceMenu Configuration

WizardFlow implements a DSL [*] that can be used to describe the composition
of a wizard *(domain-specific language - specifically a Fluent DSL in this case).

WizardFlow extends Sequence, so configuration of the wizard still involves the
addition, removal, and modification of context agents. Instead of using
FluentSpecs in a journal a DSL is used. This has some advantages[^1] and some
caveats[^2].

To configure a SequenceMenu to use a WizardFlow:
- `parentMethod` should be set to `['crunchController', 'createWizardFlowSequence']`
- `sequence` should (ideally[^3]) add only this one context agent:
  ```javascript
  sequence: [
    {
      class: 'foam.util.AddBeforeFluentSpec',
      reference: 'ShowPreexistingAgent',
      spec: {
        class: 'com.example.SomeWizardFlow'
      }
    }
  ]
  ```
  The context agent `ShowPreexistingAgent` is used as a semi-arbitrary[^4]
  reference point.

[^1]: Since WizardFlow wizards are just classes and don't have any server-side
  code, chances to wizards can be tested without restarting the server or
  re-deploying journals

[^2]: The wizard DSL is a good example of code-as-data-as-code. To break it down
  (in reverse): the **code** written using the DSL describes **data** which
  describes the **code** that will launch the wizard.
  This paradigm is very advantageous when used correctly, but it's also possible
  to write code-as-(code-and-data)-as-code as a way of introducing
  metaprogramming.
  While metaprogramming has merits, this method of introducing it results in the
  loss of the data representation of the resulting behaviour.
  The Fluent design pattern helps to prevent this because it discourages inserting
  arbitrary code outside of the DSL, for example it doesn't break chaining when
  QuickAgent is used to add conditional behaviour in a WizardFlow, and when this
  is done there exists a context agent in the sequence to describe - of nothing
  else - at least the fact that a context agent containing business logic exists.

[^3]: Wizards migrated from the "V1 configuration" may have context agents
  that were left in the SequenceMenu. When possible these should be moved into
  the respective WizardFlow instead.

[^4]: What's meant by "semi-arbitrary" is that the WizardFlow needs to run after
  specific context agents and before other specific context agents, and there is
  a range of context agents which the WizardFlow could be placed before that
  will all result in correct behaviour. ShowPreexistingAgent is one of these.
  There could be a better way[^5] to do this in the future.

[^5]: When you remove a context agent from a sequence the `Step` - an item
  Sequence stores to represent a context agent that will be run - remains with
  the same name but its context agent is replaced with NullAgent so it has no
  behaviour. This is done so that `addBefore` will still put a context agent in
  the correct location even though the reference point doesn't exist anymore.
  However, it might be better to have instead added support for explicitly named
  "anchor points" in a Sequence that would be referred to instead of arbitrary
  context agents.


#### V*: WizardMenu, WizardRunner, and Reduced Configuration

There are potential future improvements that will reduce the amount of
configuration required and thereby make configuration less error-prone:
- Add a WizardMenu which creates the base sequence and adds the specified
  WizardFlow to it in the correct location.
  - WizardMenu could use WizardRunner, which already knows how to do this.
- A WizardType could be specified instead of a base sequence. This would
  make wizards easier to maintain because there would be less possible
  variation of the base sequence.
  - WizardRunner knows how to do this also.
- Missing implementations shouild be added to WizardRunner.
