
# Trax - Trackable Data Objects

Trax is a state management library that helps structuring and consuming data in typescript applications.

## Why would you need such a thing?

Most applications - in particular User Interfaces - use the MVC pattern that logically splits the code in three entities: the data (aka. the Model - or state), the User Interface (aka. the View) and the actions (aka. the Controller).

These entities should ideally interact as follows:
1. during an initialization phase, the view is built from the data objects
2. on user interaction, the view triggers events that call actions
3. actions change the data objects (synchronously or asynchronously)
4. data changes trigger view updates to keep the view in sync with the new data ... and back to step #2

In practice this sequence is not so simple to implement as data changes cannot be observed in JS applications. Besides, performance optimizations and scalability require to minimize the number of operations to update a view - so application developers (or UI frameworks) need to know precisely what particular piece of data has changed to produce efficient UIs.

This is where state management libraries come into play as their goal is to offer the following possibilities:
1. get notified when some data have changed
2. know which part of the data have changed, and which have not
3. ease conversion from/to JSON to store or retrieve data (from a server, a file or local storage)

Many popular state management libraries (such as [redux][], [immerJS][] or [immutableJS]) have decided to use immutability as a way to solve problem #2 (if you are not familiar with **immutability**, it means that an object cannot be changed once created - so that new versions of an object must be created anytime changes have to be pushed: so if data objects are immutable, we just need to compare data objects to know if they have changed). The problem with immutability is that in a JS environment it imposes very painful, fragile and heavy coding patterns.

This is why the core idea behind **trax** is to use a **versioning system instead of immutability**.

## How does it work?

Here is how the previous MVC sequence is executed in a trax environment (note: more optimized versions can be implemented, but this to give the general idea).
1. during the initialization phase
    - the view is built from the data objects
    - each view fragment memorizes the version number of the data objects it depends on
    - the view asks to be notified in case of data change (i.e. a watcher callback is registered)
2. on user interaction, the view triggers events that call actions
3. actions change the data objects (synchronously or asynchronously). In a trax setup, actions are normal JS functions that create, update or delete data objects as any *normal* JS objects. Actions don't even need to know that the data objects are *trax objects* as they don't use any particular setter or getter APIs (like [setState][] in React applications). Behind the scene, here is what trax is doing:
    - trax associates an internal version number to each trax object (aka. data object)
    - anytime a data object is changed, trax updates its internal version number:
        - if the version number was even (e.g. 2), it is incremented (e.g. to 3). Even numbers denote objects that are **clean**.
        - if the version number was odd (e.g. 3), it remains unchanged. Odd numbers denote objects that are **dirty**
        - all parent objects of the changed object are marked as **dirty** as well (also by incrementing their version number, if need be)
        - note: trax knows that an object is being changed because it uses [property setters][] or [proxy][] objects that are generated at compilation time (but this is transparent to the application developer) - cf. below.
    - trax triggers an asynchronous [JS micro task][] to clean all dirty objects when the JS execution is complete 
    - when all JS actions are executed, the JS thread executes the micro task and performs the following actions:
        - *dirty* objects version numbers are incremented (so they all become *clean* again)
        - all associated watcher callbacks are called
4. watcher callbacks trigger View refresh
    - view entities compare the version number of the new data with the previous memorized version numbers (cf. step #1)
    - if version differs, the new version is memorized and the associated view fragment is recalculated

## Usage

The previous explanation may give the impression that using trax is complex. It is actually the opposite. From the developer's point of view, here is what needs to be done:

First, the trax objects have to be defined. Let's imagine for instance that you want to model a list of 'todo' tasks - here is what you would need to write:

```js
import { Data } from 'trax';

@Data class TodoTask {
    description = "";
    done = false;
}

@Data class TodoList {
    name: string;
    tasks: TodoTask[];
}
```

As you can see, defining trax objects consists in declaring classes annotated with the @Data decorator. This decorator is used at build time by trax to rewrite the class code and add meta-data information (trax provides [rollup][] and [webpack][] plugins for this).


Then you will need to instantiate your data objects. This can be done either manually:

```js
const ls = new TaskList();
ls.name = "dev todos";

let t = new TodoTask();
t.description = "assess trax";
ls.push(t);
```
or by creating the data object from a JSON object:
```js
import { create } from 'trax';
const ls = create(TaskList, {name: "dev todos", tasks:[{ description:"assess trax" }]});
```

At this point, the ls object is created and can be consumed immediately. Let's imagine that we want do display the task list in the console:

```js
function render(tl: TaskList) {
    console.log(`${tl.name}:`);
    tl.tasks.forEach((task:TodoTask, idx:number) => {
        console.log(`${idx+1}. ${task.description} ${task.done? '(done!)' : ''}`);
    });
}
render(ls);
```

Now the console should display this:
```
dev todos:
1. assess trax
```

If you want the console to keep constantly in sync with the ls data, then next step will be to watch the 'ls' instance and call render again anytime a change is reported:

```js
import { watch } from 'trax';
watch(ls, () => render(ls));
```

After that, running code like this:
```js
ls.tasks[0].done = true;
```
will trigger an asynchronous render call that will be displayed in the console:
```
dev todos:
1. assess trax (done!)
```

## Benefits
- extremely simple - actually almost transparent compared to other solutions
- typescript support (type validation & IDE auto-completion)
- from / to JSON conversion
- plugins for [rollup][] and [webpack][]
- [tree-shaking][] support
- small: from ~5 to ~9kb gzipped (size depends on usage - cf. tree-shakability)
- and of course works with any UI layer

## Use cases

- Web User Interfaces rendering optimization
- State persistence: cf. convertToJson and create [apis][]
- Asynchronous UIs: data can be changed from anywhere, anytime
- Modular client architecture with shared data stores
- Undo/redo: a data object can be watched and previous versions can be stored / re-hydrated through convertToJson & create [apis][]


Full api documentation [here][apis]

[redux]: https://redux.js.org/
[immerJS]: https://immerjs.github.io/immer
[immutableJS]: https://immutable-js.github.io/immutable-js/
[property setters]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/set
[proxy]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy
[JS micro task]: https://jakearchibald.com/2015/tasks-microtasks-queues-and-schedules/
[setState]: https://reactjs.org/docs/react-component.html#setstate
[apis]: ./docs/api.md
[tree-shaking]: https://en.wikipedia.org/wiki/Tree_shaking
[rollup]: https://rollupjs.org/
[webpack]: https://webpack.js.org/
