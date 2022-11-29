<!--
A fully spec-compliant TodoMVC implementation
https://todomvc.com/
-->

<script>
import axios from "axios";

const STORAGE_KEY = "vue-todomvc";

const http = axios.create({
  baseURL: "/",
  timeout: 1000,
});

const createTodo = async (title) => {
  return await http.post("/apis/todo.guqing.github.io/v1alpha1/todos", {
    spec: {
      title: title,
      done: false,
    },
    apiVersion: "todo.guqing.github.io/v1alpha1",
    kind: "Todo",
    metadata: {
      generateName: "todo-",
    },
  });
};

const getTodo = async (name) => {
  return await http.get(`/apis/todo.guqing.github.io/v1alpha1/todos/${name}`);
};

const listAllTodos = async () => {
  return await http.get("/apis/todo.guqing.github.io/v1alpha1/todos");
};

const updateDoneStatus = async (name, done) => {
  const todoItem = await getTodo(name);
  todoItem.spec.done = done;
  return await http.put(
    `/apis/todo.guqing.github.io/v1alpha1/todos/${name}`,
    todoItem
  );
};

const removeTodo = async (name) => {
  return await http.delete(
    `/apis/todo.guqing.github.io/v1alpha1/todos/${name}`
  );
};

const filters = {
  all: (todos) => todos,
  active: (todos) => todos.filter((todo) => !todo.completed),
  completed: (todos) => todos.filter((todo) => todo.completed),
};

export default {
  // app initial state
  data: () => ({
    todos: [],
    editedTodo: null,
    visibility: "all",
  }),

  // watch todos change for localStorage persistence
  watch: {
    todos: {
      handler(todos) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
      },
      deep: true,
    },
  },
  computed: {
    filteredTodos() {
      return filters[this.visibility](this.todos);
    },
    remaining() {
      return filters.active(this.todos).length;
    },
  },
  async mounted() {
    await this.listAll();
  },
  // methods that implement data logic.
  // note there's no DOM manipulation here at all.
  methods: {
    async listAll() {
      const list = await listAllTodos();
      this.todos = list.data.items.map((item) => {
        return {
          id: item.metadata.name,
          title: item.spec.title,
        };
      });
    },

    toggleAll(e) {
      this.todos.forEach((todo) => (todo.completed = e.target.checked));
    },

    async addTodo(e) {
      const value = e.target.value.trim();
      if (!value) {
        return;
      }
      const result = await createTodo(value);
      this.todos.push({
        id: result.metadata.name,
        title: result.spec.title,
        completed: result.spec.done,
      });
      e.target.value = "";
    },

    async removeTodo(todo) {
      await removeTodo(todo.id);
      await this.listAll();
    },

    editTodo(todo) {
      this.beforeEditCache = todo.title;
      this.editedTodo = todo;
    },

    async doneEdit(todo) {
      if (!this.editedTodo) {
        return;
      }
      this.editedTodo = null;
      todo.title = todo.title.trim();
      if (!todo.title) {
        return await updateDoneStatus(todo.id, true);
      }
    },

    cancelEdit(todo) {
      this.editedTodo = null;
      todo.title = this.beforeEditCache;
    },

    async removeCompleted() {
      this.todos = filters.active(this.todos);
    },
  },
};
</script>

<template>
  <section class="todoapp">
    <header class="header">
      <h1>todos</h1>
      <input
        class="new-todo"
        autofocus
        placeholder="What needs to be done?"
        @keyup.enter="addTodo"
      />
    </header>
    <section class="main" v-show="todos.length">
      <input
        id="toggle-all"
        class="toggle-all"
        type="checkbox"
        :checked="remaining === 0"
        @change="toggleAll"
      />
      <label for="toggle-all">Mark all as complete</label>
      <ul class="todo-list">
        <li
          v-for="todo in filteredTodos"
          class="todo"
          :key="todo.id"
          :class="{ completed: todo.completed, editing: todo === editedTodo }"
        >
          <div class="view">
            <input class="toggle" type="checkbox" v-model="todo.completed" />
            <label @dblclick="editTodo(todo)">{{ todo.title }}</label>
            <button class="destroy" @click="removeTodo(todo)"></button>
          </div>
          <input
            v-if="todo === editedTodo"
            class="edit"
            type="text"
            v-model="todo.title"
            @vnode-mounted="({ el }) => el.focus()"
            @blur="doneEdit(todo)"
            @keyup.enter="doneEdit(todo)"
            @keyup.escape="cancelEdit(todo)"
          />
        </li>
      </ul>
    </section>
    <footer class="footer" v-show="todos.length">
      <span class="todo-count">
        <strong>{{ remaining }}</strong>
        <span>{{ remaining === 1 ? " item" : " items" }} left</span>
      </span>
      <ul class="filters">
        <li>
          <a
            href="javascript:void(0);"
            @click="() => (this.visibility = 'all')"
            :class="{ selected: visibility === 'all' }"
            >All</a
          >
        </li>
        <li>
          <a
            href="javascript:void(0);"
            @click="() => (this.visibility = 'active')"
            :class="{ selected: visibility === 'active' }"
          >
            Active
          </a>
        </li>
        <li>
          <a
            href="javascript:void(0);"
            @click="() => (this.visibility = 'completed')"
            :class="{ selected: visibility === 'completed' }"
          >
            Completed
          </a>
        </li>
      </ul>
      <button
        class="clear-completed"
        @click="removeCompleted"
        v-show="todos.length > remaining"
      >
        Clear completed
      </button>
    </footer>
  </section>
</template>

<style scoped>
@import "todomvc-app-css/index.css";
</style>
