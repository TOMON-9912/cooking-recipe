import DefaultTheme from "vitepress/theme";
import DiagramViewer from "./components/DiagramViewer.vue";
import ErDiagram from "./components/ErDiagram.vue";
import ErRelationTable from "./components/ErRelationTable.vue";
import "./custom.css";

/**
 * VitePress テーマ拡張。docs 内の図表コンポーネントを登録する。
 */
export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component("DiagramViewer", DiagramViewer);
    app.component("ErDiagram", ErDiagram);
    app.component("ErRelationTable", ErRelationTable);
  },
};
