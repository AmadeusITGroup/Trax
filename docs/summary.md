
# Syntax Summary

This following example summarizes what can be written in a Trax object definition

```js
@Data class SyntaxSummary {
    // base types/interfaces
    name: string = "abc";
    quantity: number = expression();
    important: boolean;
    xyz: any;
    focus: () => void;
    someFunc: Function;

    // class types
    myObject1: MyClass; // will only be deeply tracked if MyClass is a @Data object
    myObject2?: MyClass;
    myObject3: MyClass | null;
    myObject4: NonTraxClass = new NonTraxClass("abc"); // tracked by ref as NonTraxClass is not a trax class

    // arrays
    arr1: string[];
    arr2: MyClass[];
    arr3: MyClass[][];
    arr4: (MyClass | null)[];
    arr5: number[] = [1, 2, 3];
    arr6?: MyClass[];           // equivalent to MyClass[] | undefined

    // dictionaries
    dict1: { [k: string]: string }
    dict2: { [k: string]: MyClass }

    // references and interfaces
    @ref prop1: MyClass;        // prop1 will not be deeply tracked, only its reference -> for readonly objects
    @ref prop2: MyInterface;    // prop2 will not be deeply tracked, only its reference -> for readonly objects
    @ref dict3: { [k: string]: string };                // dict3 will not be tracked, only its reference
    @ref.depth(1) dict4: { [k: string]: MyInterface }   // dict4 will be tracked, but only the references to MyInterface
    @ref.depth(2) dict5: { [k: string]: MyInterface[] } // dict5 and array will be tracked, not the internal of MyInterface
    // note: @ref.depth can only be used on Arrays and Dictionaries

    // computed properties
    @computed get arrLength() {
        if (!this.arr1) return 0;
        return this.arr1.length;
    }

    // virtual property name:quantity - e.g. "name:123"
    set nameQuantity(value: string) {
        let arr = value.split(":");
        if (arr.length === 2) {
            this.name = arr[0];
            this.quantity = parseInt(arr[1], 10);
        }
    }

    // methods are accepted depending on compilation options (true by default)
    someMethod() {
        return doSomething(this);
    }
}
```

## Design Golden Rules
- read-only objects should be stored as JSON objects/interfaces referenced through @ref
- avoid object mutation in watch callbacks as they will trigger another synchronization loop
