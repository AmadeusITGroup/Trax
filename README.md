<div align="center">
  <a href="https://codecov.io/gh/AmadeusITGroup/trax?branch=master">
    <img src="https://codecov.io/gh/AmadeusITGroup/trax/branch/master/graphs/badge.svg?branch=master" alt="Codecov" />
  </a>
</div>

# Trax - Trackable Data Objects

Trax is a state management library that helps structuring and consuming data in typescript applications.

## What is it for?

Most applications - in particular User Interfaces - use the MVC pattern to logically split the code in three entities: the data (aka. the Model - or state), the User Interface (aka. the View) and the actions (aka. the Controller).

These entities should ideally interact as follows:
1. during an initialization phase, the view is built from the data objects
2. on user interaction, the view triggers events that call actions
3. actions change the data objects (synchronously or asynchronously)
4. data changes trigger view updates to keep the view in sync with the new data ... and back to step #2

![mv](docs/imgs/mvc.png?raw=true)


In practice this sequence is not so simple to implement as data changes cannot be observed in JS applications. Besides, performance optimizations and scalability require to minimize the number of operations to update a view - so application developers (or UI frameworks) need to know precisely what particular piece of data has changed to produce efficient UIs.

This is where state management libraries step in as their goal is to offer the following possibilities:
1. get notified when some data have changed
2. know which part of the data have changed (and conversely which have not)
3. ease conversion from/to JSON to store or retrieve data (from a server, a file or local storage)

Many popular state management libraries (such as [redux][], [immerJS][] or [immutableJS]) have decided to use immutability as a way to solve problem #2 (if you are not familiar with **immutability**, it means that an object cannot be changed once created - so that applying changes to an object requires creating a new object instance (like for strings in JavaScript): so if data objects are immutable, they just need to be compared to know if they changed). The problem with immutability is that in a JS environment it imposes very painful, fragile and heavy coding patterns.

This is why the core idea behind **trax** is to use a **versioning system instead of immutability**.

## How does it work?

Here is how the previous MVC sequence is executed in a trax environment (note: more optimized versions can be implemented, but this to give the general idea).
1. during the initialization phase
    - the view is built from the data objects
    - each view fragment memorizes the version number(s) of the data object(s) it depends on
    - the view asks to be notified in case of data change (i.e. a *watcher* callback is registered)
2. on user interaction, the view triggers events that call actions
3. actions change the data objects (synchronously or asynchronously). In a trax environment, actions are normal JS functions that create, update or delete data objects as any *normal* JS objects. Actions don't even need to know that the data objects are *trax objects* as they don't use any particular setter or getter APIs (like [setState][] in React applications). Behind the scene, here is what trax is doing:
    - trax creates hidden [property setters][] and property getters and / or [proxy][] objects at compilation time to track updates made on trax objects.
    - trax also associates an internal version number to each trax object (aka. data object)
    - anytime a data object is changed, trax updates its internal version number:
        - if the version number was even (e.g. 2), it is incremented (e.g. to 3). Even numbers denote objects that are **clean**.
        - if the version number was odd (e.g. 3), it remains unchanged. Odd numbers denote objects that are **dirty**
        - all parent objects of the changed object are marked as **dirty** as well (also by incrementing their version number, if need be)
    - on first data change trax triggers an asynchronous [micro task][] to clean all dirty objects when the JS execution is complete 
    - when all JS actions are executed, the JS thread executes the micro task and performs the following actions:
        - *dirty* objects version numbers are incremented (to make them *clean* again)
        - all associated *watcher* callbacks are called
4. watcher callbacks trigger View refresh
    - view entities compare the version number of the new data with the previous memorized version numbers (cf. step #1)
    - if version differs, the new version is memorized and the associated view fragment is recalculated

## Usage

The previous explanation may give the impression that using trax is complex. It is actually the opposite. From the developer's point of view, here is what it looks like.

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

As you can see, defining trax objects consists in declaring [value object][] classes annotated with the @Data decorator. This decorator is used at build time by trax to rewrite the class code and add meta-data information (trax provides [rollup][] and [webpack][] plugins for this).


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

At this point, the *ls* object is created and can be consumed immediately. 

As an example, let's imagine that we want do display the task list in the console:

```js
function render(tl: TaskList) {
    console.log(`${tl.name}:`);
    tl.tasks.forEach((task:TodoTask, idx:number) => {
        console.log(`${idx+1}. ${task.description} ${task.done? '(done!)' : ''}`);
    });
}
render(ls);
```

The console output should look like this:
```
dev todos:
1. assess trax
```

Now, if you want the console to keep constantly in sync with the ls data, you simply need to watch the *ls* instance and call render again anytime a change is reported:

```js
import { watch } from 'trax';
watch(ls, () => render(ls)); // render will be called anytime a change occurs in ls or its children
```

After that, running code like this:
```js
ls.tasks[0].done = true;
```
will automatically trigger an asynchronous render call that will be displayed in the console:
```
dev todos:
1. assess trax (done!)
```
As the watchers are called asynchronously (through the micro task), multiple synchronous changes will result in only one watcher call:
```js
// the following set of operations will only trigger one watcher call
ls.tasks.push(create(TodoTask, {description: "check micro-tasks"}));
ls.tasks.name = "todo - important";
```

Note: a more complete example based on the TodoMVC application is available [here][TodoMVC]

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
- Asynchronous UIs: data can be changed from anywhere, anytime, independently form user events
- Modular client architecture with shared data stores
- Undo/redo: a data object can be watched and previous versions can be stored / re-hydrated through *convertToJson* & *create* [apis][]


Full api documentation [here][apis]

Syntax cheat-sheet [here][syntax]

[redux]: https://redux.js.org/
[immerJS]: https://immerjs.github.io/immer
[immutableJS]: https://immutable-js.github.io/immutable-js/
[property setters]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/set
[proxy]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy
[micro task]: https://jakearchibald.com/2015/tasks-microtasks-queues-and-schedules/
[setState]: https://reactjs.org/docs/react-component.html#setstate
[apis]: ./docs/api.md
[tree-shaking]: https://en.wikipedia.org/wiki/Tree_shaking
[rollup]: https://rollupjs.org/
[webpack]: https://webpack.js.org/
[value object]: https://en.wikipedia.org/wiki/Value_object
[TodoMVC]: ./docs/example.md
[syntax]: ./docs/summary.md
