
export function Data(c: any) {

}

/* 
 * Debug utility to print the generated class on the standard output
 * e.g. @Data @log MyData {}
 */
export function log(c: any) { }

export function ref(proto, key: string) {

}

export function computed(proto, propName: string, descriptor: PropertyDescriptor) {

}

// trax public apis

export function version(o: any /*DataObject*/): number {
    return 0;
}

export function touch(o: any /*DataObject*/): number {
    // necessary to touch param nodes if $content changes (= contains instructions)
    return 0; // return new version if DataObject or 0 if not
}

export function hasProperty(o: any /*DataObject*/, property: string): boolean {
    return false;
}

export function isData(o: any /*DataObject*/): boolean {
    return false;
}

export function isBeingChanged(o: any /*DataObject*/): boolean {
    return false;
}

// trax private apis (generated code)

/**
 * Data Object class decorator
 * @param c 
 */
export function ΔD(c: any) {

}

/**
 * Property decorator
 * Adds getter / setter 
 * @param factory 
 */
export function Δp(factory, canBeUndefined?: 1) {
    return function (proto, key: string) {
        // proto = object prototype
        // key = the property name (e.g. "value")
        let $$key = "$$" + key;
        addPropertyInfo(proto, key, false, {
            // get: function () { return $get(<any>this, $$key, key); },
            // set: function (v) { $set(<any>this, $$key, v); },
            enumerable: true,
            configurable: true
        });
    }

}

interface Constructor<T> {
    new(): T;
}

/**
 * Factory function for a given class reference
 */
export function Δf<T>(dataObjectClassRef: Constructor<T>): T {
    return new dataObjectClassRef();
}

/**
 * Factory function for a new string
 */
export function ΔfStr() {
    return "";
}


/**
 * Fills a proto info structure with some more property description
 * @param proto the proto info structure
 * @param propName name of the property
 * @param isDataNode true if the property is a datanode
 */
function addPropertyInfo(proto: any, propName: string, isDataNode: boolean, desc: PropertyDescriptor | undefined) {
    let nm1 = isDataNode ? "$dProps" : "$vProps",
        nm2 = isDataNode ? "$dProps2" : "$vProps2";
    if (!proto[nm1]) {
        proto[nm1] = [];
        proto[nm2] = [];
        proto["$pMap"] = {}; // property map
    } else if (!proto.hasOwnProperty(nm1)) {
        // we are in a sub-class of a dataset -> copy the proto arrays
        proto[nm1] = proto[nm1].slice(0);
        proto[nm2] = proto[nm2].slice(0);
    }
    proto[nm1].push(propName);
    proto[nm2].push("$$" + propName);
    proto["$pMap"][propName] = 1;
    // proto["$$" + propName] = defaultValue;
    if (desc && delete proto[propName]) {
        Object.defineProperty(proto, propName, desc);
    }
}
