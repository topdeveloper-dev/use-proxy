import {useProxy} from '../src';
import {ProxyEvent} from '../src/models';

describe('OOP', () => {
  test('todo list', () => {
    class Store {
      todoLists: TodoList[] = [];
    }

    class TodoList {
      name: string;
      todoItems: TodoItem[] = [];
      constructor(name: string) {
        this.name = name;
      }
    }

    class TodoItem {
      description: string;
      complete = false;
      constructor(description: string) {
        this.description = description;
      }
    }

    const store = new Store();
    const todoList = new TodoList('Work');
    store.todoLists.push(todoList);
    const todoItem = new TodoItem('Daily meeting');
    todoList.todoItems.push(todoItem);

    const proxy = useProxy(store);
    const events: ProxyEvent[] = [];
    const listener = (event: ProxyEvent) => events.push(event);
    proxy.__emitter__.on('event', listener);
    proxy.todoLists[0].todoItems[0].complete = true;
    proxy.__emitter__.off('event', listener);
    expect(events.map(event => event.toString())).toEqual([
      'get: todoLists',
      'get: todoLists+0',
      'get: todoLists+0+todoItems',
      'get: todoLists+0+todoItems+0',
      'set: todoLists+0+todoItems+0+complete',
    ]);
  });
});
