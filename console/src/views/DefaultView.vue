<script setup lang="ts">
import axios from "axios";
import type { Todo, TodoList } from "../types";
import { computed, onMounted, ref } from "vue";
import Logo from "../assets/logo.png";

const http = axios.create({
  baseURL: "/",
  timeout: 1000,
});

interface Tab {
  label: string;
}

const todos = ref<TodoList>({
  page: 1,
  size: 20,
  total: 0,
  items: [],
  first: true,
  last: false,
  hasNext: false,
  hasPrevious: false,
  totalPages: 0,
});

const tabs = [
  {
    label: "All",
  },
  {
    label: "Active",
  },
  {
    label: "Completed",
  },
];

const activeTab = ref("All");

/**
 * 列表展示的数据
 */
const todoList = computed(() => {
  if (activeTab.value === "All") {
    return todos.value.items;
  }
  if (activeTab.value === "Active") {
    return filterByDone(false);
  }
  if (activeTab.value === "Completed") {
    return filterByDone(true);
  }
  return [];
});

const filterByDone = (done: boolean) => {
  return todos.value.items.filter((todo) => todo.spec.done === done);
};

// 查看 http://localhost:8090/swagger-ui.html
function handleFetchTodos() {
  http
    .get<TodoList>("/apis/todo.plugin.halo.run/v1alpha1/todos")
    .then((response) => {
      todos.value = response.data;
    });
}

onMounted(handleFetchTodos);

// 创建的逻辑

const title = ref("");

function handleCreate(e: Event) {
  http
    .post<Todo>("/apis/todo.plugin.halo.run/v1alpha1/todos", {
      metadata: {
        // 根据 'todo-' 前缀自动生成 todo 的名称作为唯一标识，可以理解为数据库自动生成主键 id
        generateName: "todo-",
      },
      spec: {
        title: title.value,
        done: false,
      },
      kind: "Todo",
      apiVersion: "todo.plugin.halo.run/v1alpha1",
    })
    .then((response) => {
      title.value = "";
      handleFetchTodos();
    });
}

// 更新的逻辑
const selectedTodo = ref<Todo | undefined>();
const handleUpdate = () => {
  http
    .put<Todo>(
      `/apis/todo.plugin.halo.run/v1alpha1/todos/${selectedTodo.value?.metadata.name}`,
      selectedTodo.value
    )
    .then((response) => {
      handleFetchTodos();
    });
};

function handleDoneChange(todo: Todo) {
  todo.spec.done = !todo.spec.done;
  http
    .put<Todo>(
      `/apis/todo.plugin.halo.run/v1alpha1/todos/${todo.metadata.name}`,
      todo
    )
    .then((response) => {
      handleFetchTodos();
    });
}

// 删除
const handleDelete = (todo: Todo) => {
  http
    .delete(`/apis/todo.plugin.halo.run/v1alpha1/todos/${todo.metadata.name}`)
    .then((response) => {
      handleFetchTodos();
    });
};
</script>

<template>
  <section class="todoapp">
    <header class="header">
      <h1>
        <img :src="Logo" alt="logo" style="display: inline; width: 64px" />
        todos
      </h1>
      <input
        class="new-todo"
        autofocus
        v-model="title"
        placeholder="What needs to be done?"
        @keyup.enter="handleCreate"
      />
    </header>
    <section class="main" v-show="todos.items.length">
      <input
        id="toggle-all"
        class="toggle-all"
        type="checkbox"
        :checked="filterByDone(false).length > 0"
      />
      <label for="toggle-all">Mark all as complete</label>
      <ul class="todo-list">
        <li
          v-for="(todo, index) in todoList"
          class="todo"
          :key="index"
          :class="{ completed: todo.spec.done, editing: todo === selectedTodo }"
        >
          <div class="view">
            <input
              class="toggle"
              type="checkbox"
              :checked="todo.spec.done"
              @click="handleDoneChange(todo)"
            />
            <label @dblclick="selectedTodo = todo">{{ todo.spec.title }}</label>
            <button class="destroy" @click="handleDelete(todo)"></button>
          </div>
          <input
            v-if="selectedTodo"
            class="edit"
            type="text"
            v-model="selectedTodo.spec.title"
            @vnode-mounted="({ el }) => el.focus()"
            @blur="handleUpdate()"
            @keyup.enter="handleUpdate()"
            @keyup.escape="selectedTodo = undefined"
          />
        </li>
      </ul>
    </section>
    <footer class="footer" v-show="todos.total">
      <span class="todo-count">
        <strong>{{ filterByDone(false).length }}</strong>
        <span>
          {{ filterByDone(false).length === 1 ? " item" : " items" }} left</span
        >
      </span>
      <ul class="filters">
        <li v-for="(tab, index) in tabs" :key="index">
          <a
            href="javascript:void(0);"
            @click="activeTab = tab.label"
            :class="{ selected: activeTab === tab.label }"
          >
            {{ tab.label }}
          </a>
        </li>
      </ul>
      <button
        class="clear-completed"
        @click="() => filterByDone(true).map((todo) => handleDelete(todo))"
        v-show="todos.items.length > filterByDone(false).length"
      >
        Clear completed
      </button>
    </footer>
  </section>
</template>

<style scoped>
@import "todomvc-app-css/index.css";
</style>
