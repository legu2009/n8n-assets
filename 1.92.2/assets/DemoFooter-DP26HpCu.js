import { L as LogsPanel } from "./LogsPanel-JnYirDqa.js";
import { d as defineComponent, p as useSettingsStore, Q as useWorkflowsStore, q as computed, e as createBlock, f as createCommentVNode, m as unref, g as openBlock } from "./index-B6eunbxp.js";
import "./useClearExecutionButtonVisible-BV-jMf2m.js";
import "./useCanvasOperations-DaP5jKbH.js";
import "./RunData-Bx47sNQp.js";
import "./FileSaver.min-BzAtcQXX.js";
import "./useExecutionHelpers-DIvhViMz.js";
import "./dateFormatter-C8N5khiG.js";
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "DemoFooter",
  setup(__props) {
    const { isNewLogsEnabled } = useSettingsStore();
    const workflowsStore = useWorkflowsStore();
    const hasExecutionData = computed(() => workflowsStore.workflowExecutionData);
    return (_ctx, _cache) => {
      return unref(isNewLogsEnabled) && hasExecutionData.value ? (openBlock(), createBlock(LogsPanel, {
        key: 0,
        "is-read-only": true
      })) : createCommentVNode("", true);
    };
  }
});
export {
  _sfc_main as default
};
