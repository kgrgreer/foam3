// GENERATED CODE. DO NOT MODIFY BY HAND.
import Foundation
public class BoxContext: AbstractFObject {

  public var messagePortService: Any? {
    get {
      
if _messagePortService_inited_ {
  return _messagePortService_
}

return nil

      
    }
set(value) {
      
self.set(key: "messagePortService", value: value)
      
    }
  }

  var _messagePortService_: Any? = nil

  var _messagePortService_inited_: Bool = false

  public static let MESSAGE_PORT_SERVICE: PropertyInfo = {
    
class PInfo: PropertyInfo {
  let name = "messagePortService"
  let classInfo: ClassInfo
  let transient = false
  let label = "Message Port Service" // TODO localize
  let visibility = Visibility.RW
  lazy private(set) public var jsonParser: Parser? = AnyParser()

  let viewFactory: ((Context) -> FObject)? = nil

  public func set(_ obj: FObject, value: Any?) {
    obj.set(key: name, value: value)
  }
  public func get(_ obj: FObject) -> Any? {
    return obj.get(key: name)
  }
  public func compareValues(_ v1: Any?, _ v2: Any?) -> Int {
    
let v1 = v1 as AnyObject
let v2 = v2 as AnyObject
if v1.isEqual(v2) { return 0 }
return v1.hash ?? 0 > v2.hash ?? 0 ? 1 : -1
        
  }
  init(_ ci: ClassInfo) { classInfo = ci }
}
return PInfo(classInfo())
      
  }()

  private lazy var messagePortService_Value_: PropertySlot = {
    
let s = PropertySlot([
  "object": self,
  "propertyName": "messagePortService",
])
self.onDetach(Subscription(detach: {
  s.detach()
}))
return s
      
  }()

  private(set) public var messagePortService_Value_Sub_: Subscription?

  public var messagePortService$: Slot {
    get {
      return self.messagePortService_Value_
    }
set(value) {
      
self.messagePortService_Value_Sub_?.detach()
self.messagePortService_Value_Sub_ = self.messagePortService$.linkFrom(value)
self.onDetach(self.messagePortService_Value_Sub_!)
      
    }
  }

  public var socketService: Any? {
    get {
      
if _socketService_inited_ {
  return _socketService_
}

return nil

      
    }
set(value) {
      
self.set(key: "socketService", value: value)
      
    }
  }

  var _socketService_: Any? = nil

  var _socketService_inited_: Bool = false

  public static let SOCKET_SERVICE: PropertyInfo = {
    
class PInfo: PropertyInfo {
  let name = "socketService"
  let classInfo: ClassInfo
  let transient = false
  let label = "Socket Service" // TODO localize
  let visibility = Visibility.RW
  lazy private(set) public var jsonParser: Parser? = AnyParser()

  let viewFactory: ((Context) -> FObject)? = nil

  public func set(_ obj: FObject, value: Any?) {
    obj.set(key: name, value: value)
  }
  public func get(_ obj: FObject) -> Any? {
    return obj.get(key: name)
  }
  public func compareValues(_ v1: Any?, _ v2: Any?) -> Int {
    
let v1 = v1 as AnyObject
let v2 = v2 as AnyObject
if v1.isEqual(v2) { return 0 }
return v1.hash ?? 0 > v2.hash ?? 0 ? 1 : -1
        
  }
  init(_ ci: ClassInfo) { classInfo = ci }
}
return PInfo(classInfo())
      
  }()

  private lazy var socketService_Value_: PropertySlot = {
    
let s = PropertySlot([
  "object": self,
  "propertyName": "socketService",
])
self.onDetach(Subscription(detach: {
  s.detach()
}))
return s
      
  }()

  private(set) public var socketService_Value_Sub_: Subscription?

  public var socketService$: Slot {
    get {
      return self.socketService_Value_
    }
set(value) {
      
self.socketService_Value_Sub_?.detach()
self.socketService_Value_Sub_ = self.socketService$.linkFrom(value)
self.onDetach(self.socketService_Value_Sub_!)
      
    }
  }

  public var webSocketService: Any? {
    get {
      
if _webSocketService_inited_ {
  return _webSocketService_
}

return nil

      
    }
set(value) {
      
self.set(key: "webSocketService", value: value)
      
    }
  }

  var _webSocketService_: Any? = nil

  var _webSocketService_inited_: Bool = false

  public static let WEB_SOCKET_SERVICE: PropertyInfo = {
    
class PInfo: PropertyInfo {
  let name = "webSocketService"
  let classInfo: ClassInfo
  let transient = false
  let label = "Web Socket Service" // TODO localize
  let visibility = Visibility.RW
  lazy private(set) public var jsonParser: Parser? = AnyParser()

  let viewFactory: ((Context) -> FObject)? = nil

  public func set(_ obj: FObject, value: Any?) {
    obj.set(key: name, value: value)
  }
  public func get(_ obj: FObject) -> Any? {
    return obj.get(key: name)
  }
  public func compareValues(_ v1: Any?, _ v2: Any?) -> Int {
    
let v1 = v1 as AnyObject
let v2 = v2 as AnyObject
if v1.isEqual(v2) { return 0 }
return v1.hash ?? 0 > v2.hash ?? 0 ? 1 : -1
        
  }
  init(_ ci: ClassInfo) { classInfo = ci }
}
return PInfo(classInfo())
      
  }()

  private lazy var webSocketService_Value_: PropertySlot = {
    
let s = PropertySlot([
  "object": self,
  "propertyName": "webSocketService",
])
self.onDetach(Subscription(detach: {
  s.detach()
}))
return s
      
  }()

  private(set) public var webSocketService_Value_Sub_: Subscription?

  public var webSocketService$: Slot {
    get {
      return self.webSocketService_Value_
    }
set(value) {
      
self.webSocketService_Value_Sub_?.detach()
self.webSocketService_Value_Sub_ = self.webSocketService$.linkFrom(value)
self.onDetach(self.webSocketService_Value_Sub_!)
      
    }
  }

  public var registry: Box? {
    get {
      
if _registry_inited_ {
  return _registry_
}

self.set(key: "registry", value: _registry_factory_())
return _registry_!

      
    }
set(value) {
      
self.set(key: "registry", value: value)
      
    }
  }

  var _registry_: Box? = nil

  var _registry_inited_: Bool = false

  public static let REGISTRY: PropertyInfo = {
    
class PInfo: PropertyInfo {
  let name = "registry"
  let classInfo: ClassInfo
  let transient = false
  let label = "Registry" // TODO localize
  let visibility = Visibility.RW
  lazy private(set) public var jsonParser: Parser? = AnyParser()

  let viewFactory: ((Context) -> FObject)? = nil

  public func set(_ obj: FObject, value: Any?) {
    obj.set(key: name, value: value)
  }
  public func get(_ obj: FObject) -> Any? {
    return obj.get(key: name)
  }
  public func compareValues(_ v1: Any?, _ v2: Any?) -> Int {
    
let v1 = v1 as AnyObject
let v2 = v2 as AnyObject
if v1.isEqual(v2) { return 0 }
return v1.hash ?? 0 > v2.hash ?? 0 ? 1 : -1
        
  }
  init(_ ci: ClassInfo) { classInfo = ci }
}
return PInfo(classInfo())
      
  }()

  private lazy var registry_Value_: PropertySlot = {
    
let s = PropertySlot([
  "object": self,
  "propertyName": "registry",
])
self.onDetach(Subscription(detach: {
  s.detach()
}))
return s
      
  }()

  private(set) public var registry_Value_Sub_: Subscription?

  public var registry$: Slot {
    get {
      return self.registry_Value_
    }
set(value) {
      
self.registry_Value_Sub_?.detach()
self.registry_Value_Sub_ = self.registry$.linkFrom(value)
self.onDetach(self.registry_Value_Sub_!)
      
    }
  }

  public var root: Box? {
    get {
      
if _root_inited_ {
  return _root_
}

return nil

      
    }
set(value) {
      
self.set(key: "root", value: value)
      
    }
  }

  var _root_: Box? = nil

  var _root_inited_: Bool = false

  public static let ROOT: PropertyInfo = {
    
class PInfo: PropertyInfo {
  let name = "root"
  let classInfo: ClassInfo
  let transient = false
  let label = "Root" // TODO localize
  let visibility = Visibility.RW
  lazy private(set) public var jsonParser: Parser? = AnyParser()

  let viewFactory: ((Context) -> FObject)? = nil

  public func set(_ obj: FObject, value: Any?) {
    obj.set(key: name, value: value)
  }
  public func get(_ obj: FObject) -> Any? {
    return obj.get(key: name)
  }
  public func compareValues(_ v1: Any?, _ v2: Any?) -> Int {
    
let v1 = v1 as AnyObject
let v2 = v2 as AnyObject
if v1.isEqual(v2) { return 0 }
return v1.hash ?? 0 > v2.hash ?? 0 ? 1 : -1
        
  }
  init(_ ci: ClassInfo) { classInfo = ci }
}
return PInfo(classInfo())
      
  }()

  private lazy var root_Value_: PropertySlot = {
    
let s = PropertySlot([
  "object": self,
  "propertyName": "root",
])
self.onDetach(Subscription(detach: {
  s.detach()
}))
return s
      
  }()

  private(set) public var root_Value_Sub_: Subscription?

  public var root$: Slot {
    get {
      return self.root_Value_
    }
set(value) {
      
self.root_Value_Sub_?.detach()
self.root_Value_Sub_ = self.root$.linkFrom(value)
self.onDetach(self.root_Value_Sub_!)
      
    }
  }

  public var myname: String {
    get {
      
if _myname_inited_ {
  return _myname_!
}

self.set(key: "myname", value: _myname_factory_())
return _myname_!

      
    }
set(value) {
      
self.set(key: "myname", value: value)
      
    }
  }

  var _myname_: String! = nil

  var _myname_inited_: Bool = false

  public static let MYNAME: PropertyInfo = {
    
class PInfo: PropertyInfo {
  let name = "myname"
  let classInfo: ClassInfo
  let transient = false
  let label = "Myname" // TODO localize
  let visibility = Visibility.RW
  lazy private(set) public var jsonParser: Parser? = AnyParser()

  let viewFactory: ((Context) -> FObject)? = nil

  public func set(_ obj: FObject, value: Any?) {
    obj.set(key: name, value: value)
  }
  public func get(_ obj: FObject) -> Any? {
    return obj.get(key: name)
  }
  public func compareValues(_ v1: Any?, _ v2: Any?) -> Int {
    
let v1 = v1 as AnyObject
let v2 = v2 as AnyObject
if v1.isEqual(v2) { return 0 }
return v1.hash ?? 0 > v2.hash ?? 0 ? 1 : -1
        
  }
  init(_ ci: ClassInfo) { classInfo = ci }
}
return PInfo(classInfo())
      
  }()

  private lazy var myname_Value_: PropertySlot = {
    
let s = PropertySlot([
  "object": self,
  "propertyName": "myname",
])
self.onDetach(Subscription(detach: {
  s.detach()
}))
return s
      
  }()

  private(set) public var myname_Value_Sub_: Subscription?

  public var myname$: Slot {
    get {
      return self.myname_Value_
    }
set(value) {
      
self.myname_Value_Sub_?.detach()
self.myname_Value_Sub_ = self.myname$.linkFrom(value)
self.onDetach(self.myname_Value_Sub_!)
      
    }
  }

  public var me: Any? {
    get {
      
if _me_inited_ {
  return _me_
}

self.set(key: "me", value: _me_factory_())
return _me_

      
    }
set(value) {
      
self.set(key: "me", value: value)
      
    }
  }

  var _me_: Any? = nil

  var _me_inited_: Bool = false

  public static let ME: PropertyInfo = {
    
class PInfo: PropertyInfo {
  let name = "me"
  let classInfo: ClassInfo
  let transient = true
  let label = "Me" // TODO localize
  let visibility = Visibility.RW
  lazy private(set) public var jsonParser: Parser? = AnyParser()

  let viewFactory: ((Context) -> FObject)? = nil

  public func set(_ obj: FObject, value: Any?) {
    obj.set(key: name, value: value)
  }
  public func get(_ obj: FObject) -> Any? {
    return obj.get(key: name)
  }
  public func compareValues(_ v1: Any?, _ v2: Any?) -> Int {
    
let v1 = v1 as AnyObject
let v2 = v2 as AnyObject
if v1.isEqual(v2) { return 0 }
return v1.hash ?? 0 > v2.hash ?? 0 ? 1 : -1
        
  }
  init(_ ci: ClassInfo) { classInfo = ci }
}
return PInfo(classInfo())
      
  }()

  private lazy var me_Value_: PropertySlot = {
    
let s = PropertySlot([
  "object": self,
  "propertyName": "me",
])
self.onDetach(Subscription(detach: {
  s.detach()
}))
return s
      
  }()

  private(set) public var me_Value_Sub_: Subscription?

  public var me$: Slot {
    get {
      return self.me_Value_
    }
set(value) {
      
self.me_Value_Sub_?.detach()
self.me_Value_Sub_ = self.me$.linkFrom(value)
self.onDetach(self.me_Value_Sub_!)
      
    }
  }

  public var unsafe: Bool {
    get {
      
if _unsafe_inited_ {
  return _unsafe_!
}

return true

      
    }
set(value) {
      
self.set(key: "unsafe", value: value)
      
    }
  }

  var _unsafe_: Bool! = nil

  var _unsafe_inited_: Bool = false

  public static let UNSAFE: PropertyInfo = {
    
class PInfo: PropertyInfo {
  let name = "unsafe"
  let classInfo: ClassInfo
  let transient = false
  let label = "Unsafe" // TODO localize
  let visibility = Visibility.RW
  lazy private(set) public var jsonParser: Parser? = AnyParser()

  let viewFactory: ((Context) -> FObject)? = nil

  public func set(_ obj: FObject, value: Any?) {
    obj.set(key: name, value: value)
  }
  public func get(_ obj: FObject) -> Any? {
    return obj.get(key: name)
  }
  public func compareValues(_ v1: Any?, _ v2: Any?) -> Int {
    
let v1 = v1 as AnyObject
let v2 = v2 as AnyObject
if v1.isEqual(v2) { return 0 }
return v1.hash ?? 0 > v2.hash ?? 0 ? 1 : -1
        
  }
  init(_ ci: ClassInfo) { classInfo = ci }
}
return PInfo(classInfo())
      
  }()

  private lazy var unsafe_Value_: PropertySlot = {
    
let s = PropertySlot([
  "object": self,
  "propertyName": "unsafe",
])
self.onDetach(Subscription(detach: {
  s.detach()
}))
return s
      
  }()

  private(set) public var unsafe_Value_Sub_: Subscription?

  public var unsafe$: Slot {
    get {
      return self.unsafe_Value_
    }
set(value) {
      
self.unsafe_Value_Sub_?.detach()
self.unsafe_Value_Sub_ = self.unsafe$.linkFrom(value)
self.onDetach(self.unsafe_Value_Sub_!)
      
    }
  }

  public var classWhitelist: Any? {
    get {
      
if _classWhitelist_inited_ {
  return _classWhitelist_
}

return nil

      
    }
set(value) {
      
self.set(key: "classWhitelist", value: value)
      
    }
  }

  var _classWhitelist_: Any? = nil

  var _classWhitelist_inited_: Bool = false

  public static let CLASS_WHITELIST: PropertyInfo = {
    
class PInfo: PropertyInfo {
  let name = "classWhitelist"
  let classInfo: ClassInfo
  let transient = false
  let label = "Class Whitelist" // TODO localize
  let visibility = Visibility.RW
  lazy private(set) public var jsonParser: Parser? = AnyParser()

  let viewFactory: ((Context) -> FObject)? = nil

  public func set(_ obj: FObject, value: Any?) {
    obj.set(key: name, value: value)
  }
  public func get(_ obj: FObject) -> Any? {
    return obj.get(key: name)
  }
  public func compareValues(_ v1: Any?, _ v2: Any?) -> Int {
    
let v1 = v1 as AnyObject
let v2 = v2 as AnyObject
if v1.isEqual(v2) { return 0 }
return v1.hash ?? 0 > v2.hash ?? 0 ? 1 : -1
        
  }
  init(_ ci: ClassInfo) { classInfo = ci }
}
return PInfo(classInfo())
      
  }()

  private lazy var classWhitelist_Value_: PropertySlot = {
    
let s = PropertySlot([
  "object": self,
  "propertyName": "classWhitelist",
])
self.onDetach(Subscription(detach: {
  s.detach()
}))
return s
      
  }()

  private(set) public var classWhitelist_Value_Sub_: Subscription?

  public var classWhitelist$: Slot {
    get {
      return self.classWhitelist_Value_
    }
set(value) {
      
self.classWhitelist_Value_Sub_?.detach()
self.classWhitelist_Value_Sub_ = self.classWhitelist$.linkFrom(value)
self.onDetach(self.classWhitelist_Value_Sub_!)
      
    }
  }

  public var creationContext: Any? {
    get {
      
if _creationContext_inited_ {
  return _creationContext_
}

return nil

      
    }
set(value) {
      
self.set(key: "creationContext", value: value)
      
    }
  }

  var _creationContext_: Any? = nil

  var _creationContext_inited_: Bool = false

  public static let CREATION_CONTEXT: PropertyInfo = {
    
class PInfo: PropertyInfo {
  let name = "creationContext"
  let classInfo: ClassInfo
  let transient = false
  let label = "Creation Context" // TODO localize
  let visibility = Visibility.RW
  lazy private(set) public var jsonParser: Parser? = AnyParser()

  let viewFactory: ((Context) -> FObject)? = nil

  public func set(_ obj: FObject, value: Any?) {
    obj.set(key: name, value: value)
  }
  public func get(_ obj: FObject) -> Any? {
    return obj.get(key: name)
  }
  public func compareValues(_ v1: Any?, _ v2: Any?) -> Int {
    
let v1 = v1 as AnyObject
let v2 = v2 as AnyObject
if v1.isEqual(v2) { return 0 }
return v1.hash ?? 0 > v2.hash ?? 0 ? 1 : -1
        
  }
  init(_ ci: ClassInfo) { classInfo = ci }
}
return PInfo(classInfo())
      
  }()

  private lazy var creationContext_Value_: PropertySlot = {
    
let s = PropertySlot([
  "object": self,
  "propertyName": "creationContext",
])
self.onDetach(Subscription(detach: {
  s.detach()
}))
return s
      
  }()

  private(set) public var creationContext_Value_Sub_: Subscription?

  public var creationContext$: Slot {
    get {
      return self.creationContext_Value_
    }
set(value) {
      
self.creationContext_Value_Sub_?.detach()
self.creationContext_Value_Sub_ = self.creationContext$.linkFrom(value)
self.onDetach(self.creationContext_Value_Sub_!)
      
    }
  }

  private static var classInfo_: ClassInfo = ClassInfo_()

  public func `BoxRegistryBox_create`(_ args: [String:Any?] = [:]) -> BoxRegistryBox {
    
return __subContext__.create(BoxRegistryBox.self, args: args)!
      
  }

  public func `NamedBox_create`(_ args: [String:Any?] = [:]) -> NamedBox {
    
return __subContext__.create(NamedBox.self, args: args)!
      
  }

  public func `ClassWhitelistContext_create`(_ args: [String:Any?] = [:]) -> ClassWhitelistContext {
    
return __subContext__.create(ClassWhitelistContext.self, args: args)!
      
  }

  public func `LoggedLookupContext_create`(_ args: [String:Any?] = [:]) -> LoggedLookupContext {
    
return __subContext__.create(LoggedLookupContext.self, args: args)!
      
  }

  private func `_messagePortService_adapt_`(_ oldValue: Any?, _ newValue: Any?) -> Any? {
    return newValue
  }

  private func `_messagePortService_preSet_`(_ oldValue: Any?, _ newValue: Any?) -> Any? {
    return newValue
  }

  private func `_messagePortService_postSet_`(_ oldValue: Any?, _ newValue: Any?) {
    
  }

  private func `_socketService_adapt_`(_ oldValue: Any?, _ newValue: Any?) -> Any? {
    return newValue
  }

  private func `_socketService_preSet_`(_ oldValue: Any?, _ newValue: Any?) -> Any? {
    return newValue
  }

  private func `_socketService_postSet_`(_ oldValue: Any?, _ newValue: Any?) {
    
  }

  private func `_webSocketService_adapt_`(_ oldValue: Any?, _ newValue: Any?) -> Any? {
    return newValue
  }

  private func `_webSocketService_preSet_`(_ oldValue: Any?, _ newValue: Any?) -> Any? {
    return newValue
  }

  private func `_webSocketService_postSet_`(_ oldValue: Any?, _ newValue: Any?) {
    
  }

  private func `_registry_factory_`() -> Box? {
    return BoxRegistryBox_create()
  }

  private func `_registry_adapt_`(_ oldValue: Any?, _ newValue: Any?) -> Box? {
    return newValue as! Box?
  }

  private func `_registry_preSet_`(_ oldValue: Any?, _ newValue: Box?) -> Box? {
    return newValue
  }

  private func `_registry_postSet_`(_ oldValue: Any?, _ newValue: Box?) {
    
  }

  private func `_root_adapt_`(_ oldValue: Any?, _ newValue: Any?) -> Box? {
    return newValue as! Box?
  }

  private func `_root_preSet_`(_ oldValue: Any?, _ newValue: Box?) -> Box? {
    return newValue
  }

  private func `_root_postSet_`(_ oldValue: Any?, _ newValue: Box?) {
    NamedBox_create(["name": ""]).delegate = newValue
  }

  private func `_myname_factory_`() -> String {
    return "/com/foamdev/anonymous/" + String(FOAM_utils.next$UID())
  }

  private func `_myname_adapt_`(_ oldValue: Any?, _ newValue: Any?) -> String {
    
if let newValue = newValue as? String { return newValue }
if newValue != nil { return String(describing: newValue!) }
return ""
        
  }

  private func `_myname_preSet_`(_ oldValue: Any?, _ newValue: String) -> String {
    return newValue
  }

  private func `_myname_postSet_`(_ oldValue: Any?, _ newValue: String) {
    
  }

  private func `_me_factory_`() -> Any? {
    
        let me = NamedBox_create(["name": self.myname])
        me.delegate = self.registry;
        return me
      
  }

  private func `_me_adapt_`(_ oldValue: Any?, _ newValue: Any?) -> Any? {
    return newValue
  }

  private func `_me_preSet_`(_ oldValue: Any?, _ newValue: Any?) -> Any? {
    return newValue
  }

  private func `_me_postSet_`(_ oldValue: Any?, _ newValue: Any?) {
    
  }

  private func `_unsafe_adapt_`(_ oldValue: Any?, _ newValue: Any?) -> Bool {
    return newValue as! Bool
  }

  private func `_unsafe_preSet_`(_ oldValue: Any?, _ newValue: Bool) -> Bool {
    return newValue
  }

  private func `_unsafe_postSet_`(_ oldValue: Any?, _ newValue: Bool) {
    
  }

  private func `_classWhitelist_adapt_`(_ oldValue: Any?, _ newValue: Any?) -> Any? {
    return newValue
  }

  private func `_classWhitelist_preSet_`(_ oldValue: Any?, _ newValue: Any?) -> Any? {
    return newValue
  }

  private func `_classWhitelist_postSet_`(_ oldValue: Any?, _ newValue: Any?) {
    
  }

  private func `_creationContext_adapt_`(_ oldValue: Any?, _ newValue: Any?) -> Any? {
    return newValue
  }

  private func `_creationContext_preSet_`(_ oldValue: Any?, _ newValue: Any?) -> Any? {
    return newValue
  }

  private func `_creationContext_postSet_`(_ oldValue: Any?, _ newValue: Any?) {
    
  }

  public override func `ownClassInfo`() -> ClassInfo {
    return BoxContext.classInfo_
  }

  public override class func `classInfo`() -> ClassInfo {
    return BoxContext.classInfo_
  }

  public override func `clearProperty`(_ key: String) {
    switch key {

  case "messagePortService":
    _messagePortService_inited_ = false
    _messagePortService_ = nil

  

    // Only pub if there are listeners.
    if hasListeners(["propertyChange", "messagePortService"]) {
      _ = pub(["propertyChange", "messagePortService", messagePortService$])
    }
    break

  case "socketService":
    _socketService_inited_ = false
    _socketService_ = nil

  

    // Only pub if there are listeners.
    if hasListeners(["propertyChange", "socketService"]) {
      _ = pub(["propertyChange", "socketService", socketService$])
    }
    break

  case "webSocketService":
    _webSocketService_inited_ = false
    _webSocketService_ = nil

  

    // Only pub if there are listeners.
    if hasListeners(["propertyChange", "webSocketService"]) {
      _ = pub(["propertyChange", "webSocketService", webSocketService$])
    }
    break

  case "registry":
    _registry_inited_ = false
    _registry_ = nil

  

    // Only pub if there are listeners.
    if hasListeners(["propertyChange", "registry"]) {
      _ = pub(["propertyChange", "registry", registry$])
    }
    break

  case "root":
    _root_inited_ = false
    _root_ = nil

  

    // Only pub if there are listeners.
    if hasListeners(["propertyChange", "root"]) {
      _ = pub(["propertyChange", "root", root$])
    }
    break

  case "myname":
    _myname_inited_ = false
    _myname_ = nil

  

    // Only pub if there are listeners.
    if hasListeners(["propertyChange", "myname"]) {
      _ = pub(["propertyChange", "myname", myname$])
    }
    break

  case "me":
    _me_inited_ = false
    _me_ = nil

  

    // Only pub if there are listeners.
    if hasListeners(["propertyChange", "me"]) {
      _ = pub(["propertyChange", "me", me$])
    }
    break

  case "unsafe":
    _unsafe_inited_ = false
    _unsafe_ = nil

  

    // Only pub if there are listeners.
    if hasListeners(["propertyChange", "unsafe"]) {
      _ = pub(["propertyChange", "unsafe", unsafe$])
    }
    break

  case "classWhitelist":
    _classWhitelist_inited_ = false
    _classWhitelist_ = nil

  

    // Only pub if there are listeners.
    if hasListeners(["propertyChange", "classWhitelist"]) {
      _ = pub(["propertyChange", "classWhitelist", classWhitelist$])
    }
    break

  case "creationContext":
    _creationContext_inited_ = false
    _creationContext_ = nil

  

    // Only pub if there are listeners.
    if hasListeners(["propertyChange", "creationContext"]) {
      _ = pub(["propertyChange", "creationContext", creationContext$])
    }
    break

  default:
    super.clearProperty(key)
}
  }

  public override func `hasOwnProperty`(_ key: String) -> Bool {
    switch key {

  case "messagePortService": return `_messagePortService_inited_`

  case "socketService": return `_socketService_inited_`

  case "webSocketService": return `_webSocketService_inited_`

  case "registry": return `_registry_inited_`

  case "root": return `_root_inited_`

  case "myname": return `_myname_inited_`

  case "me": return `_me_inited_`

  case "unsafe": return `_unsafe_inited_`

  case "classWhitelist": return `_classWhitelist_inited_`

  case "creationContext": return `_creationContext_inited_`

  default:
    return super.hasOwnProperty(key)
}
  }

  public override func `get`(key: String) -> Any? {
    switch key {

  case "messagePortService": return `messagePortService`

  case "socketService": return `socketService`

  case "webSocketService": return `webSocketService`

  case "registry": return `registry`

  case "root": return `root`

  case "myname": return `myname`

  case "me": return `me`

  case "unsafe": return `unsafe`

  case "classWhitelist": return `classWhitelist`

  case "creationContext": return `creationContext`

  default:
    return super.get(key: key)
}
  }

  public override func `getSlot`(key: String) -> Slot? {
    switch key {

  case "messagePortService": return `messagePortService$`

  case "socketService": return `socketService$`

  case "webSocketService": return `webSocketService$`

  case "registry": return `registry$`

  case "root": return `root$`

  case "myname": return `myname$`

  case "me": return `me$`

  case "unsafe": return `unsafe$`

  case "classWhitelist": return `classWhitelist$`

  case "creationContext": return `creationContext$`


  default:
    return super.getSlot(key: key)
}
  }

  public override func `set`(key: String, value: Any?) {
    switch key {

  case "messagePortService$":
    messagePortService$ = value as! Slot
    return
  case "messagePortService":
  
    let oldValue: Any? = _messagePortService_inited_ ? self.`messagePortService` : nil
    _messagePortService_ = _messagePortService_preSet_(oldValue, _messagePortService_adapt_(oldValue, value))
    _messagePortService_inited_ = true
    _messagePortService_postSet_(oldValue, _messagePortService_)
    if hasListeners(["propertyChange", "messagePortService"]) && !FOAM_utils.equals(oldValue, _messagePortService_) {
      _ = pub(["propertyChange", "messagePortService", messagePortService$])
    }
    return

  case "socketService$":
    socketService$ = value as! Slot
    return
  case "socketService":
  
    let oldValue: Any? = _socketService_inited_ ? self.`socketService` : nil
    _socketService_ = _socketService_preSet_(oldValue, _socketService_adapt_(oldValue, value))
    _socketService_inited_ = true
    _socketService_postSet_(oldValue, _socketService_)
    if hasListeners(["propertyChange", "socketService"]) && !FOAM_utils.equals(oldValue, _socketService_) {
      _ = pub(["propertyChange", "socketService", socketService$])
    }
    return

  case "webSocketService$":
    webSocketService$ = value as! Slot
    return
  case "webSocketService":
  
    let oldValue: Any? = _webSocketService_inited_ ? self.`webSocketService` : nil
    _webSocketService_ = _webSocketService_preSet_(oldValue, _webSocketService_adapt_(oldValue, value))
    _webSocketService_inited_ = true
    _webSocketService_postSet_(oldValue, _webSocketService_)
    if hasListeners(["propertyChange", "webSocketService"]) && !FOAM_utils.equals(oldValue, _webSocketService_) {
      _ = pub(["propertyChange", "webSocketService", webSocketService$])
    }
    return

  case "registry$":
    registry$ = value as! Slot
    return
  case "registry":
  
    let oldValue: Any? = _registry_inited_ ? self.`registry` : nil
    _registry_ = _registry_preSet_(oldValue, _registry_adapt_(oldValue, value))
    _registry_inited_ = true
    _registry_postSet_(oldValue, _registry_)
    if hasListeners(["propertyChange", "registry"]) && !FOAM_utils.equals(oldValue, _registry_) {
      _ = pub(["propertyChange", "registry", registry$])
    }
    return

  case "root$":
    root$ = value as! Slot
    return
  case "root":
  
    let oldValue: Any? = _root_inited_ ? self.`root` : nil
    _root_ = _root_preSet_(oldValue, _root_adapt_(oldValue, value))
    _root_inited_ = true
    _root_postSet_(oldValue, _root_)
    if hasListeners(["propertyChange", "root"]) && !FOAM_utils.equals(oldValue, _root_) {
      _ = pub(["propertyChange", "root", root$])
    }
    return

  case "myname$":
    myname$ = value as! Slot
    return
  case "myname":
  
    let oldValue: Any? = _myname_inited_ ? self.`myname` : nil
    _myname_ = _myname_preSet_(oldValue, _myname_adapt_(oldValue, value))
    _myname_inited_ = true
    _myname_postSet_(oldValue, _myname_)
    if hasListeners(["propertyChange", "myname"]) && !FOAM_utils.equals(oldValue, _myname_) {
      _ = pub(["propertyChange", "myname", myname$])
    }
    return

  case "me$":
    me$ = value as! Slot
    return
  case "me":
  
    let oldValue: Any? = _me_inited_ ? self.`me` : nil
    _me_ = _me_preSet_(oldValue, _me_adapt_(oldValue, value))
    _me_inited_ = true
    _me_postSet_(oldValue, _me_)
    if hasListeners(["propertyChange", "me"]) && !FOAM_utils.equals(oldValue, _me_) {
      _ = pub(["propertyChange", "me", me$])
    }
    return

  case "unsafe$":
    unsafe$ = value as! Slot
    return
  case "unsafe":
  
    let oldValue: Any? = _unsafe_inited_ ? self.`unsafe` : nil
    _unsafe_ = _unsafe_preSet_(oldValue, _unsafe_adapt_(oldValue, value))
    _unsafe_inited_ = true
    _unsafe_postSet_(oldValue, _unsafe_)
    if hasListeners(["propertyChange", "unsafe"]) && !FOAM_utils.equals(oldValue, _unsafe_) {
      _ = pub(["propertyChange", "unsafe", unsafe$])
    }
    return

  case "classWhitelist$":
    classWhitelist$ = value as! Slot
    return
  case "classWhitelist":
  
    let oldValue: Any? = _classWhitelist_inited_ ? self.`classWhitelist` : nil
    _classWhitelist_ = _classWhitelist_preSet_(oldValue, _classWhitelist_adapt_(oldValue, value))
    _classWhitelist_inited_ = true
    _classWhitelist_postSet_(oldValue, _classWhitelist_)
    if hasListeners(["propertyChange", "classWhitelist"]) && !FOAM_utils.equals(oldValue, _classWhitelist_) {
      _ = pub(["propertyChange", "classWhitelist", classWhitelist$])
    }
    return

  case "creationContext$":
    creationContext$ = value as! Slot
    return
  case "creationContext":
  
    let oldValue: Any? = _creationContext_inited_ ? self.`creationContext` : nil
    _creationContext_ = _creationContext_preSet_(oldValue, _creationContext_adapt_(oldValue, value))
    _creationContext_inited_ = true
    _creationContext_postSet_(oldValue, _creationContext_)
    if hasListeners(["propertyChange", "creationContext"]) && !FOAM_utils.equals(oldValue, _creationContext_) {
      _ = pub(["propertyChange", "creationContext", creationContext$])
    }
    return

  default: break
}
super.set(key: key, value: value)
  }

  override func `_createExports_`() -> [String:Any?] {
    var args = super._createExports_()

args["creationContext"] = creationContext$

args["me"] = me$

args["messagePortService"] = messagePortService$

args["registry"] = registry$

args["root"] = root$

args["socketService"] = socketService$

args["webSocketService"] = webSocketService$

return args
  }

  // GENERATED CODE. DO NOT MODIFY BY HAND.
  private class ClassInfo_: ClassInfo {
  
    lazy var id: String = "foam.box.Context"

    lazy var label: String = "Context"

    lazy var parent: ClassInfo? = nil

    lazy var ownAxioms: [Axiom] = [MESSAGE_PORT_SERVICE,SOCKET_SERVICE,WEB_SOCKET_SERVICE,REGISTRY,ROOT,MYNAME,ME,UNSAFE,CLASS_WHITELIST,CREATION_CONTEXT]

    lazy var cls: AnyClass = BoxContext.self

    func `create`(args: [String:Any?] = [:], x: Context) -> Any {
      return BoxContext(args, x)
    }

  }

}