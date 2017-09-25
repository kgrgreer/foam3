// GENERATED CODE. DO NOT MODIFY BY HAND.
import Foundation
public class BoxService: AbstractFObject {

  public var server: ClassInfo {
    get {
      
if _server_inited_ {
  return _server_!
}

fatalError("No default value for server")

      
    }
set(value) {
      
self.set(key: "server", value: value)
      
    }
  }

  var _server_: ClassInfo! = nil

  var _server_inited_: Bool = false

  public static let SERVER: PropertyInfo = {
    
class PInfo: PropertyInfo {
  let name = "server"
  let classInfo: ClassInfo
  let transient = false
  let label = "Server" // TODO localize
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

  private lazy var server_Value_: PropertySlot = {
    
let s = PropertySlot([
  "object": self,
  "propertyName": "server",
])
self.onDetach(Subscription(detach: {
  s.detach()
}))
return s
      
  }()

  private(set) public var server_Value_Sub_: Subscription?

  public var server$: Slot {
    get {
      return self.server_Value_
    }
set(value) {
      
self.server_Value_Sub_?.detach()
self.server_Value_Sub_ = self.server$.linkFrom(value)
self.onDetach(self.server_Value_Sub_!)
      
    }
  }

  public var client: ClassInfo {
    get {
      
if _client_inited_ {
  return _client_!
}

fatalError("No default value for client")

      
    }
set(value) {
      
self.set(key: "client", value: value)
      
    }
  }

  var _client_: ClassInfo! = nil

  var _client_inited_: Bool = false

  public static let CLIENT: PropertyInfo = {
    
class PInfo: PropertyInfo {
  let name = "client"
  let classInfo: ClassInfo
  let transient = false
  let label = "Client" // TODO localize
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

  private lazy var client_Value_: PropertySlot = {
    
let s = PropertySlot([
  "object": self,
  "propertyName": "client",
])
self.onDetach(Subscription(detach: {
  s.detach()
}))
return s
      
  }()

  private(set) public var client_Value_Sub_: Subscription?

  public var client$: Slot {
    get {
      return self.client_Value_
    }
set(value) {
      
self.client_Value_Sub_?.detach()
self.client_Value_Sub_ = self.client$.linkFrom(value)
self.onDetach(self.client_Value_Sub_!)
      
    }
  }

  public var next: BoxService? {
    get {
      
if _next_inited_ {
  return _next_
}

return nil

      
    }
set(value) {
      
self.set(key: "next", value: value)
      
    }
  }

  var _next_: BoxService? = nil

  var _next_inited_: Bool = false

  public static let NEXT: PropertyInfo = {
    
class PInfo: PropertyInfo {
  let name = "next"
  let classInfo: ClassInfo
  let transient = false
  let label = "Next" // TODO localize
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

  private lazy var next_Value_: PropertySlot = {
    
let s = PropertySlot([
  "object": self,
  "propertyName": "next",
])
self.onDetach(Subscription(detach: {
  s.detach()
}))
return s
      
  }()

  private(set) public var next_Value_Sub_: Subscription?

  public var next$: Slot {
    get {
      return self.next_Value_
    }
set(value) {
      
self.next_Value_Sub_?.detach()
self.next_Value_Sub_ = self.next$.linkFrom(value)
self.onDetach(self.next_Value_Sub_!)
      
    }
  }

  lazy var serverBox$: Slot = {
    

return ConstantSlot([
  "value": { [weak self] (args: [Any?]) throws -> Any? in
    if self == nil { fatalError() }

    let box = args[0] as! Box

    
    return self!.`serverBox`(
        _: box)
  }
])
      
  }()

  public static let SERVER_BOX: MethodInfo = {
    
class MInfo: MethodInfo {
  let name = "serverBox"
  let args: [MethodArg] = [] //TODO
  let classInfo: ClassInfo
  init(_ ci: ClassInfo) { classInfo = ci }
}
return MInfo(classInfo())
      
  }()

  lazy var clientBox$: Slot = {
    

return ConstantSlot([
  "value": { [weak self] (args: [Any?]) throws -> Any? in
    if self == nil { fatalError() }

    let box = args[0] as! Box

    
    return self!.`clientBox`(
        _: box)
  }
])
      
  }()

  public static let CLIENT_BOX: MethodInfo = {
    
class MInfo: MethodInfo {
  let name = "clientBox"
  let args: [MethodArg] = [] //TODO
  let classInfo: ClassInfo
  init(_ ci: ClassInfo) { classInfo = ci }
}
return MInfo(classInfo())
      
  }()

  private static var classInfo_: ClassInfo = ClassInfo_()

  private func `_server_adapt_`(_ oldValue: Any?, _ newValue: Any?) -> ClassInfo {
    return newValue as! ClassInfo
  }

  private func `_server_preSet_`(_ oldValue: Any?, _ newValue: ClassInfo) -> ClassInfo {
    return newValue
  }

  private func `_server_postSet_`(_ oldValue: Any?, _ newValue: ClassInfo) {
    
  }

  private func `_client_adapt_`(_ oldValue: Any?, _ newValue: Any?) -> ClassInfo {
    return newValue as! ClassInfo
  }

  private func `_client_preSet_`(_ oldValue: Any?, _ newValue: ClassInfo) -> ClassInfo {
    return newValue
  }

  private func `_client_postSet_`(_ oldValue: Any?, _ newValue: ClassInfo) {
    
  }

  private func `_next_adapt_`(_ oldValue: Any?, _ newValue: Any?) -> BoxService? {
    return newValue as! BoxService?
  }

  private func `_next_preSet_`(_ oldValue: Any?, _ newValue: BoxService?) -> BoxService? {
    return newValue
  }

  private func `_next_postSet_`(_ oldValue: Any?, _ newValue: BoxService?) {
    
  }

  public func `serverBox`(_ box: Box) -> Box {
    
let box2: Box = next?.serverBox(box) ?? box
return server.create(args: ["delegate": box2], x: __subContext__) as! Box
      
  }

  public func `clientBox`(_ box: Box) -> Box {
    
let box2 = client.create(args: ["delegate": box], x: __subContext__) as! Box
return next?.clientBox(box2) ?? box2
      
  }

  public override func `ownClassInfo`() -> ClassInfo {
    return BoxService.classInfo_
  }

  public override class func `classInfo`() -> ClassInfo {
    return BoxService.classInfo_
  }

  public override func `clearProperty`(_ key: String) {
    switch key {

  case "server":
    _server_inited_ = false
    _server_ = nil

  

    // Only pub if there are listeners.
    if hasListeners(["propertyChange", "server"]) {
      _ = pub(["propertyChange", "server", server$])
    }
    break

  case "client":
    _client_inited_ = false
    _client_ = nil

  

    // Only pub if there are listeners.
    if hasListeners(["propertyChange", "client"]) {
      _ = pub(["propertyChange", "client", client$])
    }
    break

  case "next":
    _next_inited_ = false
    _next_ = nil

  

    // Only pub if there are listeners.
    if hasListeners(["propertyChange", "next"]) {
      _ = pub(["propertyChange", "next", next$])
    }
    break

  default:
    super.clearProperty(key)
}
  }

  public override func `hasOwnProperty`(_ key: String) -> Bool {
    switch key {

  case "server": return `_server_inited_`

  case "client": return `_client_inited_`

  case "next": return `_next_inited_`

  default:
    return super.hasOwnProperty(key)
}
  }

  public override func `get`(key: String) -> Any? {
    switch key {

  case "server": return `server`

  case "client": return `client`

  case "next": return `next`

  default:
    return super.get(key: key)
}
  }

  public override func `getSlot`(key: String) -> Slot? {
    switch key {

  case "server": return `server$`

  case "client": return `client$`

  case "next": return `next$`


  case "serverBox": return `serverBox$`

  case "clientBox": return `clientBox$`

  default:
    return super.getSlot(key: key)
}
  }

  public override func `set`(key: String, value: Any?) {
    switch key {

  case "server$":
    server$ = value as! Slot
    return
  case "server":
  
    let oldValue: Any? = _server_inited_ ? self.`server` : nil
    _server_ = _server_preSet_(oldValue, _server_adapt_(oldValue, value))
    _server_inited_ = true
    _server_postSet_(oldValue, _server_)
    if hasListeners(["propertyChange", "server"]) && !FOAM_utils.equals(oldValue, _server_) {
      _ = pub(["propertyChange", "server", server$])
    }
    return

  case "client$":
    client$ = value as! Slot
    return
  case "client":
  
    let oldValue: Any? = _client_inited_ ? self.`client` : nil
    _client_ = _client_preSet_(oldValue, _client_adapt_(oldValue, value))
    _client_inited_ = true
    _client_postSet_(oldValue, _client_)
    if hasListeners(["propertyChange", "client"]) && !FOAM_utils.equals(oldValue, _client_) {
      _ = pub(["propertyChange", "client", client$])
    }
    return

  case "next$":
    next$ = value as! Slot
    return
  case "next":
  
    let oldValue: Any? = _next_inited_ ? self.`next` : nil
    _next_ = _next_preSet_(oldValue, _next_adapt_(oldValue, value))
    _next_inited_ = true
    _next_postSet_(oldValue, _next_)
    if hasListeners(["propertyChange", "next"]) && !FOAM_utils.equals(oldValue, _next_) {
      _ = pub(["propertyChange", "next", next$])
    }
    return

  default: break
}
super.set(key: key, value: value)
  }

  // GENERATED CODE. DO NOT MODIFY BY HAND.
  private class ClassInfo_: ClassInfo {
  
    lazy var id: String = "foam.box.BoxService"

    lazy var label: String = "Box Service"

    lazy var parent: ClassInfo? = nil

    lazy var ownAxioms: [Axiom] = [SERVER,CLIENT,NEXT,SERVER_BOX,CLIENT_BOX]

    lazy var cls: AnyClass = BoxService.self

    func `create`(args: [String:Any?] = [:], x: Context) -> Any {
      return BoxService(args, x)
    }

  }

}