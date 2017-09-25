// GENERATED CODE. DO NOT MODIFY BY HAND.
import Foundation
public class LoggedLookupContext: AbstractFObject {

  public var record: [String:Any?] {
    get {
      
if _record_inited_ {
  return _record_!
}

return [:]

      
    }
set(value) {
      
self.set(key: "record", value: value)
      
    }
  }

  var _record_: [String:Any?]! = nil

  var _record_inited_: Bool = false

  public static let RECORD: PropertyInfo = {
    
class PInfo: PropertyInfo {
  let name = "record"
  let classInfo: ClassInfo
  let transient = false
  let label = "Record" // TODO localize
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

  private lazy var record_Value_: PropertySlot = {
    
let s = PropertySlot([
  "object": self,
  "propertyName": "record",
])
self.onDetach(Subscription(detach: {
  s.detach()
}))
return s
      
  }()

  private(set) public var record_Value_Sub_: Subscription?

  public var record$: Slot {
    get {
      return self.record_Value_
    }
set(value) {
      
self.record_Value_Sub_?.detach()
self.record_Value_Sub_ = self.record$.linkFrom(value)
self.onDetach(self.record_Value_Sub_!)
      
    }
  }

  lazy var lookup$: Slot = {
    

return ConstantSlot([
  "value": { [weak self] (args: [Any?]) throws -> Any? in
    if self == nil { fatalError() }

    
    return self!.`lookup`(
        )
  }
])
      
  }()

  public static let LOOKUP: MethodInfo = {
    
class MInfo: MethodInfo {
  let name = "lookup"
  let args: [MethodArg] = [] //TODO
  let classInfo: ClassInfo
  init(_ ci: ClassInfo) { classInfo = ci }
}
return MInfo(classInfo())
      
  }()

  private static var classInfo_: ClassInfo = ClassInfo_()

  private func `_record_adapt_`(_ oldValue: Any?, _ newValue: Any?) -> [String:Any?] {
    return newValue as! [String:Any?]
  }

  private func `_record_preSet_`(_ oldValue: Any?, _ newValue: [String:Any?]) -> [String:Any?] {
    return newValue
  }

  private func `_record_postSet_`(_ oldValue: Any?, _ newValue: [String:Any?]) {
    
  }

  public func `lookup`() {
    fatalError()
  }

  public override func `ownClassInfo`() -> ClassInfo {
    return LoggedLookupContext.classInfo_
  }

  public override class func `classInfo`() -> ClassInfo {
    return LoggedLookupContext.classInfo_
  }

  public override func `clearProperty`(_ key: String) {
    switch key {

  case "record":
    _record_inited_ = false
    _record_ = nil

  

    // Only pub if there are listeners.
    if hasListeners(["propertyChange", "record"]) {
      _ = pub(["propertyChange", "record", record$])
    }
    break

  default:
    super.clearProperty(key)
}
  }

  public override func `hasOwnProperty`(_ key: String) -> Bool {
    switch key {

  case "record": return `_record_inited_`

  default:
    return super.hasOwnProperty(key)
}
  }

  public override func `get`(key: String) -> Any? {
    switch key {

  case "record": return `record`

  default:
    return super.get(key: key)
}
  }

  public override func `getSlot`(key: String) -> Slot? {
    switch key {

  case "record": return `record$`


  default:
    return super.getSlot(key: key)
}
  }

  public override func `set`(key: String, value: Any?) {
    switch key {

  case "record$":
    record$ = value as! Slot
    return
  case "record":
  
    let oldValue: Any? = _record_inited_ ? self.`record` : nil
    _record_ = _record_preSet_(oldValue, _record_adapt_(oldValue, value))
    _record_inited_ = true
    _record_postSet_(oldValue, _record_)
    if hasListeners(["propertyChange", "record"]) && !FOAM_utils.equals(oldValue, _record_) {
      _ = pub(["propertyChange", "record", record$])
    }
    return

  default: break
}
super.set(key: key, value: value)
  }

  override func `_createExports_`() -> [String:Any?] {
    var args = super._createExports_()

args["lookup"] = lookup$

return args
  }

  // GENERATED CODE. DO NOT MODIFY BY HAND.
  private class ClassInfo_: ClassInfo {
  
    lazy var id: String = "foam.box.LoggedLookupContext"

    lazy var label: String = "Logged Lookup Context"

    lazy var parent: ClassInfo? = nil

    lazy var ownAxioms: [Axiom] = [RECORD,LOOKUP]

    lazy var cls: AnyClass = LoggedLookupContext.self

    func `create`(args: [String:Any?] = [:], x: Context) -> Any {
      return LoggedLookupContext(args, x)
    }

  }

}