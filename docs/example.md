
# TodoMVC example

This document describes how trax can be used to model data for the [TodoMVC][] application.

This application supports the following use cases:
- Create / Read / Update / Delete *todo notes*
- Mark / un-mark (any or all) *todo notes* as completed
- Filter *todo notes* by completion (i.e. *completed* only, *active* only, or *all*)

As a consequence, the data necessary for this application can be modelled with two object classes
- a *Todo* class, to model a *todo note*
- a *TodoApp* class to model the application that will hold the todo list and the other pieces of data (cf. below)

In a trax context, the *Todo* object can be modelled with a simple class decorated with the trax @Data decorator:
```js
@Data export class Todo {
    description = "";
    completed = false;
    editing = false;
}
```

As the names imply,
- **description** will hold the *todo note* description
- **completed** with hold the *completion* status
- **editing** will tell if the note is being edited: indeed the User Interface will be different when the note is edited (e.g. a text field will be visible in edition mode, and hidden otherwise). Note: as only one note can be edited at a time, it would be also possible to model this requirement with a *selectedTodo* field on the application class instead of this *editing* flag - cf. comment below).

Similarly the application class can be modelled as follows:

```js
// minimal version
@Data export class TodoApp {
    list: Todo[];
    @ref filter: "ALL" | "ACTIVE" | "COMPLETED" = "ALL";
    newEntry = "";
    // selectedTodo: Todo;  // this could be use in place of the editing property on Todo
}
```

- **list** holds the list of *Todo* notes. As you will note, lists are based on JavaScript arrays (trax uses proxy objects to track Array changes)
- **filter** holds the information regarding which filter should be used to display the todo list. Here the *@ref* decorator must be used because *"ALL" | "ACTIVE" | "COMPLETED"* is not considered as a primitive type by trax (even though the enum is composed of strings). As JS strings are immutable, this has no effect on the change detection.
- **newEntry** holds the value of the main field at the top of the application (this field is used to create new todo notes).

At this point, these 2 classes are enough to model the Todo application. However, we can see that the user interface requires 2 extra data:
- the number of items that are left (i.e. how many items are still active)
- the list of Todo that should be displayed according to the filter property 

Those data can be calculated as follows:
```js
function getItemsLeft(todoApp:TodoApp): number {
    let itemsLeft = 0;
    todoApp.list.forEach(item => {
        itemsLeft += item.completed ? 0 : 1;
    });
    return itemsLeft;
}

function getListView(todoApp:TodoApp): Todo[] {
    if (todoApp.filter === "ALL") {
        return todoApp.list;
    } else {
        let isComplete = (todoApp.filter === "COMPLETED");
        return todoApp.list.filter(item => item.completed === isComplete);
    }
}
```

Note: these functions are *pure functions* that only depend on the TodoApp. As a consequence, they can be
directly exposed as @computed property getters in the TodoApp class (the @computed decorator will tell trax to [*memoize*][memoization] the function result, so that it will only be re-calculated if one of the property used for the calculation changes):

```js
@Data export class TodoApp {
    newEntry = "";
    @ref filter: "ALL" | "ACTIVE" | "COMPLETED" = "ALL";
    list: Todo[];

    @computed get listView(): Todo[] {
        if (this.filter === "ALL") {
            return this.list;
        } else {
            let isComplete = (this.filter === "COMPLETED");
            return this.list.filter(item => item.completed === isComplete);
        }
    }

    @computed get itemsLeft(): number {
        let itemsLeft = 0;
        this.list.forEach(item => {
            itemsLeft += item.completed ? 0 : 1;
        });
        return itemsLeft;
    }
}
```

At this point, using the data model simply require to:
- instantiate the data model (through [*new*][new] or [*create*][create])
- watch the TodoApp instance to trigger a UI update (e.g. through a JS template engine)
- call the different actions when user interact with the DOM (e.g. key press or button click)

```js
// instantiation
let todoApp = new TodoApp();

// watch changes
watch(todoApp, () => {
    // trigger view refresh
    // note: version() can be used on all trax objects to perform a fine-grained refresh
    // e.g. version(todoApp), version(todoApp.list), version(todoApp.list[0])...
});

// create todo action (when 'enter' is pressed in the main field)
export function createTodo(app: TodoApp) {
    let todoDesc = app.newEntry.trim();
    if (todoDesc.length) {
        // create the todo if the description is not empty
        let item = new Todo();
        item.description = todoDesc;
        app.list.push(item);
    }
    app.newEntry = ""; // empty the main field
}

// delete toto action (when the 'x' button is clicked on a todo note)
export function deleteTodo(app: TodoApp, todo: Todo) {
    const index = app.list.indexOf(todo);
    if (index > -1) {
        app.list.splice(index, 1);
    }
}

// startEditing action (called when an item is double-clicked)
export function startEditing(app: TodoApp, todo: Todo | null) {
    // will set / remove the editing flag
    app.list.forEach((item) => {
        item.editing = (item === todo);
    });
}

// change filter action
export function setFilter(app: TodoApp, filter: "ALL" | "ACTIVE" | "COMPLETED") {
    app.filter = filter;
}

// etc.

```

Note: a full working version of this code is available in the [todo unit tests][tut].

## Designing more complex data models

Of course, [TodoMVC][] is a fairly simple data model. However list CRUD operations are the staple of UI applications and appear everywhere. 
Having said that, there still 2 golden rules that should be kept in mind when using trax:

1. **Trax is not needed for read-only objects**. Indeed, there are no changes to track in read-only objects. As a consequence, the application design should ensure that read-only data are stored in child graphs that are stored as JSON objects, referenced through an @ref property.
2. **Data should not be changed through the *watch* callback**, which is meant to be used to update the view. Otherwise a new synchronization loop will be triggered (i.e. another *watch call*)

[TodoMVC]: http://todomvc.com/examples/vanilla-es6/
[memoization]: https://en.wikipedia.org/wiki/Memoization
[new]: ./api.md#new-operator
[create]: ./api.md#create
[tut]: ../src/test/trax/todo.spec.ts