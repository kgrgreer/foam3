### How to remove duplicate functionality between a similar Loader and Saver

By adding MutationLoader and MutationSaver, mutations of data or side-effects
that may occur in either a Loader or Saver don't need to be implemented twice.

Loader

ProxyLoader

MutationLoader
- A ProxyLoader that executes a mutation, then calls the delegate Loader with
  the new object

Saver

ProxySaver

MutationSaver
- A ProxySaver that executes a mutation, then calls the delegate Saver with
  the new object

Mutation
- An asynchronous function that takes an input and produces an output.
- The method should be named `af()` meaning Asynchronous Functor.

SideEffectMutation
- extends ContextAgent
- `af()` method calls `execute()` and returns the same data that was given.
