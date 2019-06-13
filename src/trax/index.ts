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
    parents: FlexArray<TraxObject>;
    refreshCtxt?: RefreshContext;
    watchers?: FlexArray<(v: any) => void>;      // list of watchers associated to a DataNode instance
    ccWatchers?: FlexArray<(v: any) => any>;     // list of callbacks to call on changeComplete (will be reset after that change)
}

function initMetaData(o: TraxObject): TraxMetaData {
    if (!o.ΔMd) {
        return o.ΔMd = {
            parents: undefined,
            refreshCtxt: undefined,
            watchers: undefined,
            ccWatchers: undefined
        }
    }
    return o.ΔMd;
}
// -----------------------------------------------------------------------------------------------------------------------------
// Soft Array functions

// The purpose of FlexArray is to avoid the creation of an Array in cases where we don't need it (here in 95% of cases)
type FlexArray<T> = T | T[] | undefined;

const $isArray = Array.isArray;

function FA_forEach<T>(a: FlexArray<T>, fn: (item: T) => void) {
    if (a) {
        if ($isArray(a)) {
            (a as Array<T>).forEach(fn);
        } else {
            fn(a);
        }
    }
}

function FA_removeItem<T>(a: FlexArray<T>, item: T | undefined): FlexArray<T> {
    if (a && item) {
        if (a === item) {
            return undefined;
        } else if ($isArray(a)) {
            let arr = a as Array<T>;
            if (arr.length === 1) {
                if (arr[0] === item) return undefined
            } else {
                let idx = arr.indexOf(item);
                if (idx > -1) {
                    arr.splice(idx, 1);
                    if (arr.length === 1) return arr[0];
                    return arr;
                }
            }
        }
    }
    return a;
}

function FA_addItem<T>(a: FlexArray<T>, item: T): FlexArray<T> {
    if (!a) {
        return item;
    } else {
        if ($isArray(a)) {
            (a as Array<T>).push(item);
            return a
        } else {
            return [a, item];
        }
    }
}

// -----------------------------------------------------------------------------------------------------------------------------
// trax public apis

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

    let md = initMetaData(d);
    return new Promise(function (resolve, reject) {
        md!.ccWatchers = FA_addItem(md!.ccWatchers, resolve);
        refreshContext.checkObject(d);
    }) as any;
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
            $touch(obj);
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
function $touch(o: TraxObject) {
    // return true if the node was touched, false if it was already touched (i.e. marked as modified in the current update round)
    let firstTimeTouch = true;

    if (o.ΔChangeVersion === TRAX_COUNTER) {
        // node already modified
        firstTimeTouch = false;
    } else {
        o.ΔChangeVersion = TRAX_COUNTER;
    }

    refreshContext.checkObject(o);

    if (firstTimeTouch) {
        // recursively touch on parent nodes
        let md = o.ΔMd;
        if (md && md.parents) {
            FA_forEach(md.parents, function (p) {
                $touch(p);
            });
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
        if (md && md.parents) {
            md.parents = FA_removeItem(md.parents, parent);
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
        md.parents = FA_addItem(md.parents, parent);
    }
}

// -----------------------------------------------------------------------------------------------------------------------------
// Refresh classes

/**
 * Data Node watcher
 */
interface DnWatcher {
    dataNode: TraxObject;
    watchers: FlexArray<(o: TraxObject) => void>;
}

/**
 * Context holding a linked list of nodes that need to be refreshed
 */
class RefreshContext {
    objects: TraxObject[] = [];

    constructor() {
        TRAX_COUNTER++;
    }

    /**
     * Check if a data object needs to be refreshed (i.e. if it has a watcher)
     * If refresh is needed, its md.refreshContext will be set
     * @param o 
     */
    checkObject(o: TraxObject) {
        let md = o.ΔMd;
        if (md && (md.watchers || md.ccWatchers) && !md.refreshCtxt) {
            let isFirst = this.objects.length === 0;
            this.objects.push(o);
            md.refreshCtxt = this;
            if (isFirst) {
                Promise.resolve().then(() => { this.refresh() });
            }
        }
    }

    /**
     * Refresh all the data nodes associated to the current context
     * @param syncWatchers flag indicating if watch callbacks should be called synchronously (default: true)
     */
    refresh(syncWatchers = true) {
        let objects = this.objects, len = objects.length;
        if (!len) return;

        // create a new refresh context (may be filled while we are executing watcher callbacks on current context)
        refreshContext = new RefreshContext();

        let o: TraxObject,
            md: TraxMetaData,
            instanceWatchers: DnWatcher[] = [],
            tempWatchers: DnWatcher[] = [];

        for (let i = 0; len > i; i++) {
            o = objects[i]
            md = o.ΔMd!;
            if (md.watchers) {
                // instanceWatchers = watchers callbacks (for all instances)
                instanceWatchers.push({ dataNode: o, watchers: md.watchers });
            }
            if (md.ccWatchers) {
                // tempWatchers = callbacks used by changeComplete() - only 1 time
                tempWatchers.push({ dataNode: o, watchers: md.ccWatchers });
            }
            md.ccWatchers = undefined; // remove current changeComplete callbacks
            md.refreshCtxt = undefined;
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
    }
}

function callWatchers(watchers: DnWatcher[]) {
    for (let w of watchers) {
        FA_forEach(w.watchers, function (cb) {
            cb(w.dataNode);
        })
    }
}

// list of all nodes that need to be refreshed
let refreshContext: RefreshContext = new RefreshContext();
