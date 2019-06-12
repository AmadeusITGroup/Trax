const MP_TRACKABLE = "ΔTrackable",
    MP_CHANGE_VERSION = "ΔChangeVersion", // last changed meta property
    MP_META_DATA = "ΔMd",
    MP_DATA_FACTORY = "ΔDataFactory";

let TRAX_COUNTER = 1;

interface TraxObject {
    ΔTrackable: true;
    ΔChangeVersion: number;
    ΔMd: TraxMetaData | undefined;
}

interface TraxMetaData {
    parent?: TraxObject;
    nextParents?: TraxObject[];
    refreshNode?: RefreshNode;
    refreshPriority: number;                       // number of child nodes that need to be refreshed before this node - priority 0 means that the node has to be refreshed first
    watchers?: ((any) => void)[];                  // list of watchers associated to a DataNode instance
    onNextChange?: ((value) => any)[] | undefined; // list of callbacks to call on next change (will be reset after that change)
}

function initMetaData(o: TraxObject): TraxMetaData {
    if (!o.ΔMd) {
        return o.ΔMd = {
            parent: undefined,
            nextParents: undefined,
            refreshNode: undefined,
            refreshPriority: 0,
            watchers: undefined,
            onNextChange: undefined
        }
    }
    return o.ΔMd;
}

/** 
 * Data object decorator
 */
export function Data(c: any) { } // empty: will be replaced at compilation time

/** 
 * Debug utility to print the generated class on the standard output
 * e.g. @Data @log MyData {}
 */
export function log(c: any) { }

// TODO
export function ref(proto, key: string) {

}

// TODO
export function computed(proto, propName: string, descriptor: PropertyDescriptor) {

}

// -----------------------------------------------------------------------------------------------------------------------------
// trax public apis

export function version(o: any /*DataObject*/): number {
    return 0; // TODO
}

// export function touch(o: any /*DataObject*/): number {
//     // necessary to touch param nodes if $content changes (= contains instructions)
//     return 0; // return new version if DataObject or 0 if not
// }

export function hasProperty(o: any /*TraxObject*/, property: string): boolean {
    return false; // TODO
}

export function isDataObject(o: any /*TraxObject*/): boolean {
    return !!(o && o[MP_TRACKABLE] === true);
}

export function isBeingChanged(o: any /*TraxObject*/): boolean {
    return o[MP_CHANGE_VERSION] === TRAX_COUNTER;
}

/**
 * Return a promise that will be resolved when all mutations are processed and the object is immutable
 * The function will return the new version of the data object (previous version will still be available with its original values)
 * @param d {HObject} the data object to process
 */
export async function changeComplete<T>(o: T): Promise<T> {
    // this function returns when the dataset is processed (and becomes immutable)
    let d = o as any;
    if (!isBeingChanged(o)) return o;

    let md = d[MP_META_DATA] as TraxMetaData | undefined;
    if (md) {
        return new Promise(function (resolve, reject) {
            let onNextChange = md!.onNextChange;
            if (!onNextChange) {
                md!.onNextChange = [resolve];
            } else {
                onNextChange.push(resolve);
            }
        }) as any;
    }
    return d;
}

// -----------------------------------------------------------------------------------------------------------------------------
// trax private apis (generated code)

/**
 * Data Object class decorator
 * @param c the data object constructor
 */
export function ΔD(c: any) {
    let proto = c.prototype;

    proto[MP_TRACKABLE] = true;
    proto[MP_CHANGE_VERSION] = 0;
}

/**
 * Property decorator
 * Adds getter / setter 
 * @param factory 
 */
export function Δp<T>(factory: Factory<T>, canBeNull?: 1) {
    return function (proto, key: string) {
        // proto = object prototype
        // key = the property name (e.g. "value")
        let ΔΔkey = "ΔΔ" + key, cbn = canBeNull === 1;
        addPropertyInfo(proto, key, false, {
            get: function () { return $get(<any>this, ΔΔkey, key, factory, cbn); },
            set: function (v) { $set(<any>this, ΔΔkey, v, factory); },
            enumerable: true,
            configurable: true
        });
    }
}

interface Constructor<T> {
    new(): T;
}

interface Factory<T> {
    ΔDataFactory?: true;
    (json?: Object): T;
}

/**
 * Generate a factory function for a given Data class reference
 */
export function Δf<T>(dataObjectClassRef: Constructor<T>): Factory<T> {
    function factory(json: Object) {
        return new dataObjectClassRef();
    }
    // factory[MP_DATA_FACTORY] = true;
    return factory;
}

/**
 * Factory function for a new string
 */
export function ΔfStr() {
    return "";
}

/**
 * Factory function for numbers
 */
export function ΔfNbr() {
    return 0;
}

/**
 * Factory function for booleans
 */
export function ΔfBool() {
    return false;
}

/**
 * Fills a proto info structure with some more property description
 * @param proto the proto info structure
 * @param propName name of the property
 * @param isDataNode true if the property is a datanode
 */
function addPropertyInfo(proto: any, propName: string, isDataNode: boolean, desc: PropertyDescriptor | undefined) {
    // let nm1 = isDataNode ? "$dProps" : "$vProps",
    //     nm2 = isDataNode ? "$dProps2" : "$vProps2";
    // if (!proto[nm1]) {
    //     proto[nm1] = [];
    //     proto[nm2] = [];
    //     proto["$pMap"] = {}; // property map
    // } else if (!proto.hasOwnProperty(nm1)) {
    //     // we are in a sub-class of a dataset -> copy the proto arrays
    //     proto[nm1] = proto[nm1].slice(0);
    //     proto[nm2] = proto[nm2].slice(0);
    // }
    // no: proto[nm1].push(propName);
    // no: proto[nm2].push("$$" + propName);
    // proto["$pMap"][propName] = 1;
    // proto["$$" + propName] = defaultValue;
    if (desc && delete proto[propName]) {
        Object.defineProperty(proto, propName, desc);
    }
}

/**
 * Internal property getter function
 * @param o the Data object on which to get the property
 * @param ΔΔPropName the property name (should start with "$$" - e.g. "$$value")
 * @param propName [optional] the json data node property name - should only be set for data node properties. Same value as propName but without the $$ prefix
 * @param cf [optional] the constructor or factory associated with the property Object
 */
function $get<T>(o: TraxObject, ΔΔPropName: string, propName: string, factory: Factory<T>, canBeNull: boolean): any {
    // if (o.$computeDependencies) {
    //     o.$computeDependencies[propName] = true;
    // }
    // if (propName && cf && o["$json"]) {
    //     // init object from json structure
    //     let json = o["$json"];
    //     if (json.data) {
    //         let target = o, $$value: any = undefined;
    //         if (o.$next) {
    //             // object is now immutable
    //             if (o[$$propName] !== undefined) {
    //                 // prop has already been set
    //                 return o[$$propName];
    //             }
    //             // as object is immutable and as value has never been set on this object
    //             // we get the value from the last version
    //             target = latestVersion(target);
    //         }
    //         target = target.$mn || target;

    //         if (target[$$propName] === undefined) {
    //             // first time this property is retrieved
    //             let newCount = (--json.count), // a new property is read
    //                 jsonValue = json.data[propName];
    //             if (newCount === 0) {
    //                 // delete $json.data reference as all dn props have been read
    //                 json.data = undefined;
    //                 target["$json"] = undefined;
    //             }
    //             if ((jsonValue === undefined || jsonValue === null) && !createDefault) {
    //                 $$value = null;
    //             } else {
    //                 $$value = create(<any>cf, jsonValue);
    //                 // connect to parent
    //                 connectChildToParent(target, $$value);
    //             }
    //             target[$$propName] = $$value;
    //         }

    //         if ($$value !== undefined) {
    //             if (o.$next) {
    //                 // push new value to all next versions
    //                 let nd = o, c = 0;
    //                 while (o.$next && c < MAX_ITERATION) {
    //                     o[$$propName] = $$value;
    //                     o = o.$next;
    //                     c++;
    //                 }
    //                 if (c === MAX_ITERATION) {
    //                     console.error("Hibe error: Max Iteration reached on dataset get");
    //                 }
    //                 if (o.$mn) {
    //                     o.$mn[$$propName] = $$value;
    //                 }
    //             }
    //             return $$value
    //         }
    //     }
    // }
    let value = o[ΔΔPropName];
    if (value === undefined) {
        value = o[ΔΔPropName] = canBeNull ? null : factory();
        connectChildToParent(o, value);
    }
    return value;
}

/**
 * Internal property setter function
 * @param obj the DataNode on which to set the property
 * @param $$propName the name or index of the property (should start with "$$" - e.g. "$$value")
 * @param newValue the new property value (will be compared to current value)
 * @param cf [optional] the constructor or factory associated with the property Object
 * @param propHolder the name of the property holding all properties (e.g. for DatList) - optional
 */
function $set<T>(obj: TraxObject, ΔΔPropName: string | number, newValue: any, factory: Factory<T>, propHolder?: string | undefined) {
    let isTraxValue = isDataObject(newValue) || factory.ΔDataFactory;

    // if (isTraxValue && newValue && newValue.$kind !== DATASET) {
    //     if ((<any>cf).$createProxy) {
    //         let v = (<any>cf).$createProxy(newValue);
    //         if (v) {
    //             newValue = v;
    //         } else {
    //             isTraxValue = false;
    //         }
    //     }
    // }
    let updateVal = false, currentValue = obj[ΔΔPropName];
    if (obj.ΔChangeVersion === TRAX_COUNTER) {
        // object has already been changed
        updateVal = true;
    } else {
        if (currentValue !== newValue) {
            $touch(obj, true);
            updateVal = true;
        }
    }
    if (updateVal) {
        if (isTraxValue && !propHolder && newValue === undefined) {
            // undefined is used to determine when the property has never been set (cf. get when a json object is set for lazy load)
            newValue = null;
        }

        if (isTraxValue || (currentValue && currentValue[MP_TRACKABLE])) {
            updateSubDataRefs(obj, currentValue, newValue as TraxObject);
        }
        obj[ΔΔPropName] = newValue;
    }
}

/**
 * Recursively mark a node and its parent as changed (i.e. create a mutable next object on them)
 * @param o the data node to mark as changed
 * @param selfChange true if the call is triggered by a change of a direct property, false otherwise (i.e. when in recursive call)
 */
function $touch(o: TraxObject, selfChange: boolean = false) {
    // return true if the node was touched, false if it was already touched (i.e. marked as modified in the current update round)
    let firstTimeTouch = true;

    if (o.ΔChangeVersion === TRAX_COUNTER) {
        // node already modified
        firstTimeTouch = false;
    } else {
        o.ΔChangeVersion = TRAX_COUNTER;
    }

    if (selfChange) {
        refreshContext.ensureRefresh(o);
    } else {
        // change is triggered by a child reference that will hold the refreshNode
        refreshContext.increaseRefreshPriority(o);
    }
    if (firstTimeTouch) {
        // recursively touch on parent nodes
        let md = o.ΔMd;
        if (md && md.parent) {
            $touch(md.parent, false);
            if (md.nextParents) {
                for (let p of md.nextParents) {
                    $touch(p, false);
                }
            }
        }
    }
}

/**
 * Update the child references of a data node when a child reference changes
 * (i.e. add/remove dataNode from child parents collection)
 * @param o 
 * @param currentChild 
 * @param newChild 
 */
function updateSubDataRefs(o: TraxObject, currentChild: TraxObject | null, newChild: TraxObject | null) {
    // remove parent ref from old ref
    disconnectChildFromParent(o, currentChild);
    // add parent ref to new ref
    connectChildToParent(o, newChild);
}

/**
 * Disconnect a child node from its parent
 * (i.e. remove the parent from the child parents collection)
 * @param parent 
 * @param child 
 */
function disconnectChildFromParent(parent: TraxObject, child: TraxObject | null) {
    if (child) {
        // if child is immutable, it last version still holds the reference to the current parent
        let md = child.ΔMd;
        if (md && md.parent) {
            let foundInParent1 = false;
            if (md.parent === parent) {
                md.parent = undefined;
                foundInParent1 = true;
            }

            let np = md.nextParents;
            if (np) {
                if (!foundInParent1) {
                    let idx = np.indexOf(parent);
                    if (idx > -1) {
                        if (np.length === 1) {
                            np = md.nextParents = undefined;
                        } else {
                            np.splice(idx, 1);
                        }
                    }
                }
                if (!md.parent && np && np.length) {
                    if (np.length === 1) {
                        md.parent = np[0];
                        md.nextParents = undefined;
                    } else {
                        md.parent = np.shift();
                    }
                }
            }

            if (isBeingChanged(child)) {
                refreshContext.decreaseRefreshPriority(parent);
            }
        }
    }
}

/**
 * Connect a child node to a new parent
 * (i.e. add the parent from the child parents collection)
 * @param parent 
 * @param child 
 */
function connectChildToParent(parent: TraxObject, child: TraxObject | null) {
    if (child) {
        let md = initMetaData(child);
        if (!md.parent) {
            md.parent = parent;
        } else if (md.nextParents) {
            md.nextParents.push(parent);
        } else {
            md.nextParents = [parent];
        }
        if (isBeingChanged(child)) {
            // parent will be refreshed after the child
            refreshContext.increaseRefreshPriority(parent);
        }
    }
}

// -----------------------------------------------------------------------------------------------------------------------------
// Refresh classes

/**
 * Refresh linked list: contains all 'start' nodes that need to be processed/refreshed
 */
class RefreshNode {
    next: RefreshNode | undefined;
    prev: RefreshNode | undefined;
    dataNode: TraxObject | undefined;
    ctxt: RefreshContext | undefined;

    constructor(dn: TraxObject) {
        this.dataNode = dn;
    }
}

/**
 * Data Node watcher
 */
interface DnWatcher {
    dataNode: TraxObject;
    cbList: ((DataNode) => void)[];
}

/**
 * Context holding a linked list of nodes that need to be refreshed
 */
class RefreshContext {
    first: RefreshNode | undefined;
    last: RefreshNode | undefined;

    constructor() {
        TRAX_COUNTER++;
    }

    /**
     * Get a refresh node from the pool (or create a new one) and initialize it
     * @param dn the DataNode to associate to the refresh node
     */
    add(dn: TraxObject): RefreshNode {
        let rn = refreshPool.pop();
        if (!rn) {
            rn = new RefreshNode(dn);
        } else {
            rn.dataNode = dn;
        }

        rn.prev = rn.next = undefined;
        rn.ctxt = this;
        if (!this.first) {
            this.first = this.last = rn;
            Promise.resolve().then(() => { this.refresh() });
        } else {
            // add last
            let last = this.last!;
            last.next = rn;
            rn.prev = last;
            this.last = rn;
        }
        return rn;
    }


    /**
     * Release and reset a refresh node. Set it back to the refresh node pool
     * @param rn the RefreshNode to release
     */
    release(rn: RefreshNode) {
        if (rn.ctxt !== this) {
            return;
        }
        let md = rn.dataNode!.ΔMd; // latestVersion(rn.dataNode)
        if (!md) return;
        md.refreshNode = undefined;
        // warning: refreshDependencies may be > 0 when node is removed from list when a child takes precedence
        rn.dataNode = undefined;
        if (rn.prev) {
            if (rn.next) {
                rn.prev.next = rn.next;
                rn.next.prev = rn.prev;
            } else {
                // rn is last
                rn.prev.next = undefined;
                this.last = rn.prev;
            }
        } else if (rn.next) {
            // the node should be first
            if (this.first === rn) {
                this.first = rn.next;
            }
            rn.next.prev = undefined;
        } else {
            // both prev and next are null: this node should be the only node in the list
            if (this.first === rn) {
                this.first = this.last = undefined;
            }
        }
        rn.ctxt = rn.prev = rn.next = undefined; // release all references
        refreshPool.push(rn);
    }

    /**
     * Ensure a data node will be refreshed
     * @param o 
     */
    ensureRefresh(o: TraxObject) {
        let md = initMetaData(o);
        if (md.refreshPriority === 0 && !md.refreshNode) {
            md.refreshNode = this.add(o);
        }
    }

    /**
     * Increase the refresh priority of a data node
     * @param o
     */
    increaseRefreshPriority(o: TraxObject) {
        let md = initMetaData(o);
        if (md) {
            md.refreshPriority++;
            if (md.refreshNode) {
                // priority is no more 0 so if node was in the refresh list we should remove it
                md.refreshNode.ctxt!.release(md.refreshNode);
                md.refreshNode = undefined;
            }
        }
    }

    /**
     * Decrease the refresh priority of a data node
     * E.g. when a child node has been refreshed
     * @param o the data node
     */
    decreaseRefreshPriority(o?: TraxObject) {
        if (!o) return;
        let md = o.ΔMd;
        if (md) {
            let rd = --md.refreshPriority;
            if (rd == 0) {
                // add to refresh list
                md.refreshNode = this.add(o);
            }
        }
    }

    /**
     * Decrease the refresh priority of a data node list
     * @param d the data node
     */
    decreaseRefreshPriorityOnList(list?: TraxObject[]) {
        if (list) {
            for (let d of list) {
                this.decreaseRefreshPriority(d);
            }
        }
    }

    /**
     * Refresh all the data nodes associated to the current context
     * @param syncWatchers flag indicating if watch callbacks should be called synchronously (default: true)
     */
    refresh(syncWatchers = true): number {
        let ctxt = this;
        if (!ctxt.first) {
            return 0;
        }
        refreshContext = new RefreshContext();

        let o: TraxObject,
            md: TraxMetaData,
            nextNext: RefreshNode | undefined,
            keepGoing = true,
            next = ctxt.first,
            instanceWatchers: DnWatcher[] = [],
            tempWatchers: DnWatcher[] = [];

        // create new versions
        while (keepGoing) {
            if (!next) {
                keepGoing = false;
            } else {
                o = next.dataNode!;
                processNode(o, instanceWatchers, tempWatchers);
                md = o.ΔMd!;
                ctxt.decreaseRefreshPriority(md.parent)
                ctxt.decreaseRefreshPriorityOnList(md.nextParents);
                nextNext = next.next;
                ctxt.release(next);
                if (nextNext) {
                    next = nextNext;
                } else {
                    if (next === ctxt.first) {
                        keepGoing = false;
                    } else {
                        next = ctxt.first;
                    }
                }
            }
        }
        if (ctxt.first) {
            // some node could not be refreshed: we have a circular dependency
            console.error("Hibe error: some node could not be properly refreshed because of a circular dependency");
        }

        let nbrOfCallbacks = instanceWatchers.length + tempWatchers.length;
        if (nbrOfCallbacks) {
            if (syncWatchers) {
                // notify all instance watchers (generated through calls to watch(...))
                callWatchers(instanceWatchers);
                // notify all temporary watchers (generated through calls to processingDone(...))
                callWatchers(tempWatchers);
            } else {
                // run watches in a micro task
                Promise.resolve().then(() => {
                    callWatchers(instanceWatchers);
                    callWatchers(tempWatchers);
                });
            }
        }

        return nbrOfCallbacks;
    }
}

function processNode(o: TraxObject, instanceWatchers: DnWatcher[], tempWatchers: DnWatcher[]) {
    // add a new version at the end of the $next linked list
    let md = o.ΔMd!, cbList = md.onNextChange;
    md.onNextChange = undefined; // remove current callbacks
    if (md.watchers) {
        // instanceWatchers = watchers callbacks (for all instances)
        instanceWatchers.push({ dataNode: o, cbList: md.watchers });
    }
    if (cbList) {
        // tempWatchers = onFreeze callbacks (used by changeComplete() - only 1 time)
        tempWatchers.push({ dataNode: o, cbList: cbList });
    }
}

function callWatchers(watchers: DnWatcher[]) {
    let cbList;
    for (let w of watchers) {
        cbList = w.cbList;
        for (let cb of cbList) {
            cb(w.dataNode);
        }
    }
}

// list of all nodes that need to be refreshed
let refreshContext: RefreshContext = new RefreshContext(),
    refreshPool: RefreshNode[] = [];
