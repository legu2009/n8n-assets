import LogsPanel from "./LogsPanel-CvLCi2ll.js";
import { d as defineComponent, P as useWorkflowsStore, q as computed, e as createBlock, f as createCommentVNode, g as openBlock } from "./index--ag0tEQM.js";
import "./RunData-D6YmSB6p.js";
import "./FileSaver.min-BUciI8xL.js";
import "./useExecutionHelpers-97Ddzif0.js";
import "./canvas-viI6yjxT.js";
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "DemoFooter",
  setup(__props) {
    const workflowsStore = useWorkflowsStore();
    const hasExecutionData = computed(() => workflowsStore.workflowExecutionData);
    return (_ctx, _cache) => {
      return hasExecutionData.value ? (openBlock(), createBlock(LogsPanel, {
        key: 0,
        "is-read-only": true
      })) : createCommentVNode("", true);
    };
  }
});
export {
  _sfc_main as default
};
