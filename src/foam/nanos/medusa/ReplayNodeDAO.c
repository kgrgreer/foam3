typedef struct {
  Integer maxRetryAttempts;
  foam.dao.Journal journal;
  Map clients;
  foam.dao.DAO delegate;
  Class of;
  multitype_union_t primaryKey;
} foam_nanos_medusa_ReplayNodeDAO_t;

multitype_union_t cmd_(Context x, multitype_union_t obj) {

        console_warn('Unrecognized command');
        return undefined;
      
}
Detachable listen_(Context x, foam.dao.Sink sink, foam.mlang.predicate.Predicate predicate) {

        var listener = this->ProxyListener_create({
          delegate: sink,
          predicate: predicate,
          dao: this
        }, context);

        listener_onDetach(this_sub('propertyChange', 'delegate', listener->update));
        listener_update();

        return listener;
      
}
foamtypes->FObject put_(Context x, foamtypes->FObject obj) {

              return this[property][name]_apply(this[property], arguments);
            
}
foamtypes->FObject remove_(Context x, foamtypes->FObject obj) {

              return this[property][name]_apply(this[property], arguments);
            
}
foamtypes->FObject find_(Context x, Object id) {

              return this[property][name]_apply(this[property], arguments);
            
}
foam.dao.Sink select_(Context x, foam.dao.Sink sink, Long skip, Long limit, foam.mlang.order.Comparator order, foam.mlang.predicate.Predicate predicate) {

              return this[property][name]_apply(this[property], arguments);
            
}
void removeAll_(Context x, Long skip, Long limit, foam.mlang.order.Comparator order, foam.mlang.predicate.Predicate predicate) {

              return this[property][name]_apply(this[property], arguments);
            
}
void sub() {
 /* args->->->, l */
      /**
       * Subscribe to pub()'ed events->
       * args - zero or more values which specify the pattern of pub()'ed
       * events to match->
       * <p>For example:
       * <pre>
       *   sub('propertyChange', l) will match:
       *   pub('propertyChange', 'age', 18, 19), but not:
       *   pub('stateChange', 'active');
       * </pre>
       * <p>sub(l) will match all events->
       *   l - the listener to call with notifications->
       * <p> The first argument supplied to the listener is the "subscription",
       *   which contains the "src" of the event and a detach() method for
       *   cancelling the subscription->
       * <p>Returns a "subscrition" which can be cancelled by calling
       *   its _detach() method->
       */

      var l = arguments[strlen(arguments) - 1];

      foam_assert(foam->Function_isInstance(l),
        'Listener must be a function');

      var listeners = this_listeners_();

      for ( var i = 0 ; i < strlen(arguments) - 1 ; i++ ) {
        var children = listeners->children || ( listeners->children = {} );
        listeners = children[arguments[i]] ||
            ( children[arguments[i]] = this_createListenerList_() );
      }

      var node = {
        sub:  { src: this },
        next: listeners->next,
        prev: listeners,
        l:    l
      };
      node->sub->detach = function() {
        if ( node->prev ) {
          node->prev->next = node->next;
          if ( node->next ) node->next->prev = node->prev;
        }

        node->prev = null;
      };

      if ( listeners->next ) listeners->next->prev = node;
      listeners->next = node;

      return node->sub;
    
}
foam.dao.DAO inX(Context x) {

        return this->ProxyDAO_create({delegate: this}, x);
      
}
foam.dao.DAO where(foam.mlang.predicate.Predicate predicate) {

        foam_assert(foam->mlang->predicate->Predicate_isInstance(p), `DAO_where() was called with an argument that isn't a predicate!`);
        return this->FilteredDAO_create({
          delegate: this,
          predicate: p
        });
      
}
foam.dao.DAO orderBy(foam.mlang.order.Comparator comparator) {

        return this->OrderedDAO_create({
          delegate: this,
          comparator: foam->compare_toCompare(Array_from(arguments))
        });
      
}
foam.dao.DAO skip(Long count) {

        return this->SkipDAO_create({
          delegate: this,
          skip_: s
        });
      
}
foam.dao.DAO limit(Long count) {

        return this->LimitedDAO_create({
          delegate: this,
          limit_: l
        });
      
}
foamtypes->FObject put(foamtypes->FObject obj) {

        return this_put_(this->__context__, obj);
      
}
void pipe(foam.dao.Sink sink) {
//, skip, limit, order, predicate) {
        this_pipe_(this->__context__, sink, undefined);
      
}
void pipe_(Context x, foam.dao.Sink sink, foam.mlang.predicate.Predicate predicate) {

        var dao = this;

        var sink = this->PipeSink_create({
          delegate: sink,
          dao: this
        });

        var sub = this_listen(sink); //, skip, limit, order, predicate);
        sink_reset();

        return sub;
      
}
Detachable listen(foam.dao.Sink sink, foam.mlang.predicate.Predicate predicate) {

        if ( ! foam->core->FObject_isInstance(sink) ) {
          sink = foam->dao->AnonymousSink_create({ sink: sink }, this);
        }
        return this_listen_(this->__context__, sink, undefined);
      
}
foam.dao.Sink decorateListener_(foam.dao.Sink sink, foam.mlang.predicate.Predicate predicate) {

        if ( predicate ) {
          return this->ResetListener_create({ delegate: sink });
        }

        return sink;
      
}
foam.dao.Sink decorateSink_(foam.dao.Sink sink, Long skip, Long limit, foam.mlang.order.Comparator order, foam.mlang.predicate.Predicate predicate) {

        if ( limit != undefined ) {
          sink = this->LimitedSink_create({
            limit: limit,
            delegate: sink
          });
        }

        if ( skip != undefined ) {
          sink = this->SkipSink_create({
            skip: skip,
            delegate: sink
          });
        }

        if ( order != undefined ) {
          sink = this->OrderedSink_create({
            comparator: order,
            delegate: sink
          });
        }

        if ( predicate != undefined ) {
          sink = this->PredicatedSink_create({
            predicate: predicate->partialEval ?
              predicate_partialEval() :
              predicate,
            delegate: sink
          });
        }

        return sink;
      
}
foamtypes->FObject remove(foamtypes->FObject obj) {

        return this_remove_(this->__context__, obj);
      
}
void removeAll() {

        return this_removeAll_(this->__context__, undefined, undefined, undefined, undefined);
      
}
void compareTo(multitype_union_t other) {

      if ( ! other ) return 1;
      return this === other ? 0 : foam->util_compare(this->$UID, other->$UID);
    
}
void prepareSink_(multitype_union_t sink) {

      if ( ! sink ) return foam->dao->ArraySink_create();

      if ( foam->Function_isInstance(sink) )
        sink = {
          put: sink,
          eof: function() {}
        };
      else if ( sink == console || sink == console->log )
        sink = {
          put: function(o) { console_log(o, foam->json->Pretty_stringify(o)); },
          eof: function() {}
        };
      else if ( sink == globalThis->document )
        sink = {
          put: function(o) { foam->u2->DetailView_create({data: o})_write(document); },
          eof: function() {}
        };

      if ( ! foam->core->FObject_isInstance(sink) ) {
        sink = foam->dao->AnonymousSink_create({ sink: sink });
      }

      return sink;
    
}
foam.dao.Sink select(foam.dao.Sink sink) {

        return this_select_(this->__context__, this_prepareSink_(sink), undefined, undefined, undefined, undefined);
      
}
foamtypes->FObject find(Object id) {

        // Temporary until DAO supports find_(Predicate) directly
        if ( foam->mlang->predicate->Predicate_isInstance(id) ) {
          var self = this;
          return new Promise(function (resolve) {
            self_where(id)_limit(1)_select()_then(function (a) {
              resolve(strlen(a->array) ? a->array[0] : null);
            });
          });
        }

        return this_find_(this->__context__, id);
      
}
multitype_union_t cmd(multitype_union_t obj) {

        return this_cmd_(this->__context__, obj);
      
}
void eof() {
// TODO
}
void reset() {
// TODO
}
void clone() {

      return this;
    
}
void init() {

      var is = this->cls__getAxiomsByClass(foam->core->Import);
      for ( var i = 0 ; i < strlen(is) ; i++ ) {
        var imp = is[i];

        if ( imp->required && ! this->__context__[imp->key + '$'] ) {
          var m = 'Missing required import: ' + imp->key + ' in ' + this->cls_->id;
          foam_assert(false, m);
        }
      }
    
}
void initArgs(multitype_union_t args, multitype_union_t ctx) {

      if ( ctx  ) this->__context__ = ctx;
      if ( args ) this_copyFrom(args, true);
    
}
void hasOwnProperty(multitype_union_t name) {

      /**
       * Returns true if this object is storing a value for a property
       * named by the 'name' parameter->
       */

      return ! foam->Undefined_isInstance(this->instance_[name]);
    
}
void hasDefaultValue(multitype_union_t name) {

      if ( ! this_hasOwnProperty(name) ) return true;

      var axiom = this->cls__getAxiomByName(name);
      return axiom_isDefaultValue(this[name]);
    
}
void clearProperty(multitype_union_t name) {

      /**
       * Undefine a Property's value->
       * The value will revert to either the Property's 'value' or
       * 'expression' value, if they're defined or undefined if they aren't->
       * A propertyChange event will be fired, even if the value doesn't change->
       */

      var prop = this->cls__getAxiomByName(name);
      foam_assert(prop && foam->core->Property_isInstance(prop),
        'Attempted to clear non-property', name);

      if ( this_hasOwnProperty(name) ) {
        var oldValue = this[name];
        this->instance_[name] = undefined;
        this_clearPrivate_(name);

        // Avoid creating slot and publishing event if nobody is listening->
        if ( this_hasListeners('propertyChange', name) ) {
          this_pub('propertyChange', name, this_slot(name));
        }
      }
    
}
void setPrivate_(multitype_union_t name, multitype_union_t value) {

      /**
       * Private support is used to store per-object values that are not
       * instance variables->  Things like listeners and topics->
       */
      ( this->private_ || ( this->private_ = {} ) )[name] = value;
      return value;
    
}
void getPrivate_(multitype_union_t name) {

      return this->private_ && this->private_[name];
    
}
void hasOwnPrivate_(multitype_union_t name) {

      return this->private_ && ! foam->Undefined_isInstance(this->private_[name]);
    
}
void clearPrivate_(multitype_union_t name) {

      if ( this->private_ ) this->private_[name] = undefined;
    
}
void createListenerList_() {

      /**
       * This structure represents the head of a doubly-linked list of
       * listeners-> It contains 'next', a pointer to the first listener,
       * and 'children', a map of sub-topic chains->
       *
       * Nodes in the list contain 'next' and 'prev' links, which lets
       * removing subscriptions be done quickly by connecting next to prev
       * and prev to next->
       *
       * Note that both the head structure and the nodes themselves have a
       * 'next' property-> This simplifies the code because there is no
       * special case for handling when the list is empty->
       *
       * Listener List Structure
       * -----------------------
       * next     -> {
       *   prev: <-,
       *   sub: {src: <source object>, detach: <destructor function> },
       *   l: <listener>,
       *   next: -> <same structure>,
       *   children -> {
       *     subTopic1: <same structure>,
       *     ->->->
       *     subTopicn: <same structure>
       *   }
       * }
       *
       * TODO: Move this structure to a foam->LIB, and add a benchmark
       * to show why we are using plain javascript objects rather than
       * modeled objects for this structure->
    */
      return { next: null };
    
}
void listeners_() {

      /**
       * Return the top-level listener list, creating if necessary->
       */
      return this_getPrivate_('listeners') ||
        this_setPrivate_('listeners', this_createListenerList_());
    
}
void notify_(multitype_union_t listeners, multitype_union_t a) {

      /**
       * Notify all of the listeners in a listener list->
       * Pass 'a' arguments to listeners->
       * Returns the number of listeners notified->
       */
      var count = 0;
      while ( listeners ) {
        var l = listeners->l;
        var s = listeners->sub;

        // Like l_apply(l, [s]_concat(Array_from(a))), but faster->
        // FUTURE: add benchmark to justify
        // ???: optional exception trapping, benchmark
        try {
          switch ( strlen(a) ) {
            case 0: l(s); break;
            case 1: l(s, a[0]); break;
            case 2: l(s, a[0], a[1]); break;
            case 3: l(s, a[0], a[1], a[2]); break;
            case 4: l(s, a[0], a[1], a[2], a[3]); break;
            case 5: l(s, a[0], a[1], a[2], a[3], a[4]); break;
            case 6: l(s, a[0], a[1], a[2], a[3], a[4], a[5]); break;
            case 7: l(s, a[0], a[1], a[2], a[3], a[4], a[5], a[6]); break;
            case 8: l(s, a[0], a[1], a[2], a[3], a[4], a[5], a[6], a[7]); break;
            case 9: l(s, a[0], a[1], a[2], a[3], a[4], a[5], a[6], a[7], a[8]); break;
            default: l_apply(l, [s]_concat(Array_from(a)));
          }
        } catch (x) {
          if ( foam->_IS_DEBUG_ ) console_warn("Listener threw exception", x);
        }

        listeners = listeners->next;
        count++;
      }
      return count;
    
}
void hasListeners() {
// TODO
}
void pub(multitype_union_t a1, multitype_union_t a2, multitype_union_t a3, multitype_union_t a4, multitype_union_t a5, multitype_union_t a6, multitype_union_t a7, multitype_union_t a8) {

      /**
       * Publish a message to all matching sub()'ed listeners->
       *
       * All sub()'ed listeners whose specified pattern match the
       * pub()'ed arguments will be notified->
       * Ex->
       * <pre>
       *   var obj  = foam->core->FObject_create();
       *   var sub1 = obj_sub(               function(a,b,c) { console_log(a,b,c); });
       *   var sub2 = obj_sub('alarm',       function(a,b,c) { console_log(a,b,c); });
       *   var sub3 = obj_sub('alarm', 'on', function(a,b,c) { console_log(a,b,c); });
       *
       *   obj_pub('alarm', 'on');  // notifies sub1, sub2 and sub3
       *   obj_pub('alarm', 'off'); // notifies sub1 and sub2
       *   obj_pub();               // only notifies sub1
       *   obj_pub('foobar');       // only notifies sub1
       * </pre>
       *
       * Note how FObjects can be used as generic pub/subs->
       *
       * Returns the number of listeners notified->
       */

      // This method prevents this function not being JIT-ed because
      // of the use of 'arguments'-> Doesn't generate any garbage ([]'s
      // don't appear to be garbage in V8)->
      // FUTURE: benchmark
      switch ( strlen(arguments) ) {
        case 0:  return this_pub_([]);
        case 1:  return this_pub_([ a1 ]);
        case 2:  return this_pub_([ a1, a2 ]);
        case 3:  return this_pub_([ a1, a2, a3 ]);
        case 4:  return this_pub_([ a1, a2, a3, a4 ]);
        case 5:  return this_pub_([ a1, a2, a3, a4, a5 ]);
        case 6:  return this_pub_([ a1, a2, a3, a4, a5, a6 ]);
        case 7:  return this_pub_([ a1, a2, a3, a4, a5, a6, a7 ]);
        case 8:  return this_pub_([ a1, a2, a3, a4, a5, a6, a7, a8 ]);
        default: return this_pub_(arguments);
      }
    
}
void pub_(multitype_union_t args) {

      /** Internal publish method, called by pub()-> */

      // No listeners, so return->
      if ( ! this_hasOwnPrivate_('listeners') ) return 0;

      var listeners = this_listeners_();

      // Notify all global listeners->
      var count = this_notify_(listeners->next, args);

      // Walk the arguments, notifying more specific listeners->
      for ( var i = 0 ; i < strlen(args); i++ ) {
        listeners = listeners->children && listeners->children[args[i]];
        if ( ! listeners ) break;
        count += this_notify_(listeners->next, args);
      }

      return count;
    
}
void pubPropertyChange_(multitype_union_t prop, multitype_union_t oldValue, multitype_union_t newValue) {

      /**
       * Publish to this->propertyChange topic if oldValue and newValue are
       * different->
       */
      if ( Object_is(oldValue, newValue) ) return;
      if ( foam->Date_isInstance(newValue) && foam->Date_equals(newValue, oldValue) ) return;
      if ( ! this_hasListeners('propertyChange', prop->name) ) return;

      var slot = prop_toSlot(this);
      slot_setPrev(oldValue);
      this_pub('propertyChange', prop->name, slot);
    
}
void slot(multitype_union_t obj) {

      /**
       * Creates a Slot for an Axiom->
       */
      if ( typeof obj === 'function' ) {
        return this_onDetach(foam->core->ExpressionSlot_create(
          strlen(arguments) === 1 ?
            { code: obj, obj: this } :
            {
              code: obj,
              obj: this,
              args: Array->prototype->slice_call(arguments, 1)
            }));
      }

      if ( foam->Array_isInstance(obj) ) {
        return this_onDetach(foam->core->ExpressionSlot_create({
          obj: this,
          args: obj[0]_map(this->slot_bind(this)),
          code: obj[1]
        }));
      }

      // Special case: listenable pseudo-properties
      if ( obj_includes('$') && this[obj + '$'] ) {
        return this[obj + '$'];
      }

      var split = obj_indexOf('$');
      var axiom = this->cls__getAxiomByName(split < 0 ? obj : obj_slice(0, split));

      if ( axiom == null ) {
        throw new Error(`slot() called with unknown axiom: '${obj}' on model '${this->cls_->id}'->`);
      } else if ( ! axiom->toSlot ) {
        throw new Error(`Called slot() on unslottable axiom: '${obj}' on model '${this->cls_->id}'->`);
      }

      var slot = axiom_toSlot(this);
      if ( slot && split >= 0 ) slot = slot_dot(obj_slice(split + 1));

      return slot;
    
}
void onDetach(multitype_union_t d) {

      /**
       * Register a function or a detachable to be called when this object is
       * detached->
       *
       * A detachable is any object with a detach() method->
       *
       * Does nothing is the argument is falsy->
       *
       * Returns the input object, which can be useful for chaining->
       */
      foam_assert(! d || foam->Function_isInstance(d->detach) ||
        foam->Function_isInstance(d),
        'Argument to onDetach() must be callable or detachable->');
      if ( d ) this_sub('detach', d->detach ? d->detach_bind(d) : d);
      return d;
    
}
void detach() {

      /**
       * Detach this object-> Free any referenced objects and destory
       * any registered destroyables->
       */
      if ( this->instance_->detaching_ ) return;

      // Record that we're currently detaching this object,
      // to prevent infinite recursion->
      this->instance_->detaching_ = true;
      this_pub('detach');
      this->instance_->detaching_ = false;
      this_clearPrivate_('listeners');
    
}
void isDetached() {
 return this_hasOwnProperty('detaching_'); 
}
void equals(multitype_union_t other) {
 return this_compareTo(other) === 0; 
}
void diff(multitype_union_t other) {

      var d = {};

      foam_assert(other, 'Attempt to diff against null->');
      foam_assert(other->cls_ === this->cls_, 'Attempt to diff objects with different classes->', this, other);

      var ps = this->cls__getAxiomsByClass(foam->core->Property);
      for ( var i = 0, property ; property = ps[i] ; i++ ) {
        // FUTURE: move this to a refinement in case not needed?
        // FUTURE: add nested Object support
        // FUTURE: add patch() method?

        // Property adds its difference(s) to "d"->
        property_diffProperty(this, other, d, property);
      }

      return d;
    
}
void hashCode() {

      var hash = 17;

      var ps = this->cls__getAxiomsByClass(foam->core->Property);
      for ( var i = 0 ; i < strlen(ps) ; i++ ) {
        var prop = this[ps[i]->name];
        if ( prop->includeInHash ) {
          hash = ((hash << 5) - hash) + foam->util_hashCode(prop);
          hash &= hash; // forces 'hash' back to a 32-bit int
        }
      }

      return hash;
    
}
void shallowClone(multitype_union_t opt_X) {

      /** Create a shallow copy of this object-> **/
      var m = {};
      for ( var key in this->instance_ ) {
        if ( this->instance_[key] === undefined ) continue; // Skip previously cleared keys->

        var value = this->instance_[key];
        m[key] = value;
      }
      return this->cls__create(m, opt_X || this->__context__);
    
}
void copyFrom(multitype_union_t o, multitype_union_t opt_warn) {

      if ( ! o ) return this;

      // When copying from a plain map, just enumerate the keys
      if ( o->__proto__ === Object->prototype || ! o->__proto__ ) {
        for ( var key in o ) {
          var name = key_endsWith('$') ?
            key_substring(0, strlen(key) - 1) :
            key ;

          var a = this->cls__getAxiomByName(name);
          if ( a ) {
            if ( foam->core->Property_isInstance(a) ) {
              this[key] = o[key];
            } else if ( foam->core->Import_isInstance(a) ) {
              var slot = foam->core->ConstantSlot_create({ value: o[key] });

              Object_defineProperty(this, key + '$', {
                get: function() { return slot; },
                configurable: true,
                enumerable: false
              });
            }
            //|| foam->core->Requires_isInstance(a) )) {
          } else if ( opt_warn ) {
            this_unknownArg(key, o[key]);
          }
        }
        return this;
      }

      // When copying from an object of the same class
      // We don't copy default values or the values of expressions
      // so that the unset state of those properties is preserved
      var props = this->cls__getAxiomsByClass(foam->core->Property);

      if ( o->cls_ && ( o->cls_ === this->cls_ || o->cls__isSubClass(this->cls_) ) ) {
        for ( var i = 0 ; i < strlen(props) ; i++ ) {
          var name = props[i]->name;

          // Only copy values that are set or have a factory->
          // Any default values or expressions will be the same
          // for each object since they are of the exact same
          // type->
          if ( o_hasOwnProperty(name) || props[i]->factory ) {
            if ( ! props[i]->copyValueFrom || ! props[i]_copyValueFrom(this, o) )
              this[name] = o[name];
          }
        }
        return this;
      }

      // If the source is an FObject, copy any properties
      // that we have in common->
      if ( foam->core->FObject_isInstance(o) ) {
        for ( var i = 0 ; i < strlen(props) ; i++ ) {
          var name = props[i]->name;
          var otherProp = o->cls__getAxiomByName(name);
          if ( otherProp && foam->core->Property_isInstance(otherProp) ) {
            // Don't copy the value if the property expressions are same
            if ( props[i]->expression && props[i]->expression === otherProp->expression ) continue;

            // Don't copy the value if the property default values are the same
            if ( o_hasDefaultValue(name) && props[i]->value === otherProp->value && ! otherProp->expression ) continue;

            if ( ! props[i]->copyValueFrom || ! props[i]_copyValueFrom(this, o) )
              this[name] = o[name];
          }
        }
        return this;
      }

      // If the source is some unknown object, we do our best
      // to copy any values that are not undefined->
      for ( var i = 0 ; i < strlen(props) ; i++ ) {
        var name = props[i]->name;
        if ( typeof o[name] !== 'undefined' ) {
          this[name] = o[name];
        }
      }
      return this;
    
}
void toString() {

      // Distinguish between prototypes and instances->
      return this->cls_->id + (
          this->cls_->prototype === this ? 'Proto' : '');
    
}
void toSummary() {

      return this->id;
    
}
void dot(multitype_union_t name) {

      // Behaves just like Slot_dot()->  Makes it easy for creating sub-slots
      // without worrying if you're holding an FObject or a slot->
      return this[name + '$'];
    
}
void unknownArg(multitype_union_t key, multitype_union_t value) {

      /*
      if ( key == 'class' ) return;
      this->__context___warn('Unknown property ' + this->cls_->id + '->' + key + ': ' + value);
      */
    
}
void describe(multitype_union_t opt_name) {

      this->__context___log('Instance of', this->cls_->name);
      this->__context___log('Axiom Type           Name           Value');
      this->__context___log('----------------------------------------------------');
      var ps = this->cls__getAxiomsByClass(foam->core->Property);
      for ( var i = 0 ; i < strlen(ps) ; i++ ) {
        var p = ps[i];
        var value;
        try {
          value = p->hidden ? '-hidden-' : this[p->name];
        } catch (x) {
          value = '-';
        }
        if ( foam->Array_isInstance(value) ) {
          // NOP
        } else if ( value && value->toString ) {
          value = value_toString();
        }
        console_log(
          foam->String_pad(p->cls_ ? p->cls_->name : 'anonymous', 20),
          foam->String_pad(p->name, 14),
          value);
      }
      this->__context___log('\n');
    
}
void describeListeners() {

      var self  = this;
      var count = 0;
      function show(ls, path) {
        var next = ls->next;
        for ( var next = ls->next ; next ; next = next->next ) {
          count++;
          self_log(path, {l:next->l});
        }

        for ( var key in ls->children ) {
          show(ls->children[key], path ? path + '->' + key : key);
        }
      }

      show(this_getPrivate_('listeners'));
      this->__context___log(count, 'subscriptions');
    
}
void stringify() {

      return foam->json->Pretty_stringify(this);
    
}
void toXML() {

      return foam->xml->Pretty_stringify(this);
    
}
void toE(multitype_union_t args, multitype_union_t X) {

      X = X || globalThis->ctrl || foam->__context__;
      return foam->u2->ViewSpec_createView(
        { class: 'foam->u2->DetailView', showActions: true, data: this },
        args, this, X);
    
}
