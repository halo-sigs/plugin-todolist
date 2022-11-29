import { definePlugin } from "@halo-dev/console-shared";
import DefaultView from "./views/DefaultView.vue";
import { IconGrid } from "@halo-dev/components";
import "./styles/index.css";
import { markRaw } from "vue";

export default definePlugin({
  name: "plugin-hello-world",
  components: [],
  routes: [
    {
      parentName: "Root",
      route: {
        path: "/todos",
        children: [
          {
            path: "",
            name: "Todo List",
            component: DefaultView,
            meta: {
              title: "Todo List",
              searchable: true,
              menu: {
                name: "Todo List",
                group: "工具",
                icon: markRaw(IconGrid),
                priority: 0,
              },
            },
          },
        ],
      },
    },
  ],
  extensionPoints: {},
  activated() {},
  deactivated() {},
});
