export interface Metadata {
  name: string;
  labels?: {
    [key: string]: string;
  } | null;
  annotations?: {
    [key: string]: string;
  } | null;
  version?: number | null;
  creationTimestamp?: string | null;
  deletionTimestamp?: string | null;
}

export interface TodoSpec {
  title: string;
  done?: boolean;
}

export interface Todo {
  spec: TodoSpec;
  apiVersion: "todo.guqing.github.io/v1alpha1";
  kind: "Todo";
  metadata: Metadata;
}

export interface TodoList {
  page: number;
  size: number;
  total: number;
  items: Array<Todo>;
  first: boolean;
  last: boolean;
  hasNext: boolean;
  hasPrevious: boolean;
  totalPages: number;
}
