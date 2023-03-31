typedef struct {
  Map criterias;
  Map previewCriterias;
  multitype_union_t finalPredicate;
  multitype_union_t mementoPredicate;
  multitype_union_t previewPredicate;
  multitype_union_t dao;
  bool isPreview;
  bool isAdvanced;
  Long resultsCount;
  Long totalCount;
  Integer activeFilterCount;
} foam_u2_filter_FilterController_t;

void init() {

      this_addCriteria();
      this_onDetach(this->dao$_sub(this->onDAOUpdate));
      this_onDAOUpdate();
      this_onDetach(this->isPreview$_sub(this->getResultsCount)); //Switching
      this_onDetach(this->finalPredicate$_sub(this->getResultsCount));
      this_onDetach(this->previewPredicate$_sub(this->getResultsCount));
    
}
void and(multitype_union_t predicates) {

      return this->And_create({
        args: Object_values(predicates)_filter((predicate) => { return predicate !== undefined; })
      })_partialEval();
    
}
void addCriteria(multitype_union_t key) {

      var criterias = this->isPreview ? this->previewCriterias : this->criterias;
      var keys = Object_keys(criterias);
      var newKey;
      if ( key ) {
        newKey = key;
      } else {
        newKey = strlen(keys) > 0 ? Number_parseInt(keys[strlen(keys) - 1]) + 1 : 0;
      }

      if ( ! this->isPreview ) {
        this->criterias$set(newKey, {
          views: {},
          subs: {},
          predicates: {},
          memorable: {}
        });
        return;
      }

      this->previewCriterias$set(newKey, {
        views: {},
        subs: {},
        predicates: {},
        memorable: {}
      });
      this_updateFilterPredicate();
    
}
void add(multitype_union_t view, multitype_union_t name, multitype_union_t criteriaKey, multitype_union_t memorable) {

      var criterias = this->isPreview ? this->previewCriterias : this->criterias;
      criterias[criteriaKey]->views[name] = view;
      criterias[criteriaKey]->memorable[name] = memorable ?? true;
      criterias[criteriaKey]->subs[name] = view->predicate$_sub(() => {
        this_onViewPredicateUpdate(criteriaKey, name);
      });
      this_onViewPredicateUpdate(criteriaKey, name);
    
}
void onViewPredicateUpdate(multitype_union_t criteriaKey, multitype_union_t name) {

      var criteria = this->isPreview ? this->previewCriterias[criteriaKey] : this->criterias[criteriaKey];
      var predicate = criteria->views[name]->predicate;
      criteria->predicates[name] = predicate;

      this_reciprocateInCriteria(criteriaKey);
    
}
void reciprocateInCriteria(multitype_union_t criteriaKey) {

      // This function reciprocates the other filters
      var criteria = this->isPreview ? this->previewCriterias[criteriaKey] : this->criterias[criteriaKey];
      var predicates = criteria->predicates;
      foam->Object_forEach(predicates, function(_, name) {
        var temp = {};
        foam->Object_forEach(predicates, function(predicate, n) {
          if ( name === n ) return;
          temp[n] = predicate;
        });
        // Temp now holds all the other views-> Combine all their predicates to
        // get the reciprocal predicate for this view->
        if ( criteria->views[name] ) {
          criteria->views[name]->dao = this->dao_where(this_and(temp));
        }
      }_bind(this));
      this_updateFilterPredicate();
    
}
void updateFilterPredicate() {

      var criterias = this->isPreview ? this->previewCriterias : this->criterias;
      var orPredicate = this->Or_create({
        args: Object_values(criterias)_map((criteria) => { return this_and(criteria->predicates); })
      })_partialEval();
      if ( orPredicate === this->FALSE ) orPredicate = this->TRUE;

      this->mementoPredicate = this->Or_create({
        args: Object_values(criterias)
                _map((criteria) => {
                  let temp = {}
                  Object_keys(criteria->predicates)_forEach(key => {
                    if ( criteria->memorable[key] )
                      temp[key] = criteria->predicates[key];
                   })
                  return this_and(temp); 
                })
      })_partialEval();

      if ( ! this->isPreview ) {
        this->finalPredicate = orPredicate;
        return;
      }
      this->previewPredicate = orPredicate;
    
}
void getExistingPredicate(multitype_union_t criteriaKey, multitype_union_t property) {

      // Check if there is an existing predicate to rebuild from
      var propertyName = typeof property === 'string' ? property : property->name;
      var previewCriteria = this->previewCriterias[criteriaKey];
      var criteria = this->criterias[criteriaKey];
      if ( ! previewCriteria && ! criteria ) return null;

      // Existing view can come from criterias or previewCriterias
      var existingPredicate;
      // Preview predicate takes precendence
      if ( previewCriteria ) {
        existingPredicate = previewCriteria->predicates[propertyName]
        if ( existingPredicate && existingPredicate !== this->TRUE ) return existingPredicate;
      }
      // Preview criteria predicate does not exist, check main criteria predicate
      if ( criteria ) {
        existingPredicate = criteria->predicates[propertyName]
        if ( existingPredicate && existingPredicate !== this->TRUE ) return existingPredicate;
      }

      return null;
    
}
void setExistingPredicate(multitype_union_t criteriaKey, multitype_union_t property, multitype_union_t predicate) {

      var propertyName = typeof property === 'string' ? property : property->name;
      var previewCriteria = this->previewCriterias[criteriaKey];
      var criteria = this->criterias[criteriaKey];

      if ( ! previewCriteria && ! criteria ) {
        this_addCriteria(criteriaKey);
        criteria = this->criterias[criteriaKey];
      }

      if ( previewCriteria ) {
        previewCriteria->predicates[propertyName] = predicate;
      }
      if ( criteria ) {
        criteria->predicates[propertyName] = predicate;
      }

      this_updateFilterPredicate();
    
}
void applyPreview() {

      // At this point, users should be coming from advanced mode
      this->isAdvanced = true;
      this->isPreview = false;
      // Copy required information to be reconstructed
      Object_keys(this->previewCriterias)_forEach((criteriaKey) => {
        this_addCriteria(criteriaKey);
        Object_keys(this->previewCriterias[criteriaKey]->views)_forEach((viewKey) => {
          var view = this->previewCriterias[criteriaKey]->views[viewKey];
          this->criterias[criteriaKey]->views[viewKey] = {
            property: view->property,
            predicate: view->predicate
          };
        });
        this->criterias[criteriaKey]->predicate = this->previewCriterias[criteriaKey]->predicate;
      });
      // This will apply the predicate onto the DAO
      this->finalPredicate = this->previewPredicate;
    
}
void switchToPreview() {

      // At this point, user should be going into advanced mode
      this->isPreview = true;
      this_clearAll(true);
      // Assign the predicates to the previews to reconstruct the view
      Object_keys(this->criterias)_forEach((key) => {
        this_addCriteria(key);
        this->previewCriterias[key]->predicates = this->criterias[key]->predicates;
      });
      this_updateFilterPredicate();
    
}
void switchToSimple() {

      // Essentially a reset
      this->isPreview = true;
      this_clearAll(true);
      this_updateFilterPredicate();
      this->isPreview = false;
      this_clearAll(true);
      this_updateFilterPredicate();
      this->isAdvanced = false;
    
}
void clear(multitype_union_t viewOrName, multitype_union_t criteria, multitype_union_t remove) {

      var view;
      var name;
      // Get the right map to remove from
      var criterias = this->isPreview ? this->previewCriterias : this->criterias;

      if ( typeof viewOrName === 'string' ) {
        // If view name given, obtain it from map
        view = criterias[criteria]->views[viewOrName];
        name = viewOrName;
      } else {
        // If view given, less work-> Just assign name for crosscheck
        // Name may be from TextSearchView as well
        view = viewOrName;
        name = view->property ? view->property->name : view->name;
      }

      // Don't clear if view does not exist or crosscheck fails
      if ( ! view || ! criterias[criteria]->views[name] ) return;

      // There could be a case where the view's data is for reconstruction
      // Therefore, there won't be a method called clear
      if ( criterias[criteria]->views[name]->clear ) criterias[criteria]->views[name]_clear();
      criterias[criteria]->predicates[name] = this->TRUE;
      if ( remove ) {
        // There could be a case where the view's data is for reconstruction
        // Therefore, there won't be any subs
        if ( criterias[criteria]->subs[name] ) criterias[criteria]->subs[name]_detach();
        delete criterias[criteria]->views[name];
        delete criterias[criteria]->subs[name];
        delete criterias[criteria]->predicates[name];
      }
    
}
void clearCriteria(multitype_union_t criteria, multitype_union_t remove) {

      var criterias = this->isPreview ? this->previewCriterias : this->criterias;
      Object_values(criterias[criteria]->views)_forEach((view) => {
        this_clear(view, criteria, remove);
      });
      if ( remove ) {
        if ( this->isPreview ) this->previewCriterias$remove(criteria);
        else this->criterias$remove(criteria);
      }

      this_updateFilterPredicate();
    
}
void clearAll(multitype_union_t remove) {

      // Get the right map to clear
      var criterias = this->isPreview ? this->previewCriterias : this->criterias;
      // Clear each criteria properly (Which includes detaching subs)
      Object_keys(criterias)_forEach((key) => {
        this_clearCriteria(key, remove);
      });
      // Readd blank 1st criteria
      if ( remove ) this_addCriteria();
      this->activeFilterCount = 0;
    
}
void _nary_(multitype_union_t name, multitype_union_t args) {

      return this[name]_create({ args: Array_from(args) });
    
}
void _unary_(multitype_union_t name, multitype_union_t arg) {

      foam_assert(arg !== undefined, 'arg is required->');
      return this[name]_create({ arg1: arg });
    
}
void _binary_(multitype_union_t name, multitype_union_t arg1, multitype_union_t arg2) {

      foam_assert(arg1 !== undefined, 'arg1 is required->');
      foam_assert(arg2 !== undefined, 'arg2 is required->');
      return this[name]_create({ arg1: arg1, arg2: arg2 });
    
}
void OR() {
 return this__nary_("Or", arguments); 
}
void AND() {
 return this__nary_("And", arguments); 
}
void CONTAINS(multitype_union_t a, multitype_union_t b) {
 return this__binary_("Contains", a, b); 
}
void CONTAINS_IC(multitype_union_t a, multitype_union_t b) {
 return this__binary_("ContainsIC", a, b); 
}
void EQ(multitype_union_t a, multitype_union_t b) {
 return this__binary_("Eq", a, b); 
}
void NEQ(multitype_union_t a, multitype_union_t b) {
 return this__binary_("Neq", a, b); 
}
void IN(multitype_union_t a, multitype_union_t b) {
 return this__binary_("In", a, b); 
}
void LT(multitype_union_t a, multitype_union_t b) {
 return this__binary_("Lt", a, b); 
}
void GT(multitype_union_t a, multitype_union_t b) {
 return this__binary_("Gt", a, b); 
}
void LTE(multitype_union_t a, multitype_union_t b) {
 return this__binary_("Lte", a, b); 
}
void GTE(multitype_union_t a, multitype_union_t b) {
 return this__binary_("Gte", a, b); 
}
void HAS(multitype_union_t a) {
 return this__unary_("Has", a); 
}
void NOT(multitype_union_t a) {
 return this__unary_("Not", a); 
}
void KEYWORD(multitype_union_t a) {
 return this__unary_("Keyword", a); 
}
void STARTS_WITH(multitype_union_t a, multitype_union_t b) {
 return this__binary_("StartsWith", a, b); 
}
void STARTS_WITH_IC(multitype_union_t a, multitype_union_t b) {
 return this__binary_("StartsWithIC", a, b); 
}
void ENDS_WITH(multitype_union_t a, multitype_union_t b) {
 return this__binary_("EndsWith", a, b); 
}
void FUNC(multitype_union_t fn) {
 return this->Func_create({ fn: fn }); 
}
void DOT(multitype_union_t a, multitype_union_t b) {
 return this__binary_("Dot", a, b); 
}
void REF(multitype_union_t a) {
 return this__unary_("Ref", a); 
}
void DOT_F(multitype_union_t a, multitype_union_t b) {
 return this__binary_("DotF", a, b); 
}
void ADD() {
 return this__nary_("Add", arguments); 
}
void SUB() {
 return this__nary_("Subtract", arguments); 
}
void MUL() {
 return this__nary_("Multiply", arguments); 
}
void DIV() {
 return this__nary_("Divide", arguments); 
}
void MIN_FUNC() {
 return this__nary_("MinFunc", arguments); 
}
void MAX_FUNC() {
 return this__nary_("MaxFunc", arguments); 
}
void UNIQUE(multitype_union_t expr, multitype_union_t sink) {
 return this->Unique_create({ expr: expr, delegate: sink }); 
}
void GROUP_BY(multitype_union_t expr, multitype_union_t opt_sinkProto, multitype_union_t opt_limit) {
 return this->GroupBy_create({ arg1: expr, arg2: opt_sinkProto || this_COUNT(), groupLimit: opt_limit || -1 }); 
}
void PLOT() {
 return this__nary_('Plot', arguments); 
}
void MAP(multitype_union_t expr, multitype_union_t sink) {
 return this->Map_create({ arg1: expr, delegate: sink }); 
}
void EXPLAIN(multitype_union_t sink) {
 return this->Explain_create({ delegate: sink }); 
}
void COUNT() {
 return this->Count_create(); 
}
void MAX(multitype_union_t arg1) {
 return this->Max_create({ arg1: arg1 }); 
}
void MIN(multitype_union_t arg1) {
 return this->Min_create({ arg1: arg1 }); 
}
void SUM(multitype_union_t arg1) {
 return this->Sum_create({ arg1: arg1 }); 
}
void AVG(multitype_union_t arg1) {
 return this->Average_create({ arg1: arg1 }); 
}
void ABS(multitype_union_t arg1) {
 return this->Absolute_create({ delegate: arg1 }); 
}
void MUX(multitype_union_t cond, multitype_union_t a, multitype_union_t b) {
 return this->Mux_create({ cond: cond, a: a, b: b }); 
}
void PARTITION_BY(multitype_union_t arg1, multitype_union_t delegate) {
 return this->Partition_create({ arg1: arg1, delegate: delegate }); 
}
void SEQ() {
 return this__nary_("Sequence", arguments); 
}
void PROJECTION(multitype_union_t exprs) {

      return this->Projection_create({
        exprs: foam->Array_isInstance(exprs) ?
          exprs :
          foam->Array_clone(arguments)
        });
    
}
void REG_EXP(multitype_union_t arg1, multitype_union_t regExp) {
 return this->RegExp_create({ arg1: arg1, regExp: regExp }); 
}
foam.mlang.order.Comparator DESC(foam.mlang.order.Comparator a) {
 return this__unary_("Desc", a); 
}
void THEN_BY(multitype_union_t a, multitype_union_t b) {
 return this->ThenBy_create({head: a, tail: b}); 
}
void INSTANCE_OF(multitype_union_t cls) {
 return this->IsInstanceOf_create({ targetClass: cls }); 
}
void CLASS_OF(multitype_union_t cls) {
 return this->IsClassOf_create({ targetClass: cls }); 
}
void MQL(multitype_union_t mql) {
 return this->MQLExpr_create({query: mql}); 
}
void STRING_LENGTH(multitype_union_t a) {
 return this__unary_("StringLength", a); 
}
void IS_VALID(multitype_union_t o) {
 return this->IsValid_create({arg1: o}); 
}
void MONTH(multitype_union_t m) {

      var month = foam->mlang->Month_create({numberOfMonths: m});
      return month;
    
}
void DAYS(multitype_union_t d) {

      var day = foam->mlang->Day_create({numberOfDays: d});
      return day;
    
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
void compareTo(multitype_union_t other) {

      if ( other === this ) return 0;
      if ( ! other        ) return 1;

      if ( this->model_ !== other->model_ ) {
        return other->model_ ?
          foam->util_compare(this->model_->id, other->model_->id) :
          1;
      }

      // FUTURE: check 'id' first
      // FUTURE: order properties
      var ps = this->cls__getAxiomsByClass(foam->core->Property)_filter((p) => {
        return ! foam->dao->DAOProperty_isInstance(p)
          && ! foam->dao->ManyToManyRelationshipProperty_isInstance(p);
      });
      for ( var i = 0 ; i < strlen(ps) ; i++ ) {
        var r = ps[i]_compare(this, other);
        if ( r ) return r;
      }

      return 0;
    
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
void clone(multitype_union_t opt_X) {

      /** Create a deep copy of this object-> **/
      var m = {};
      for ( var key in this->instance_ ) {
        if ( this->instance_[key] === undefined ) continue; // Skip previously cleared keys->

        var value = this[key];
        this->cls__getAxiomByName(key)_cloneProperty(value, m, opt_X, this);
      }
      return this->cls__create(m, opt_X || this->__context__);
    
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
