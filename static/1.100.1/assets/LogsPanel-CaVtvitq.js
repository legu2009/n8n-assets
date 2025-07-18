import { b4 as isArrayLike, b5 as isArray, b6 as isBuffer, b7 as isTypedArray, b8 as isArguments, b9 as getTag, ba as isPrototype, bb as baseKeys, bc as addTokenUsageData, bd as emptyTokenUsageData, be as isChatNode, bf as NodeConnectionTypes, bg as v4, bh as get, bi as isRef, bj as isReactive, bk as isProxy, bl as toRaw, bm as AGENT_LANGCHAIN_NODE_TYPE, bn as MANUAL_CHAT_TRIGGER_NODE_TYPE, bo as CHAT_TRIGGER_NODE_TYPE, a as useToast, r as ref, x as computed, c as useI18n$1, bp as usePinnedData, ao as useMessage, ap as MODAL_CONFIRM, T as useWorkflowsStore, bq as useLogsStore, b as useRouter, br as useNodeHelpers, bs as useRunWorkflow, V as VIEWS, bt as chatEventBus, $ as watch, bu as provide, d as defineComponent, i as createElementBlock, g as openBlock, n as normalizeClass, j as createVNode, k as createBaseVNode, m as unref, p as N8nText, w as withCtx, A as renderSlot, l as createTextVNode, t as toDisplayString, _ as _export_sfc, U as useRoute, a3 as useSourceControlStore, bv as useCanvasOperations, bw as useNodeTypesStore, bx as START_NODE_TYPE, e as createBlock, f as createCommentVNode, aZ as N8nTooltip, by as formatTokenUsageCount, bz as getDefaultExportFromCjs, bA as requireUpperFirst, ag as useTemplateRef, bB as useTimestamp, bC as toTime, bD as toDayMonth, bE as withModifiers, F as Fragment, G as renderList, D as normalizeStyle, bF as _sfc_main$k, bG as I18nT, bH as N8nIcon, a$ as _sfc_main$l, q as N8nButton, B as nextTick, bI as useVirtualList, bJ as toRef, bK as mergeProps, bL as N8nRadioButtons, bM as inject, bN as toRefs, o as onMounted, bO as normalizeProps, bP as guardReactiveProps, bQ as resolveDynamicComponent, bR as markdownLink, bS as useFileDialog, bT as onUnmounted, aI as withDirectives, bU as vModelText, bV as withKeys, h as resolveComponent, bW as useClipboard, b1 as createSlots, aA as useNDVStore, bX as PiPWindowSymbol, bY as resolveDirective, a_ as N8nLink, bZ as waitingNodeTooltip, aD as useLocalStorage, b_ as LOG_DETAILS_PANEL_STATE, b$ as KeyboardShortcutTooltip, c0 as N8nResizeWrapper, c1 as useStyles, c2 as N8nActionDropdown, c3 as Workflow, c4 as useThrottleFn, c5 as parse, J as useUIStore, a2 as useCanvasStore, am as useTelemetry, c6 as onScopeDispose, z as onBeforeUnmount, c7 as applyThemeToBody, c8 as useProvideTooltipAppendTo, c9 as LOGS_PANEL_STATE, ca as LOCAL_STORAGE_PANEL_HEIGHT, cb as LOCAL_STORAGE_OVERVIEW_PANEL_WIDTH, cc as LOCAL_STORAGE_PANEL_WIDTH, cd as useActiveElement, ce as ndvEventBus } from "./index-Cb_lQ9m_.js";
import { p as parseErrorMetadata, _ as _sfc_main$j, H as HighlightJS, V as VueMarkdown, R as RunData } from "./RunData-D-o34apM.js";
import { c as canvasEventBus, u as useKeybindings } from "./useKeybindings-BZXwu-r0.js";
import "./FileSaver.min-C7cViz61.js";
import "./useExecutionHelpers-Ae2t-uj6.js";
const TOOL_EXECUTOR_NODE_NAME = "PartialExecutionToolExecutor";
var mapTag = "[object Map]", setTag = "[object Set]";
var objectProto = Object.prototype;
var hasOwnProperty = objectProto.hasOwnProperty;
function isEmpty(value) {
  if (value == null) {
    return true;
  }
  if (isArrayLike(value) && (isArray(value) || typeof value == "string" || typeof value.splice == "function" || isBuffer(value) || isTypedArray(value) || isArguments(value))) {
    return !value.length;
  }
  var tag = getTag(value);
  if (tag == mapTag || tag == setTag) {
    return !value.size;
  }
  if (isPrototype(value)) {
    return !baseKeys(value).length;
  }
  for (var key in value) {
    if (hasOwnProperty.call(value, key)) {
      return false;
    }
  }
  return true;
}
function getConsumedTokens(task) {
  if (!task.data) {
    return emptyTokenUsageData;
  }
  const tokenUsage = Object.values(task.data).flat().flat().reduce((acc, curr) => {
    const tokenUsageData = curr?.json?.tokenUsage ?? curr?.json?.tokenUsageEstimate;
    if (!tokenUsageData) return acc;
    return addTokenUsageData(acc, {
      ...tokenUsageData,
      isEstimate: !!curr?.json.tokenUsageEstimate
    });
  }, emptyTokenUsageData);
  return tokenUsage;
}
function createNode(node, context, runIndex, runData, children = []) {
  return {
    parent: context.parent,
    node,
    id: `${context.workflow.id}:${node.name}:${context.executionId}:${runIndex}`,
    depth: context.depth,
    runIndex,
    runData,
    children,
    consumedTokens: runData ? getConsumedTokens(runData) : emptyTokenUsageData,
    workflow: context.workflow,
    executionId: context.executionId,
    execution: context.data
  };
}
function getChildNodes(treeNode, node, runIndex, context) {
  const subExecutionLocator = findSubExecutionLocator(treeNode);
  if (subExecutionLocator !== void 0) {
    const workflow = context.workflows[subExecutionLocator.workflowId];
    const subWorkflowRunData = context.subWorkflowData[subExecutionLocator.executionId];
    if (!workflow || !subWorkflowRunData) {
      return [];
    }
    return createLogTreeRec({
      ...context,
      parent: treeNode,
      depth: context.depth + 1,
      workflow,
      executionId: subExecutionLocator.executionId,
      data: subWorkflowRunData
    });
  }
  const connectedSubNodes = context.workflow.getParentNodes(node.name, "ALL_NON_MAIN", 1);
  function isMatchedSource(source) {
    return (source?.previousNode === node.name || isPlaceholderLog(treeNode) && source?.previousNode === TOOL_EXECUTOR_NODE_NAME) && (runIndex === void 0 || source.previousNodeRun === runIndex);
  }
  return connectedSubNodes.flatMap(
    (subNodeName) => (context.data.resultData.runData[subNodeName] ?? []).flatMap((t, index) => {
      const isMatched = t.source.some((source) => source !== null) ? t.source.some(isMatchedSource) : runIndex === void 0 || index === runIndex;
      if (!isMatched) {
        return [];
      }
      const subNode = context.workflow.getNode(subNodeName);
      return subNode ? getTreeNodeData(subNode, t, index, {
        ...context,
        depth: context.depth + 1,
        parent: treeNode
      }) : [];
    })
  );
}
function getTreeNodeData(node, runData, runIndex, context) {
  const treeNode = createNode(node, context, runIndex ?? 0, runData);
  const children = getChildNodes(treeNode, node, runIndex, context).sort(sortLogEntries);
  if ((runData === void 0 || node.disabled) && children.length === 0) {
    return [];
  }
  treeNode.children = children;
  return [treeNode];
}
function getTotalConsumedTokens(...usage) {
  return usage.reduce(addTokenUsageData, emptyTokenUsageData);
}
function getSubtreeTotalConsumedTokens(treeNode, includeSubWorkflow) {
  const executionId = treeNode.executionId;
  function calculate(currentNode) {
    if (!includeSubWorkflow && currentNode.executionId !== executionId) {
      return emptyTokenUsageData;
    }
    return getTotalConsumedTokens(
      currentNode.consumedTokens,
      ...currentNode.children.map(calculate)
    );
  }
  return calculate(treeNode);
}
function findLogEntryToAutoSelectRec(subTree, depth) {
  for (const entry of subTree) {
    if (entry.runData?.error) {
      return entry;
    }
    const childAutoSelect = findLogEntryToAutoSelectRec(entry.children, depth + 1);
    if (childAutoSelect) {
      return childAutoSelect;
    }
    if (entry.node.type === AGENT_LANGCHAIN_NODE_TYPE) {
      if (isPlaceholderLog(entry) && entry.children.length > 0) {
        return entry.children[0];
      }
      return entry;
    }
  }
  return depth === 0 ? subTree[0] : void 0;
}
function createLogTree(workflow, response, workflows = {}, subWorkflowData = {}) {
  return createLogTreeRec({
    parent: void 0,
    depth: 0,
    executionId: response.id,
    workflow,
    workflows,
    data: response.data ?? { resultData: { runData: {} } },
    subWorkflowData
  });
}
function createLogTreeRec(context) {
  const runData = context.data.resultData.runData;
  return Object.entries(runData).flatMap(([nodeName, taskData]) => {
    const node = context.workflow.getNode(nodeName);
    if (node === null) {
      return [];
    }
    const childNodes = context.workflow.getChildNodes(nodeName, "ALL_NON_MAIN");
    if (childNodes.length === 0) {
      return taskData.map((task, runIndex) => ({
        node,
        task,
        runIndex,
        nodeHasMultipleRuns: taskData.length > 1
      }));
    }
    if (childNodes.some((child) => (runData[child] ?? []).length > 0)) {
      return [];
    }
    const firstChild = context.workflow.getNode(childNodes[0]);
    if (firstChild === null) {
      return [];
    }
    return [{ node: firstChild, nodeHasMultipleRuns: false }];
  }).flatMap(
    ({ node, runIndex, task, nodeHasMultipleRuns }) => getTreeNodeData(node, task, nodeHasMultipleRuns ? runIndex : void 0, context)
  ).sort(sortLogEntries);
}
function findLogEntryRec(isMatched, entries) {
  for (const entry of entries) {
    if (isMatched(entry)) {
      return entry;
    }
    const child = findLogEntryRec(isMatched, entry.children);
    if (child) {
      return child;
    }
  }
  return void 0;
}
function findSelectedLogEntry(selection, entries) {
  switch (selection.type) {
    case "initial":
      return findLogEntryToAutoSelectRec(entries, 0);
    case "none":
      return void 0;
    case "selected": {
      const entry = findLogEntryRec((e) => e.id === selection.id, entries);
      if (entry) {
        return entry;
      }
      return findLogEntryToAutoSelectRec(entries, 0);
    }
  }
}
function deepToRaw(sourceObj) {
  const seen = /* @__PURE__ */ new WeakMap();
  const objectIterator = (input) => {
    if (seen.has(input)) {
      return input;
    }
    if (input !== null && typeof input === "object") {
      seen.set(input, true);
    }
    if (Array.isArray(input)) {
      return input.map((item) => objectIterator(item));
    }
    if (isRef(input) || isReactive(input) || isProxy(input)) {
      return objectIterator(toRaw(input));
    }
    if (input !== null && typeof input === "object" && Object.getPrototypeOf(input) === Object.prototype) {
      return Object.keys(input).reduce((acc, key) => {
        acc[key] = objectIterator(input[key]);
        return acc;
      }, {});
    }
    return input;
  };
  return objectIterator(sourceObj);
}
function flattenLogEntries(entries, collapsedEntryIds, ret = []) {
  for (const entry of entries) {
    ret.push(entry);
    if (!collapsedEntryIds[entry.id]) {
      flattenLogEntries(entry.children, collapsedEntryIds, ret);
    }
  }
  return ret;
}
function getEntryAtRelativeIndex(entries, id, relativeIndex) {
  const offset = entries.findIndex((e) => e.id === id);
  return offset === -1 ? void 0 : entries[offset + relativeIndex];
}
function sortLogEntries(a, b) {
  if (a.runData === void 0) {
    return a.children.length > 0 ? sortLogEntries(a.children[0], b) : 0;
  }
  if (b.runData === void 0) {
    return b.children.length > 0 ? sortLogEntries(a, b.children[0]) : 0;
  }
  if (a.runData.startTime === b.runData.startTime) {
    return a.runData.executionIndex - b.runData.executionIndex;
  }
  return a.runData.startTime - b.runData.startTime;
}
function mergeStartData(startData, response) {
  if (!response.data) {
    return response;
  }
  const nodeNames = [
    ...new Set(
      Object.keys(startData).concat(Object.keys(response.data.resultData.runData))
    ).values()
  ];
  const runData = Object.fromEntries(
    nodeNames.map((nodeName) => {
      const tasks = response.data?.resultData.runData[nodeName] ?? [];
      const mergedTasks = tasks.concat(
        (startData[nodeName] ?? []).filter(
          (task) => (
            // To remove duplicate runs, we check start time in addition to execution index
            // because nodes such as Wait and Form emits multiple websocket events with
            // different execution index for a single run
            tasks.every(
              (t) => t.startTime < task.startTime && t.executionIndex !== task.executionIndex
            )
          )
        ).map((task) => ({
          ...task,
          executionTime: 0,
          executionStatus: "running"
        }))
      );
      return [nodeName, mergedTasks];
    })
  );
  return {
    ...response,
    data: {
      ...response.data,
      resultData: {
        ...response.data.resultData,
        runData
      }
    }
  };
}
function hasSubExecution(entry) {
  return findSubExecutionLocator(entry) !== void 0;
}
function findSubExecutionLocator(entry) {
  const metadata = entry.runData?.metadata?.subExecution;
  if (metadata) {
    return { workflowId: metadata.workflowId, executionId: metadata.executionId };
  }
  return parseErrorMetadata(entry.runData?.error)?.subExecution;
}
function getDepth(entry) {
  let depth = 0;
  let currentEntry = entry;
  while (currentEntry.parent !== void 0) {
    currentEntry = currentEntry.parent;
    depth++;
  }
  return depth;
}
function getInputKey(node) {
  if (node.type === MANUAL_CHAT_TRIGGER_NODE_TYPE && node.typeVersion < 1.1) {
    return "input";
  }
  if (node.type === CHAT_TRIGGER_NODE_TYPE) {
    return "chatInput";
  }
  return "chatInput";
}
function extractChatInput(workflow, resultData) {
  const chatTrigger = workflow.nodes.find(isChatNode);
  if (chatTrigger === void 0) {
    return void 0;
  }
  const inputKey = getInputKey(chatTrigger);
  const runData = (resultData.runData[chatTrigger.name] ?? [])[0];
  const message = runData?.data?.[NodeConnectionTypes.Main]?.[0]?.[0]?.json?.[inputKey];
  if (runData === void 0 || typeof message !== "string") {
    return void 0;
  }
  return {
    text: message,
    sender: "user",
    id: v4()
  };
}
function extractBotResponse(resultData, executionId, emptyText2) {
  const lastNodeExecuted = resultData.lastNodeExecuted;
  if (!lastNodeExecuted) return void 0;
  const nodeResponseDataArray = get(resultData.runData, lastNodeExecuted) ?? [];
  const nodeResponseData = nodeResponseDataArray[nodeResponseDataArray.length - 1];
  let responseMessage;
  if (get(nodeResponseData, "error")) {
    responseMessage = "[ERROR: " + get(nodeResponseData, "error.message") + "]";
  } else {
    const responseData = get(nodeResponseData, "data.main[0][0].json");
    const text = extractResponseText(responseData) ?? emptyText2;
    if (!text) {
      return void 0;
    }
    responseMessage = text;
  }
  return {
    text: responseMessage,
    sender: "bot",
    id: executionId ?? v4()
  };
}
function extractResponseText(responseData) {
  if (!responseData || isEmpty(responseData)) {
    return void 0;
  }
  const paths = ["output", "text", "response.text"];
  const matchedPath = paths.find((path) => get(responseData, path));
  if (!matchedPath) return JSON.stringify(responseData, null, 2);
  const matchedOutput = get(responseData, matchedPath);
  if (typeof matchedOutput === "object") {
    return "```json\n" + JSON.stringify(matchedOutput, null, 2) + "\n```";
  }
  return matchedOutput?.toString() ?? "";
}
function restoreChatHistory(workflowExecutionData, emptyText2) {
  if (!workflowExecutionData?.data) {
    return [];
  }
  const userMessage = extractChatInput(
    workflowExecutionData.workflowData,
    workflowExecutionData.data.resultData
  );
  const botMessage = extractBotResponse(
    workflowExecutionData.data.resultData,
    workflowExecutionData.id,
    emptyText2
  );
  return [...userMessage ? [userMessage] : [], ...botMessage ? [botMessage] : []];
}
function isSubNodeLog(logEntry) {
  return logEntry.parent !== void 0 && logEntry.parent.executionId === logEntry.executionId;
}
function isPlaceholderLog(treeNode) {
  return treeNode.runData === void 0;
}
function useChatMessaging({
  chatTrigger,
  messages: messages2,
  sessionId: sessionId2,
  executionResultData,
  onRunChatWorkflow
}) {
  const locale = useI18n$1();
  const { showError } = useToast();
  const previousMessageIndex = ref(0);
  const isLoading = ref(false);
  async function convertFileToBinaryData(file) {
    const reader = new FileReader();
    return await new Promise((resolve, reject) => {
      reader.onload = () => {
        const binaryData = {
          data: reader.result.split("base64,")?.[1] ?? "",
          mimeType: file.type,
          fileName: file.name,
          fileSize: `${file.size} bytes`,
          fileExtension: file.name.split(".").pop() ?? "",
          fileType: file.type.split("/")[0]
        };
        resolve(binaryData);
      };
      reader.onerror = () => {
        reject(new Error("Failed to convert file to binary data"));
      };
      reader.readAsDataURL(file);
    });
  }
  async function getKeyedFiles(files) {
    const binaryData = {};
    await Promise.all(
      files.map(async (file, index) => {
        const data = await convertFileToBinaryData(file);
        const key = `data${index}`;
        binaryData[key] = data;
      })
    );
    return binaryData;
  }
  function extractFileMeta(file) {
    return {
      fileName: file.name,
      fileSize: `${file.size} bytes`,
      fileExtension: file.name.split(".").pop() ?? "",
      fileType: file.type.split("/")[0],
      mimeType: file.type
    };
  }
  async function startWorkflowWithMessage(message, files) {
    const triggerNode = chatTrigger.value;
    if (!triggerNode) {
      showError(new Error("Chat Trigger Node could not be found!"), "Trigger Node not found");
      return;
    }
    const inputKey = getInputKey(triggerNode);
    const inputPayload = {
      json: {
        sessionId: sessionId2.value,
        action: "sendMessage",
        [inputKey]: message
      }
    };
    if (files && files.length > 0) {
      const filesMeta = files.map((file) => extractFileMeta(file));
      const binaryData = await getKeyedFiles(files);
      inputPayload.json.files = filesMeta;
      inputPayload.binary = binaryData;
    }
    const nodeData = {
      startTime: Date.now(),
      executionTime: 0,
      executionIndex: 0,
      executionStatus: "success",
      data: {
        main: [[inputPayload]]
      },
      source: [null]
    };
    isLoading.value = true;
    const response = await onRunChatWorkflow({
      triggerNode: triggerNode.name,
      nodeData,
      source: "RunData.ManualChatMessage",
      message
    });
    isLoading.value = false;
    if (!response?.executionId) {
      return;
    }
    const chatMessage = executionResultData.value ? extractBotResponse(
      executionResultData.value,
      response.executionId,
      locale.baseText("chat.window.chat.response.empty")
    ) : void 0;
    if (chatMessage !== void 0) {
      messages2.value.push(chatMessage);
    }
  }
  async function sendMessage(message, files) {
    previousMessageIndex.value = 0;
    if (message.trim() === "" && (!files || files.length === 0)) {
      showError(
        new Error(locale.baseText("chat.window.chat.provideMessage")),
        locale.baseText("chat.window.chat.emptyChatMessage")
      );
      return;
    }
    const pinnedChatData = usePinnedData(chatTrigger.value);
    if (pinnedChatData.hasData.value) {
      const confirmResult = await useMessage().confirm(
        locale.baseText("chat.window.chat.unpinAndExecute.description"),
        locale.baseText("chat.window.chat.unpinAndExecute.title"),
        {
          confirmButtonText: locale.baseText("chat.window.chat.unpinAndExecute.confirm"),
          cancelButtonText: locale.baseText("chat.window.chat.unpinAndExecute.cancel")
        }
      );
      if (!(confirmResult === MODAL_CONFIRM)) return;
      pinnedChatData.unsetData("unpin-and-send-chat-message-modal");
    }
    const newMessage = {
      text: message,
      sender: "user",
      sessionId: sessionId2.value,
      id: v4(),
      files
    };
    messages2.value.push(newMessage);
    await startWorkflowWithMessage(newMessage.text, files);
  }
  return {
    previousMessageIndex,
    isLoading: computed(() => isLoading.value),
    sendMessage
  };
}
const ChatSymbol = "Chat";
const ChatOptionsSymbol = "ChatOptions";
function useChatState(isReadOnly) {
  const locale = useI18n$1();
  const workflowsStore = useWorkflowsStore();
  const logsStore = useLogsStore();
  const router = useRouter();
  const nodeHelpers = useNodeHelpers();
  const { runWorkflow } = useRunWorkflow({ router });
  const messages2 = ref([]);
  const currentSessionId = ref(v4().replace(/-/g, ""));
  const previousChatMessages = computed(() => workflowsStore.getPastChatMessages);
  const chatTriggerNode = computed(
    () => Object.values(workflowsStore.allNodes).find(isChatNode) ?? null
  );
  const allowFileUploads = computed(
    () => chatTriggerNode.value?.parameters?.options?.allowFileUploads === true
  );
  const allowedFilesMimeTypes = computed(
    () => chatTriggerNode.value?.parameters?.options?.allowedFilesMimeTypes?.toString() ?? ""
  );
  const { sendMessage, isLoading } = useChatMessaging({
    chatTrigger: chatTriggerNode,
    messages: messages2,
    sessionId: currentSessionId,
    executionResultData: computed(() => workflowsStore.getWorkflowExecution?.data?.resultData),
    onRunChatWorkflow
  });
  function createChatConfig(params) {
    const chatConfig2 = {
      messages: params.messages,
      sendMessage: params.sendMessage,
      initialMessages: ref([]),
      currentSessionId: params.currentSessionId,
      waitingForResponse: params.isLoading
    };
    const chatOptions2 = {
      i18n: {
        en: {
          title: "",
          footer: "",
          subtitle: "",
          inputPlaceholder: params.locale.baseText("chat.window.chat.placeholder"),
          getStarted: "",
          closeButtonTooltip: ""
        }
      },
      webhookUrl: "",
      mode: "window",
      showWindowCloseButton: true,
      disabled: params.isDisabled,
      allowFileUploads: params.allowFileUploads,
      allowedFilesMimeTypes
    };
    return { chatConfig: chatConfig2, chatOptions: chatOptions2 };
  }
  const { chatConfig, chatOptions } = createChatConfig({
    messages: messages2,
    sendMessage,
    currentSessionId,
    isLoading,
    isDisabled: computed(() => isReadOnly),
    allowFileUploads,
    locale
  });
  const restoredChatMessages = computed(
    () => restoreChatHistory(
      workflowsStore.workflowExecutionData,
      locale.baseText("chat.window.chat.response.empty")
    )
  );
  provide(ChatSymbol, chatConfig);
  provide(ChatOptionsSymbol, chatOptions);
  async function createExecutionPromise() {
    return await new Promise((resolve) => {
      const resolveIfFinished = (isRunning) => {
        if (!isRunning) {
          unwatch();
          resolve();
        }
      };
      const unwatch = watch(() => workflowsStore.isWorkflowRunning, resolveIfFinished);
      resolveIfFinished(workflowsStore.isWorkflowRunning);
    });
  }
  async function onRunChatWorkflow(payload) {
    const runWorkflowOptions = {
      triggerNode: payload.triggerNode,
      nodeData: payload.nodeData,
      source: payload.source
    };
    if (workflowsStore.chatPartialExecutionDestinationNode) {
      runWorkflowOptions.destinationNode = workflowsStore.chatPartialExecutionDestinationNode;
      workflowsStore.chatPartialExecutionDestinationNode = null;
    }
    const response = await runWorkflow(runWorkflowOptions);
    if (response) {
      await createExecutionPromise();
      workflowsStore.appendChatMessage(payload.message);
      return response;
    }
    return;
  }
  function refreshSession() {
    workflowsStore.setWorkflowExecutionData(null);
    nodeHelpers.updateNodesExecutionIssues();
    messages2.value = [];
    currentSessionId.value = v4().replace(/-/g, "");
    if (logsStore.isOpen) {
      chatEventBus.emit("focusInput");
    }
  }
  function displayExecution(executionId) {
    const route = router.resolve({
      name: VIEWS.EXECUTION_PREVIEW,
      params: { name: workflowsStore.workflowId, executionId }
    });
    window.open(route.href, "_blank");
  }
  return {
    currentSessionId,
    messages: computed(() => isReadOnly ? restoredChatMessages.value : messages2.value),
    previousChatMessages,
    sendMessage,
    refreshSession,
    displayExecution
  };
}
const _sfc_main$i = /* @__PURE__ */ defineComponent({
  __name: "LogsPanelHeader",
  props: {
    title: {}
  },
  emits: ["click"],
  setup(__props, { emit: __emit }) {
    const emit = __emit;
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("header", {
        class: normalizeClass(_ctx.$style.container),
        onClick: _cache[0] || (_cache[0] = ($event) => emit("click"))
      }, [
        createVNode(unref(N8nText), {
          class: normalizeClass(_ctx.$style.title),
          bold: true,
          size: "small"
        }, {
          default: withCtx(() => [
            renderSlot(_ctx.$slots, "title", {}, () => [
              createTextVNode(toDisplayString(_ctx.title), 1)
            ])
          ]),
          _: 3
        }, 8, ["class"]),
        createBaseVNode("div", {
          class: normalizeClass(_ctx.$style.actions)
        }, [
          renderSlot(_ctx.$slots, "actions")
        ], 2)
      ], 2);
    };
  }
});
const container$8 = "_container_1uwbw_123";
const title$2 = "_title_1uwbw_144";
const actions$1 = "_actions_1uwbw_152";
const style0$b = {
  container: container$8,
  title: title$2,
  actions: actions$1
};
const cssModules$b = {
  "$style": style0$b
};
const LogsPanelHeader = /* @__PURE__ */ _export_sfc(_sfc_main$i, [["__cssModules", cssModules$b]]);
function useClearExecutionButtonVisible() {
  const route = useRoute();
  const sourceControlStore = useSourceControlStore();
  const workflowsStore = useWorkflowsStore();
  const workflowExecutionData = computed(() => workflowsStore.workflowExecutionData);
  const isWorkflowRunning = computed(() => workflowsStore.isWorkflowRunning);
  const isReadOnlyRoute = computed(() => !!route?.meta?.readOnlyCanvas);
  const { editableWorkflow } = useCanvasOperations();
  const nodeTypesStore = useNodeTypesStore();
  const isReadOnlyEnvironment = computed(() => sourceControlStore.preferences.branchReadOnly);
  const allTriggerNodesDisabled = computed(
    () => editableWorkflow.value.nodes.filter((node) => node.type === START_NODE_TYPE || nodeTypesStore.isTriggerNode(node.type)).every((node) => node.disabled)
  );
  return computed(
    () => !isReadOnlyRoute.value && !isReadOnlyEnvironment.value && !isWorkflowRunning.value && !allTriggerNodesDisabled.value && !!workflowExecutionData.value
  );
}
const _sfc_main$h = /* @__PURE__ */ defineComponent({
  __name: "LogsViewConsumedTokenCountText",
  props: {
    consumedTokens: {}
  },
  setup(__props) {
    const locale = useI18n$1();
    return (_ctx, _cache) => {
      const _component_ConsumedTokensDetails = _sfc_main$j;
      return _ctx.consumedTokens !== void 0 ? (openBlock(), createBlock(unref(N8nTooltip), {
        key: 0,
        enterable: false
      }, {
        content: withCtx(() => [
          createVNode(_component_ConsumedTokensDetails, { "consumed-tokens": _ctx.consumedTokens }, null, 8, ["consumed-tokens"])
        ]),
        default: withCtx(() => [
          createBaseVNode("span", null, toDisplayString(unref(locale).baseText("runData.aiContentBlock.tokens", {
            interpolate: {
              count: unref(formatTokenUsageCount)(_ctx.consumedTokens, "total")
            }
          })), 1)
        ]),
        _: 1
      })) : createCommentVNode("", true);
    };
  }
});
var upperFirstExports = requireUpperFirst();
const upperFirst = /* @__PURE__ */ getDefaultExportFromCjs(upperFirstExports);
const _hoisted_1$e = { key: 0 };
const _hoisted_2$3 = { key: 1 };
const _sfc_main$g = /* @__PURE__ */ defineComponent({
  __name: "LogsViewNodeName",
  props: {
    name: {},
    latestName: {},
    isError: { type: Boolean },
    isDeleted: { type: Boolean }
  },
  setup(__props) {
    return (_ctx, _cache) => {
      return openBlock(), createBlock(unref(N8nText), {
        tag: "div",
        bold: true,
        size: "small",
        class: normalizeClass(_ctx.$style.name),
        color: _ctx.isError ? "danger" : void 0
      }, {
        default: withCtx(() => [
          _ctx.isDeleted || _ctx.name !== _ctx.latestName ? (openBlock(), createElementBlock("del", _hoisted_1$e, toDisplayString(_ctx.name), 1)) : createCommentVNode("", true),
          !_ctx.isDeleted ? (openBlock(), createElementBlock("span", _hoisted_2$3, toDisplayString(_ctx.latestName), 1)) : createCommentVNode("", true)
        ]),
        _: 1
      }, 8, ["class", "color"]);
    };
  }
});
const name$1 = "_name_1t0q3_123";
const style0$a = {
  name: name$1
};
const cssModules$a = {
  "$style": style0$a
};
const LogsViewNodeName = /* @__PURE__ */ _export_sfc(_sfc_main$g, [["__cssModules", cssModules$a]]);
const _hoisted_1$d = ["aria-expanded", "aria-selected"];
const _sfc_main$f = /* @__PURE__ */ defineComponent({
  __name: "LogsOverviewRow",
  props: {
    data: {},
    isSelected: { type: Boolean },
    isReadOnly: { type: Boolean },
    shouldShowTokenCountColumn: { type: Boolean },
    isCompact: { type: Boolean },
    latestInfo: {},
    expanded: { type: Boolean },
    canOpenNdv: { type: Boolean }
  },
  emits: ["toggleExpanded", "toggleSelected", "triggerPartialExecution", "openNdv"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const container2 = useTemplateRef("containerRef");
    const locale = useI18n$1();
    const now = useTimestamp({ interval: 1e3 });
    const nodeTypeStore = useNodeTypesStore();
    const type = computed(() => nodeTypeStore.getNodeType(props.data.node.type));
    const isSettled = computed(
      () => props.data.runData?.executionStatus && !["running", "waiting"].includes(props.data.runData.executionStatus)
    );
    const isError = computed(() => !!props.data.runData?.error);
    const startedAtText = computed(() => {
      if (props.data.runData === void 0) {
        return "—";
      }
      const time = new Date(props.data.runData.startTime);
      return locale.baseText("logs.overview.body.started", {
        interpolate: {
          time: `${toTime(time, true)}, ${toDayMonth(time)}`
        }
      });
    });
    const statusText = computed(() => upperFirst(props.data.runData?.executionStatus ?? ""));
    const timeText = computed(
      () => props.data.runData ? locale.displayTimer(
        isSettled.value ? props.data.runData.executionTime : Math.floor((now.value - props.data.runData.startTime) / 1e3) * 1e3,
        true
      ) : void 0
    );
    const subtreeConsumedTokens = computed(
      () => props.shouldShowTokenCountColumn ? getSubtreeTotalConsumedTokens(props.data, false) : void 0
    );
    const hasChildren = computed(() => props.data.children.length > 0 || hasSubExecution(props.data));
    function isLastChild(level) {
      let parent = props.data.parent;
      let data = props.data;
      for (let i = 0; i < props.data.depth - level; i++) {
        data = parent;
        parent = parent?.parent;
      }
      const siblings = parent?.children ?? [];
      const lastSibling = siblings[siblings.length - 1];
      return data === void 0 && lastSibling === void 0 || data?.node === lastSibling?.node && data?.runIndex === lastSibling?.runIndex;
    }
    watch(
      () => props.isSelected,
      (isSelected) => {
        void nextTick(() => {
          if (isSelected) {
            container2.value?.focus();
          }
        });
      },
      { immediate: true }
    );
    return (_ctx, _cache) => {
      const _component_NodeIcon = _sfc_main$k;
      return openBlock(), createElementBlock("div", {
        ref: "containerRef",
        role: "treeitem",
        tabindex: "-1",
        "aria-expanded": props.data.children.length > 0 && props.expanded,
        "aria-selected": props.isSelected,
        class: normalizeClass({
          [_ctx.$style.container]: true,
          [_ctx.$style.compact]: props.isCompact,
          [_ctx.$style.error]: isError.value,
          [_ctx.$style.selected]: props.isSelected
        }),
        onClick: _cache[3] || (_cache[3] = withModifiers(($event) => emit("toggleSelected"), ["stop"]))
      }, [
        (openBlock(true), createElementBlock(Fragment, null, renderList(props.data.depth, (level) => {
          return openBlock(), createElementBlock("div", {
            key: level,
            class: normalizeClass({
              [_ctx.$style.indent]: true,
              [_ctx.$style.connectorCurved]: level === props.data.depth,
              [_ctx.$style.connectorStraight]: !isLastChild(level)
            })
          }, null, 2);
        }), 128)),
        createBaseVNode("div", {
          class: normalizeClass(_ctx.$style.background),
          style: normalizeStyle({ "--indent-depth": props.data.depth })
        }, null, 6),
        createVNode(_component_NodeIcon, {
          "node-type": type.value,
          size: 16,
          class: normalizeClass(_ctx.$style.icon)
        }, null, 8, ["node-type", "class"]),
        createVNode(LogsViewNodeName, {
          class: normalizeClass(_ctx.$style.name),
          "latest-name": _ctx.latestInfo?.name ?? props.data.node.name,
          name: props.data.node.name,
          "is-error": isError.value,
          "is-deleted": _ctx.latestInfo?.deleted ?? false
        }, null, 8, ["class", "latest-name", "name", "is-error", "is-deleted"]),
        !_ctx.isCompact ? (openBlock(), createBlock(unref(N8nText), {
          key: 0,
          tag: "div",
          color: "text-light",
          size: "small",
          class: normalizeClass(_ctx.$style.timeTook)
        }, {
          default: withCtx(() => [
            isSettled.value ? (openBlock(), createBlock(unref(I18nT), {
              key: 0,
              keypath: "logs.overview.body.summaryText.in"
            }, {
              status: withCtx(() => [
                isError.value ? (openBlock(), createBlock(unref(N8nText), {
                  key: 0,
                  color: "danger",
                  bold: true,
                  size: "small"
                }, {
                  default: withCtx(() => [
                    createVNode(unref(N8nIcon), {
                      icon: "exclamation-triangle",
                      class: normalizeClass(_ctx.$style.errorIcon)
                    }, null, 8, ["class"]),
                    createTextVNode(" " + toDisplayString(statusText.value), 1)
                  ]),
                  _: 1
                })) : (openBlock(), createElementBlock(Fragment, { key: 1 }, [
                  createTextVNode(toDisplayString(statusText.value), 1)
                ], 64))
              ]),
              time: withCtx(() => [
                createTextVNode(toDisplayString(timeText.value), 1)
              ]),
              _: 1
            })) : timeText.value !== void 0 ? (openBlock(), createElementBlock(Fragment, { key: 1 }, [
              createTextVNode(toDisplayString(unref(locale).baseText("logs.overview.body.summaryText.for", {
                interpolate: { status: statusText.value, time: timeText.value }
              })), 1)
            ], 64)) : (openBlock(), createElementBlock(Fragment, { key: 2 }, [
              createTextVNode("—")
            ], 64))
          ]),
          _: 1
        }, 8, ["class"])) : createCommentVNode("", true),
        !_ctx.isCompact ? (openBlock(), createBlock(unref(N8nText), {
          key: 1,
          tag: "div",
          color: "text-light",
          size: "small",
          class: normalizeClass(_ctx.$style.startedAt)
        }, {
          default: withCtx(() => [
            createTextVNode(toDisplayString(startedAtText.value), 1)
          ]),
          _: 1
        }, 8, ["class"])) : createCommentVNode("", true),
        !_ctx.isCompact && subtreeConsumedTokens.value !== void 0 ? (openBlock(), createBlock(unref(N8nText), {
          key: 2,
          tag: "div",
          color: "text-light",
          size: "small",
          class: normalizeClass(_ctx.$style.consumedTokens)
        }, {
          default: withCtx(() => [
            subtreeConsumedTokens.value.totalTokens > 0 && (props.data.children.length === 0 || !props.expanded) ? (openBlock(), createBlock(_sfc_main$h, {
              key: 0,
              "consumed-tokens": subtreeConsumedTokens.value
            }, null, 8, ["consumed-tokens"])) : createCommentVNode("", true)
          ]),
          _: 1
        }, 8, ["class"])) : createCommentVNode("", true),
        isError.value && _ctx.isCompact ? (openBlock(), createBlock(unref(N8nIcon), {
          key: 3,
          size: "medium",
          color: "danger",
          icon: "exclamation-triangle",
          class: normalizeClass(_ctx.$style.compactErrorIcon)
        }, null, 8, ["class"])) : createCommentVNode("", true),
        !_ctx.isCompact || !props.latestInfo?.deleted ? (openBlock(), createBlock(unref(_sfc_main$l), {
          key: 4,
          type: "secondary",
          size: "small",
          icon: "edit",
          "icon-size": "medium",
          style: normalizeStyle([{ "color": "var(--color-text-base)" }, {
            visibility: props.canOpenNdv ? "" : "hidden",
            color: "var(--color-text-base)"
          }]),
          disabled: props.latestInfo?.deleted,
          class: normalizeClass(_ctx.$style.openNdvButton),
          "aria-label": unref(locale).baseText("logs.overview.body.open"),
          onClick: _cache[0] || (_cache[0] = withModifiers(($event) => emit("openNdv"), ["stop"]))
        }, null, 8, ["style", "disabled", "class", "aria-label"])) : createCommentVNode("", true),
        !_ctx.isCompact || !props.isReadOnly && !props.latestInfo?.deleted && !props.latestInfo?.disabled ? (openBlock(), createBlock(unref(_sfc_main$l), {
          key: 5,
          type: "secondary",
          size: "small",
          icon: "play",
          style: { "color": "var(--color-text-base)" },
          "aria-label": unref(locale).baseText("logs.overview.body.run"),
          class: normalizeClass([_ctx.$style.partialExecutionButton, props.data.depth > 0 ? _ctx.$style.unavailable : ""]),
          disabled: props.latestInfo?.deleted || props.latestInfo?.disabled,
          onClick: _cache[1] || (_cache[1] = withModifiers(($event) => emit("triggerPartialExecution"), ["stop"]))
        }, null, 8, ["aria-label", "class", "disabled"])) : createCommentVNode("", true),
        !_ctx.isCompact || hasChildren.value ? (openBlock(), createBlock(unref(N8nButton), {
          key: 6,
          type: "secondary",
          size: "small",
          icon: props.expanded ? "chevron-down" : "chevron-up",
          "icon-size": "medium",
          square: true,
          style: normalizeStyle({
            visibility: hasChildren.value ? "" : "hidden",
            color: "var(--color-text-base)"
            // give higher specificity than the style from the component itself
          }),
          class: normalizeClass(_ctx.$style.toggleButton),
          "aria-label": unref(locale).baseText("logs.overview.body.toggleRow"),
          onClick: _cache[2] || (_cache[2] = withModifiers(($event) => emit("toggleExpanded"), ["stop"]))
        }, null, 8, ["icon", "style", "class", "aria-label"])) : createCommentVNode("", true)
      ], 10, _hoisted_1$d);
    };
  }
});
const container$7 = "_container_yoz1w_123";
const background = "_background_yoz1w_139";
const selected = "_selected_yoz1w_148";
const error = "_error_yoz1w_154";
const indent = "_indent_yoz1w_158";
const connectorCurved = "_connectorCurved_yoz1w_167";
const connectorStraight = "_connectorStraight_yoz1w_177";
const icon$3 = "_icon_yoz1w_186";
const name = "_name_yoz1w_192";
const timeTook = "_timeTook_yoz1w_198";
const errorIcon = "_errorIcon_yoz1w_203";
const startedAt = "_startedAt_yoz1w_208";
const consumedTokens = "_consumedTokens_yoz1w_214";
const compactErrorIcon = "_compactErrorIcon_yoz1w_221";
const partialExecutionButton = "_partialExecutionButton_yoz1w_233";
const openNdvButton = "_openNdvButton_yoz1w_234";
const compact = "_compact_yoz1w_221";
const unavailable = "_unavailable_yoz1w_244";
const toggleButton = "_toggleButton_yoz1w_252";
const style0$9 = {
  container: container$7,
  background,
  selected,
  error,
  indent,
  connectorCurved,
  connectorStraight,
  icon: icon$3,
  name,
  timeTook,
  errorIcon,
  startedAt,
  consumedTokens,
  compactErrorIcon,
  partialExecutionButton,
  openNdvButton,
  compact,
  unavailable,
  toggleButton
};
const cssModules$9 = {
  "$style": style0$9
};
const LogsOverviewRow = /* @__PURE__ */ _export_sfc(_sfc_main$f, [["__cssModules", cssModules$9]]);
const _sfc_main$e = /* @__PURE__ */ defineComponent({
  __name: "LogsViewExecutionSummary",
  props: {
    status: {},
    consumedTokens: {},
    startTime: {},
    timeTook: {}
  },
  setup(__props) {
    const locale = useI18n$1();
    const now = useTimestamp({ interval: 1e3 });
    const executionStatusText = computed(
      () => __props.status === "running" || __props.status === "waiting" ? locale.baseText("logs.overview.body.summaryText.for", {
        interpolate: {
          status: upperFirst(__props.status),
          time: locale.displayTimer(Math.floor((now.value - __props.startTime) / 1e3) * 1e3, true)
        }
      }) : __props.timeTook === void 0 ? upperFirst(__props.status) : locale.baseText("logs.overview.body.summaryText.in", {
        interpolate: {
          status: upperFirst(__props.status),
          time: locale.displayTimer(__props.timeTook, true)
        }
      })
    );
    return (_ctx, _cache) => {
      return openBlock(), createBlock(unref(N8nText), {
        tag: "div",
        color: "text-light",
        size: "small",
        class: normalizeClass(_ctx.$style.container)
      }, {
        default: withCtx(() => [
          createBaseVNode("span", null, toDisplayString(executionStatusText.value), 1),
          _ctx.consumedTokens.totalTokens > 0 ? (openBlock(), createBlock(_sfc_main$h, {
            key: 0,
            "consumed-tokens": _ctx.consumedTokens
          }, null, 8, ["consumed-tokens"])) : createCommentVNode("", true)
        ]),
        _: 1
      }, 8, ["class"]);
    };
  }
});
const container$6 = "_container_pt5hk_123";
const style0$8 = {
  container: container$6
};
const cssModules$8 = {
  "$style": style0$8
};
const LogsViewExecutionSummary = /* @__PURE__ */ _export_sfc(_sfc_main$e, [["__cssModules", cssModules$8]]);
const _sfc_main$d = /* @__PURE__ */ defineComponent({
  __name: "LogsOverviewPanel",
  props: {
    isOpen: { type: Boolean },
    selected: {},
    isReadOnly: { type: Boolean },
    isCompact: { type: Boolean },
    execution: {},
    entries: {},
    flatLogEntries: {},
    latestNodeInfo: {}
  },
  emits: ["clickHeader", "select", "clearExecutionData", "openNdv", "toggleExpanded", "loadSubExecution"],
  setup(__props, { emit: __emit }) {
    const emit = __emit;
    const locale = useI18n$1();
    const router = useRouter();
    const runWorkflow = useRunWorkflow({ router });
    const isClearExecutionButtonVisible = useClearExecutionButtonVisible();
    const isEmpty2 = computed(() => __props.flatLogEntries.length === 0 || __props.execution === void 0);
    const switchViewOptions = computed(() => [
      { label: locale.baseText("logs.overview.header.switch.overview"), value: "overview" },
      { label: locale.baseText("logs.overview.header.switch.details"), value: "details" }
    ]);
    const consumedTokens2 = computed(
      () => getTotalConsumedTokens(
        ...__props.entries.map(
          (entry) => getSubtreeTotalConsumedTokens(
            entry,
            false
            // Exclude token usages from sub workflow which is loaded only after expanding the row
          )
        )
      )
    );
    const shouldShowTokenCountColumn = computed(
      () => consumedTokens2.value.totalTokens > 0 || __props.entries.some((entry) => getSubtreeTotalConsumedTokens(entry, true).totalTokens > 0)
    );
    const virtualList = useVirtualList(
      toRef(() => __props.flatLogEntries),
      { itemHeight: 32 }
    );
    function handleSwitchView(value) {
      emit("select", value === "overview" ? void 0 : __props.flatLogEntries[0]);
    }
    function handleToggleExpanded(treeNode) {
      if (hasSubExecution(treeNode) && treeNode.children.length === 0) {
        emit("loadSubExecution", treeNode);
        return;
      }
      emit("toggleExpanded", treeNode);
    }
    async function handleTriggerPartialExecution(treeNode) {
      const latestName = __props.latestNodeInfo[treeNode.node.id]?.name ?? treeNode.node.name;
      if (latestName) {
        await runWorkflow.runWorkflow({ destinationNode: latestName });
      }
    }
    watch(
      () => __props.selected,
      async (selection) => {
        if (selection && virtualList.list.value.every((e) => e.data.id !== selection.id)) {
          const index = __props.flatLogEntries.findIndex((e) => e.id === selection?.id);
          if (index >= 0) {
            await nextTick(() => virtualList.scrollTo(index));
          }
        }
      },
      { immediate: true }
    );
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", {
        class: normalizeClass(_ctx.$style.container),
        "data-test-id": "logs-overview"
      }, [
        createVNode(LogsPanelHeader, {
          title: unref(locale).baseText("logs.overview.header.title"),
          "data-test-id": "logs-overview-header",
          onClick: _cache[1] || (_cache[1] = ($event) => emit("clickHeader"))
        }, {
          actions: withCtx(() => [
            unref(isClearExecutionButtonVisible) ? (openBlock(), createBlock(unref(N8nTooltip), {
              key: 0,
              content: unref(locale).baseText("logs.overview.header.actions.clearExecution.tooltip")
            }, {
              default: withCtx(() => [
                createVNode(unref(N8nButton), {
                  size: "mini",
                  type: "secondary",
                  icon: "trash",
                  "icon-size": "medium",
                  "data-test-id": "clear-execution-data-button",
                  class: normalizeClass(_ctx.$style.clearButton),
                  onClick: _cache[0] || (_cache[0] = withModifiers(($event) => emit("clearExecutionData"), ["stop"]))
                }, {
                  default: withCtx(() => [
                    createTextVNode(toDisplayString(unref(locale).baseText("logs.overview.header.actions.clearExecution")), 1)
                  ]),
                  _: 1
                }, 8, ["class"])
              ]),
              _: 1
            }, 8, ["content"])) : createCommentVNode("", true),
            renderSlot(_ctx.$slots, "actions")
          ]),
          _: 3
        }, 8, ["title"]),
        _ctx.isOpen ? (openBlock(), createElementBlock("div", {
          key: 0,
          class: normalizeClass([_ctx.$style.content, isEmpty2.value ? _ctx.$style.empty : ""]),
          "data-test-id": "logs-overview-body"
        }, [
          isEmpty2.value || _ctx.execution === void 0 ? (openBlock(), createBlock(unref(N8nText), {
            key: 0,
            tag: "p",
            size: "medium",
            color: "text-base",
            class: normalizeClass(_ctx.$style.emptyText),
            "data-test-id": "logs-overview-empty"
          }, {
            default: withCtx(() => [
              createTextVNode(toDisplayString(unref(locale).baseText("logs.overview.body.empty.message")), 1)
            ]),
            _: 1
          }, 8, ["class"])) : (openBlock(), createElementBlock(Fragment, { key: 1 }, [
            createVNode(LogsViewExecutionSummary, {
              "data-test-id": "logs-overview-status",
              class: normalizeClass(_ctx.$style.summary),
              status: _ctx.execution.status,
              "consumed-tokens": consumedTokens2.value,
              "start-time": +new Date(_ctx.execution.startedAt),
              "time-took": _ctx.execution.startedAt && _ctx.execution.stoppedAt ? +new Date(_ctx.execution.stoppedAt) - +new Date(_ctx.execution.startedAt) : void 0
            }, null, 8, ["class", "status", "consumed-tokens", "start-time", "time-took"]),
            createBaseVNode("div", mergeProps({
              class: _ctx.$style.tree
            }, unref(virtualList).containerProps), [
              createBaseVNode("div", mergeProps(unref(virtualList).wrapperProps.value, { role: "tree" }), [
                (openBlock(true), createElementBlock(Fragment, null, renderList(unref(virtualList).list.value, ({ data, index }) => {
                  return openBlock(), createBlock(LogsOverviewRow, {
                    key: index,
                    data,
                    "is-read-only": _ctx.isReadOnly,
                    "is-selected": data.id === _ctx.selected?.id,
                    "is-compact": _ctx.isCompact,
                    "should-show-token-count-column": shouldShowTokenCountColumn.value,
                    "latest-info": _ctx.latestNodeInfo[data.node.id],
                    expanded: unref(virtualList).list.value[index + 1]?.data.parent?.id === data.id,
                    "can-open-ndv": data.executionId === _ctx.execution?.id,
                    onToggleExpanded: ($event) => handleToggleExpanded(data),
                    onOpenNdv: ($event) => emit("openNdv", data),
                    onTriggerPartialExecution: ($event) => handleTriggerPartialExecution(data),
                    onToggleSelected: ($event) => emit("select", _ctx.selected?.id === data.id ? void 0 : data)
                  }, null, 8, ["data", "is-read-only", "is-selected", "is-compact", "should-show-token-count-column", "latest-info", "expanded", "can-open-ndv", "onToggleExpanded", "onOpenNdv", "onTriggerPartialExecution", "onToggleSelected"]);
                }), 128))
              ], 16)
            ], 16),
            createVNode(unref(N8nRadioButtons), {
              size: "small-medium",
              class: normalizeClass(_ctx.$style.switchViewButtons),
              "model-value": _ctx.selected ? "details" : "overview",
              options: switchViewOptions.value,
              "onUpdate:modelValue": handleSwitchView
            }, null, 8, ["class", "model-value", "options"])
          ], 64))
        ], 2)) : createCommentVNode("", true)
      ], 2);
    };
  }
});
const container$5 = "_container_fcgc7_123";
const clearButton = "_clearButton_fcgc7_133";
const content$1 = "_content_fcgc7_139";
const empty = "_empty_fcgc7_148";
const emptyText = "_emptyText_fcgc7_153";
const summary = "_summary_fcgc7_158";
const tree = "_tree_fcgc7_162";
const switchViewButtons = "_switchViewButtons_fcgc7_170";
const style0$7 = {
  container: container$5,
  clearButton,
  content: content$1,
  empty,
  emptyText,
  summary,
  tree,
  switchViewButtons
};
const cssModules$7 = {
  "$style": style0$7
};
const LogsOverviewPanel = /* @__PURE__ */ _export_sfc(_sfc_main$d, [["__cssModules", cssModules$7]]);
function bash(hljs) {
  const regex = hljs.regex;
  const VAR = {};
  const BRACED_VAR = {
    begin: /\$\{/,
    end: /\}/,
    contains: [
      "self",
      {
        begin: /:-/,
        contains: [VAR]
      }
      // default values
    ]
  };
  Object.assign(VAR, {
    className: "variable",
    variants: [
      { begin: regex.concat(
        /\$[\w\d#@][\w\d_]*/,
        // negative look-ahead tries to avoid matching patterns that are not
        // Perl at all like $ident$, @ident@, etc.
        `(?![\\w\\d])(?![$])`
      ) },
      BRACED_VAR
    ]
  });
  const SUBST = {
    className: "subst",
    begin: /\$\(/,
    end: /\)/,
    contains: [hljs.BACKSLASH_ESCAPE]
  };
  const HERE_DOC = {
    begin: /<<-?\s*(?=\w+)/,
    starts: { contains: [
      hljs.END_SAME_AS_BEGIN({
        begin: /(\w+)/,
        end: /(\w+)/,
        className: "string"
      })
    ] }
  };
  const QUOTE_STRING = {
    className: "string",
    begin: /"/,
    end: /"/,
    contains: [
      hljs.BACKSLASH_ESCAPE,
      VAR,
      SUBST
    ]
  };
  SUBST.contains.push(QUOTE_STRING);
  const ESCAPED_QUOTE = {
    match: /\\"/
  };
  const APOS_STRING = {
    className: "string",
    begin: /'/,
    end: /'/
  };
  const ESCAPED_APOS = {
    match: /\\'/
  };
  const ARITHMETIC = {
    begin: /\$?\(\(/,
    end: /\)\)/,
    contains: [
      {
        begin: /\d+#[0-9a-f]+/,
        className: "number"
      },
      hljs.NUMBER_MODE,
      VAR
    ]
  };
  const SH_LIKE_SHELLS = [
    "fish",
    "bash",
    "zsh",
    "sh",
    "csh",
    "ksh",
    "tcsh",
    "dash",
    "scsh"
  ];
  const KNOWN_SHEBANG = hljs.SHEBANG({
    binary: `(${SH_LIKE_SHELLS.join("|")})`,
    relevance: 10
  });
  const FUNCTION = {
    className: "function",
    begin: /\w[\w\d_]*\s*\(\s*\)\s*\{/,
    returnBegin: true,
    contains: [hljs.inherit(hljs.TITLE_MODE, { begin: /\w[\w\d_]*/ })],
    relevance: 0
  };
  const KEYWORDS2 = [
    "if",
    "then",
    "else",
    "elif",
    "fi",
    "for",
    "while",
    "until",
    "in",
    "do",
    "done",
    "case",
    "esac",
    "function",
    "select"
  ];
  const LITERALS2 = [
    "true",
    "false"
  ];
  const PATH_MODE = { match: /(\/[a-z._-]+)+/ };
  const SHELL_BUILT_INS = [
    "break",
    "cd",
    "continue",
    "eval",
    "exec",
    "exit",
    "export",
    "getopts",
    "hash",
    "pwd",
    "readonly",
    "return",
    "shift",
    "test",
    "times",
    "trap",
    "umask",
    "unset"
  ];
  const BASH_BUILT_INS = [
    "alias",
    "bind",
    "builtin",
    "caller",
    "command",
    "declare",
    "echo",
    "enable",
    "help",
    "let",
    "local",
    "logout",
    "mapfile",
    "printf",
    "read",
    "readarray",
    "source",
    "type",
    "typeset",
    "ulimit",
    "unalias"
  ];
  const ZSH_BUILT_INS = [
    "autoload",
    "bg",
    "bindkey",
    "bye",
    "cap",
    "chdir",
    "clone",
    "comparguments",
    "compcall",
    "compctl",
    "compdescribe",
    "compfiles",
    "compgroups",
    "compquote",
    "comptags",
    "comptry",
    "compvalues",
    "dirs",
    "disable",
    "disown",
    "echotc",
    "echoti",
    "emulate",
    "fc",
    "fg",
    "float",
    "functions",
    "getcap",
    "getln",
    "history",
    "integer",
    "jobs",
    "kill",
    "limit",
    "log",
    "noglob",
    "popd",
    "print",
    "pushd",
    "pushln",
    "rehash",
    "sched",
    "setcap",
    "setopt",
    "stat",
    "suspend",
    "ttyctl",
    "unfunction",
    "unhash",
    "unlimit",
    "unsetopt",
    "vared",
    "wait",
    "whence",
    "where",
    "which",
    "zcompile",
    "zformat",
    "zftp",
    "zle",
    "zmodload",
    "zparseopts",
    "zprof",
    "zpty",
    "zregexparse",
    "zsocket",
    "zstyle",
    "ztcp"
  ];
  const GNU_CORE_UTILS = [
    "chcon",
    "chgrp",
    "chown",
    "chmod",
    "cp",
    "dd",
    "df",
    "dir",
    "dircolors",
    "ln",
    "ls",
    "mkdir",
    "mkfifo",
    "mknod",
    "mktemp",
    "mv",
    "realpath",
    "rm",
    "rmdir",
    "shred",
    "sync",
    "touch",
    "truncate",
    "vdir",
    "b2sum",
    "base32",
    "base64",
    "cat",
    "cksum",
    "comm",
    "csplit",
    "cut",
    "expand",
    "fmt",
    "fold",
    "head",
    "join",
    "md5sum",
    "nl",
    "numfmt",
    "od",
    "paste",
    "ptx",
    "pr",
    "sha1sum",
    "sha224sum",
    "sha256sum",
    "sha384sum",
    "sha512sum",
    "shuf",
    "sort",
    "split",
    "sum",
    "tac",
    "tail",
    "tr",
    "tsort",
    "unexpand",
    "uniq",
    "wc",
    "arch",
    "basename",
    "chroot",
    "date",
    "dirname",
    "du",
    "echo",
    "env",
    "expr",
    "factor",
    // "false", // keyword literal already
    "groups",
    "hostid",
    "id",
    "link",
    "logname",
    "nice",
    "nohup",
    "nproc",
    "pathchk",
    "pinky",
    "printenv",
    "printf",
    "pwd",
    "readlink",
    "runcon",
    "seq",
    "sleep",
    "stat",
    "stdbuf",
    "stty",
    "tee",
    "test",
    "timeout",
    // "true", // keyword literal already
    "tty",
    "uname",
    "unlink",
    "uptime",
    "users",
    "who",
    "whoami",
    "yes"
  ];
  return {
    name: "Bash",
    aliases: ["sh"],
    keywords: {
      $pattern: /\b[a-z][a-z0-9._-]+\b/,
      keyword: KEYWORDS2,
      literal: LITERALS2,
      built_in: [
        ...SHELL_BUILT_INS,
        ...BASH_BUILT_INS,
        // Shell modifiers
        "set",
        "shopt",
        ...ZSH_BUILT_INS,
        ...GNU_CORE_UTILS
      ]
    },
    contains: [
      KNOWN_SHEBANG,
      // to catch known shells and boost relevancy
      hljs.SHEBANG(),
      // to catch unknown shells but still highlight the shebang
      FUNCTION,
      ARITHMETIC,
      hljs.HASH_COMMENT_MODE,
      HERE_DOC,
      PATH_MODE,
      QUOTE_STRING,
      ESCAPED_QUOTE,
      APOS_STRING,
      ESCAPED_APOS,
      VAR
    ]
  };
}
const IDENT_RE$1 = "[A-Za-z$_][0-9A-Za-z$_]*";
const KEYWORDS$1 = [
  "as",
  // for exports
  "in",
  "of",
  "if",
  "for",
  "while",
  "finally",
  "var",
  "new",
  "function",
  "do",
  "return",
  "void",
  "else",
  "break",
  "catch",
  "instanceof",
  "with",
  "throw",
  "case",
  "default",
  "try",
  "switch",
  "continue",
  "typeof",
  "delete",
  "let",
  "yield",
  "const",
  "class",
  // JS handles these with a special rule
  // "get",
  // "set",
  "debugger",
  "async",
  "await",
  "static",
  "import",
  "from",
  "export",
  "extends"
];
const LITERALS$1 = [
  "true",
  "false",
  "null",
  "undefined",
  "NaN",
  "Infinity"
];
const TYPES$1 = [
  // Fundamental objects
  "Object",
  "Function",
  "Boolean",
  "Symbol",
  // numbers and dates
  "Math",
  "Date",
  "Number",
  "BigInt",
  // text
  "String",
  "RegExp",
  // Indexed collections
  "Array",
  "Float32Array",
  "Float64Array",
  "Int8Array",
  "Uint8Array",
  "Uint8ClampedArray",
  "Int16Array",
  "Int32Array",
  "Uint16Array",
  "Uint32Array",
  "BigInt64Array",
  "BigUint64Array",
  // Keyed collections
  "Set",
  "Map",
  "WeakSet",
  "WeakMap",
  // Structured data
  "ArrayBuffer",
  "SharedArrayBuffer",
  "Atomics",
  "DataView",
  "JSON",
  // Control abstraction objects
  "Promise",
  "Generator",
  "GeneratorFunction",
  "AsyncFunction",
  // Reflection
  "Reflect",
  "Proxy",
  // Internationalization
  "Intl",
  // WebAssembly
  "WebAssembly"
];
const ERROR_TYPES$1 = [
  "Error",
  "EvalError",
  "InternalError",
  "RangeError",
  "ReferenceError",
  "SyntaxError",
  "TypeError",
  "URIError"
];
const BUILT_IN_GLOBALS$1 = [
  "setInterval",
  "setTimeout",
  "clearInterval",
  "clearTimeout",
  "require",
  "exports",
  "eval",
  "isFinite",
  "isNaN",
  "parseFloat",
  "parseInt",
  "decodeURI",
  "decodeURIComponent",
  "encodeURI",
  "encodeURIComponent",
  "escape",
  "unescape"
];
const BUILT_IN_VARIABLES$1 = [
  "arguments",
  "this",
  "super",
  "console",
  "window",
  "document",
  "localStorage",
  "sessionStorage",
  "module",
  "global"
  // Node.js
];
const BUILT_INS$1 = [].concat(
  BUILT_IN_GLOBALS$1,
  TYPES$1,
  ERROR_TYPES$1
);
function javascript$1(hljs) {
  const regex = hljs.regex;
  const hasClosingTag = (match, { after }) => {
    const tag = "</" + match[0].slice(1);
    const pos = match.input.indexOf(tag, after);
    return pos !== -1;
  };
  const IDENT_RE$1$1 = IDENT_RE$1;
  const FRAGMENT = {
    begin: "<>",
    end: "</>"
  };
  const XML_SELF_CLOSING = /<[A-Za-z0-9\\._:-]+\s*\/>/;
  const XML_TAG = {
    begin: /<[A-Za-z0-9\\._:-]+/,
    end: /\/[A-Za-z0-9\\._:-]+>|\/>/,
    /**
     * @param {RegExpMatchArray} match
     * @param {CallbackResponse} response
     */
    isTrulyOpeningTag: (match, response) => {
      const afterMatchIndex = match[0].length + match.index;
      const nextChar = match.input[afterMatchIndex];
      if (
        // HTML should not include another raw `<` inside a tag
        // nested type?
        // `<Array<Array<number>>`, etc.
        nextChar === "<" || // the , gives away that this is not HTML
        // `<T, A extends keyof T, V>`
        nextChar === ","
      ) {
        response.ignoreMatch();
        return;
      }
      if (nextChar === ">") {
        if (!hasClosingTag(match, { after: afterMatchIndex })) {
          response.ignoreMatch();
        }
      }
      let m;
      const afterMatch = match.input.substring(afterMatchIndex);
      if (m = afterMatch.match(/^\s*=/)) {
        response.ignoreMatch();
        return;
      }
      if (m = afterMatch.match(/^\s+extends\s+/)) {
        if (m.index === 0) {
          response.ignoreMatch();
          return;
        }
      }
    }
  };
  const KEYWORDS$1$1 = {
    $pattern: IDENT_RE$1,
    keyword: KEYWORDS$1,
    literal: LITERALS$1,
    built_in: BUILT_INS$1,
    "variable.language": BUILT_IN_VARIABLES$1
  };
  const decimalDigits = "[0-9](_?[0-9])*";
  const frac = `\\.(${decimalDigits})`;
  const decimalInteger = `0|[1-9](_?[0-9])*|0[0-7]*[89][0-9]*`;
  const NUMBER = {
    className: "number",
    variants: [
      // DecimalLiteral
      { begin: `(\\b(${decimalInteger})((${frac})|\\.)?|(${frac}))[eE][+-]?(${decimalDigits})\\b` },
      { begin: `\\b(${decimalInteger})\\b((${frac})\\b|\\.)?|(${frac})\\b` },
      // DecimalBigIntegerLiteral
      { begin: `\\b(0|[1-9](_?[0-9])*)n\\b` },
      // NonDecimalIntegerLiteral
      { begin: "\\b0[xX][0-9a-fA-F](_?[0-9a-fA-F])*n?\\b" },
      { begin: "\\b0[bB][0-1](_?[0-1])*n?\\b" },
      { begin: "\\b0[oO][0-7](_?[0-7])*n?\\b" },
      // LegacyOctalIntegerLiteral (does not include underscore separators)
      // https://tc39.es/ecma262/#sec-additional-syntax-numeric-literals
      { begin: "\\b0[0-7]+n?\\b" }
    ],
    relevance: 0
  };
  const SUBST = {
    className: "subst",
    begin: "\\$\\{",
    end: "\\}",
    keywords: KEYWORDS$1$1,
    contains: []
    // defined later
  };
  const HTML_TEMPLATE = {
    begin: "html`",
    end: "",
    starts: {
      end: "`",
      returnEnd: false,
      contains: [
        hljs.BACKSLASH_ESCAPE,
        SUBST
      ],
      subLanguage: "xml"
    }
  };
  const CSS_TEMPLATE = {
    begin: "css`",
    end: "",
    starts: {
      end: "`",
      returnEnd: false,
      contains: [
        hljs.BACKSLASH_ESCAPE,
        SUBST
      ],
      subLanguage: "css"
    }
  };
  const GRAPHQL_TEMPLATE = {
    begin: "gql`",
    end: "",
    starts: {
      end: "`",
      returnEnd: false,
      contains: [
        hljs.BACKSLASH_ESCAPE,
        SUBST
      ],
      subLanguage: "graphql"
    }
  };
  const TEMPLATE_STRING = {
    className: "string",
    begin: "`",
    end: "`",
    contains: [
      hljs.BACKSLASH_ESCAPE,
      SUBST
    ]
  };
  const JSDOC_COMMENT = hljs.COMMENT(
    /\/\*\*(?!\/)/,
    "\\*/",
    {
      relevance: 0,
      contains: [
        {
          begin: "(?=@[A-Za-z]+)",
          relevance: 0,
          contains: [
            {
              className: "doctag",
              begin: "@[A-Za-z]+"
            },
            {
              className: "type",
              begin: "\\{",
              end: "\\}",
              excludeEnd: true,
              excludeBegin: true,
              relevance: 0
            },
            {
              className: "variable",
              begin: IDENT_RE$1$1 + "(?=\\s*(-)|$)",
              endsParent: true,
              relevance: 0
            },
            // eat spaces (not newlines) so we can find
            // types or variables
            {
              begin: /(?=[^\n])\s/,
              relevance: 0
            }
          ]
        }
      ]
    }
  );
  const COMMENT = {
    className: "comment",
    variants: [
      JSDOC_COMMENT,
      hljs.C_BLOCK_COMMENT_MODE,
      hljs.C_LINE_COMMENT_MODE
    ]
  };
  const SUBST_INTERNALS = [
    hljs.APOS_STRING_MODE,
    hljs.QUOTE_STRING_MODE,
    HTML_TEMPLATE,
    CSS_TEMPLATE,
    GRAPHQL_TEMPLATE,
    TEMPLATE_STRING,
    // Skip numbers when they are part of a variable name
    { match: /\$\d+/ },
    NUMBER
    // This is intentional:
    // See https://github.com/highlightjs/highlight.js/issues/3288
    // hljs.REGEXP_MODE
  ];
  SUBST.contains = SUBST_INTERNALS.concat({
    // we need to pair up {} inside our subst to prevent
    // it from ending too early by matching another }
    begin: /\{/,
    end: /\}/,
    keywords: KEYWORDS$1$1,
    contains: [
      "self"
    ].concat(SUBST_INTERNALS)
  });
  const SUBST_AND_COMMENTS = [].concat(COMMENT, SUBST.contains);
  const PARAMS_CONTAINS = SUBST_AND_COMMENTS.concat([
    // eat recursive parens in sub expressions
    {
      begin: /\(/,
      end: /\)/,
      keywords: KEYWORDS$1$1,
      contains: ["self"].concat(SUBST_AND_COMMENTS)
    }
  ]);
  const PARAMS = {
    className: "params",
    begin: /\(/,
    end: /\)/,
    excludeBegin: true,
    excludeEnd: true,
    keywords: KEYWORDS$1$1,
    contains: PARAMS_CONTAINS
  };
  const CLASS_OR_EXTENDS = {
    variants: [
      // class Car extends vehicle
      {
        match: [
          /class/,
          /\s+/,
          IDENT_RE$1$1,
          /\s+/,
          /extends/,
          /\s+/,
          regex.concat(IDENT_RE$1$1, "(", regex.concat(/\./, IDENT_RE$1$1), ")*")
        ],
        scope: {
          1: "keyword",
          3: "title.class",
          5: "keyword",
          7: "title.class.inherited"
        }
      },
      // class Car
      {
        match: [
          /class/,
          /\s+/,
          IDENT_RE$1$1
        ],
        scope: {
          1: "keyword",
          3: "title.class"
        }
      }
    ]
  };
  const CLASS_REFERENCE = {
    relevance: 0,
    match: regex.either(
      // Hard coded exceptions
      /\bJSON/,
      // Float32Array, OutT
      /\b[A-Z][a-z]+([A-Z][a-z]*|\d)*/,
      // CSSFactory, CSSFactoryT
      /\b[A-Z]{2,}([A-Z][a-z]+|\d)+([A-Z][a-z]*)*/,
      // FPs, FPsT
      /\b[A-Z]{2,}[a-z]+([A-Z][a-z]+|\d)*([A-Z][a-z]*)*/
      // P
      // single letters are not highlighted
      // BLAH
      // this will be flagged as a UPPER_CASE_CONSTANT instead
    ),
    className: "title.class",
    keywords: {
      _: [
        // se we still get relevance credit for JS library classes
        ...TYPES$1,
        ...ERROR_TYPES$1
      ]
    }
  };
  const USE_STRICT = {
    label: "use_strict",
    className: "meta",
    relevance: 10,
    begin: /^\s*['"]use (strict|asm)['"]/
  };
  const FUNCTION_DEFINITION = {
    variants: [
      {
        match: [
          /function/,
          /\s+/,
          IDENT_RE$1$1,
          /(?=\s*\()/
        ]
      },
      // anonymous function
      {
        match: [
          /function/,
          /\s*(?=\()/
        ]
      }
    ],
    className: {
      1: "keyword",
      3: "title.function"
    },
    label: "func.def",
    contains: [PARAMS],
    illegal: /%/
  };
  const UPPER_CASE_CONSTANT = {
    relevance: 0,
    match: /\b[A-Z][A-Z_0-9]+\b/,
    className: "variable.constant"
  };
  function noneOf(list) {
    return regex.concat("(?!", list.join("|"), ")");
  }
  const FUNCTION_CALL = {
    match: regex.concat(
      /\b/,
      noneOf([
        ...BUILT_IN_GLOBALS$1,
        "super",
        "import"
      ]),
      IDENT_RE$1$1,
      regex.lookahead(/\(/)
    ),
    className: "title.function",
    relevance: 0
  };
  const PROPERTY_ACCESS = {
    begin: regex.concat(/\./, regex.lookahead(
      regex.concat(IDENT_RE$1$1, /(?![0-9A-Za-z$_(])/)
    )),
    end: IDENT_RE$1$1,
    excludeBegin: true,
    keywords: "prototype",
    className: "property",
    relevance: 0
  };
  const GETTER_OR_SETTER = {
    match: [
      /get|set/,
      /\s+/,
      IDENT_RE$1$1,
      /(?=\()/
    ],
    className: {
      1: "keyword",
      3: "title.function"
    },
    contains: [
      {
        // eat to avoid empty params
        begin: /\(\)/
      },
      PARAMS
    ]
  };
  const FUNC_LEAD_IN_RE = "(\\([^()]*(\\([^()]*(\\([^()]*\\)[^()]*)*\\)[^()]*)*\\)|" + hljs.UNDERSCORE_IDENT_RE + ")\\s*=>";
  const FUNCTION_VARIABLE = {
    match: [
      /const|var|let/,
      /\s+/,
      IDENT_RE$1$1,
      /\s*/,
      /=\s*/,
      /(async\s*)?/,
      // async is optional
      regex.lookahead(FUNC_LEAD_IN_RE)
    ],
    keywords: "async",
    className: {
      1: "keyword",
      3: "title.function"
    },
    contains: [
      PARAMS
    ]
  };
  return {
    name: "JavaScript",
    aliases: ["js", "jsx", "mjs", "cjs"],
    keywords: KEYWORDS$1$1,
    // this will be extended by TypeScript
    exports: { PARAMS_CONTAINS, CLASS_REFERENCE },
    illegal: /#(?![$_A-z])/,
    contains: [
      hljs.SHEBANG({
        label: "shebang",
        binary: "node",
        relevance: 5
      }),
      USE_STRICT,
      hljs.APOS_STRING_MODE,
      hljs.QUOTE_STRING_MODE,
      HTML_TEMPLATE,
      CSS_TEMPLATE,
      GRAPHQL_TEMPLATE,
      TEMPLATE_STRING,
      COMMENT,
      // Skip numbers when they are part of a variable name
      { match: /\$\d+/ },
      NUMBER,
      CLASS_REFERENCE,
      {
        className: "attr",
        begin: IDENT_RE$1$1 + regex.lookahead(":"),
        relevance: 0
      },
      FUNCTION_VARIABLE,
      {
        // "value" container
        begin: "(" + hljs.RE_STARTERS_RE + "|\\b(case|return|throw)\\b)\\s*",
        keywords: "return throw case",
        relevance: 0,
        contains: [
          COMMENT,
          hljs.REGEXP_MODE,
          {
            className: "function",
            // we have to count the parens to make sure we actually have the
            // correct bounding ( ) before the =>.  There could be any number of
            // sub-expressions inside also surrounded by parens.
            begin: FUNC_LEAD_IN_RE,
            returnBegin: true,
            end: "\\s*=>",
            contains: [
              {
                className: "params",
                variants: [
                  {
                    begin: hljs.UNDERSCORE_IDENT_RE,
                    relevance: 0
                  },
                  {
                    className: null,
                    begin: /\(\s*\)/,
                    skip: true
                  },
                  {
                    begin: /\(/,
                    end: /\)/,
                    excludeBegin: true,
                    excludeEnd: true,
                    keywords: KEYWORDS$1$1,
                    contains: PARAMS_CONTAINS
                  }
                ]
              }
            ]
          },
          {
            // could be a comma delimited list of params to a function call
            begin: /,/,
            relevance: 0
          },
          {
            match: /\s+/,
            relevance: 0
          },
          {
            // JSX
            variants: [
              { begin: FRAGMENT.begin, end: FRAGMENT.end },
              { match: XML_SELF_CLOSING },
              {
                begin: XML_TAG.begin,
                // we carefully check the opening tag to see if it truly
                // is a tag and not a false positive
                "on:begin": XML_TAG.isTrulyOpeningTag,
                end: XML_TAG.end
              }
            ],
            subLanguage: "xml",
            contains: [
              {
                begin: XML_TAG.begin,
                end: XML_TAG.end,
                skip: true,
                contains: ["self"]
              }
            ]
          }
        ]
      },
      FUNCTION_DEFINITION,
      {
        // prevent this from getting swallowed up by function
        // since they appear "function like"
        beginKeywords: "while if switch catch for"
      },
      {
        // we have to count the parens to make sure we actually have the correct
        // bounding ( ).  There could be any number of sub-expressions inside
        // also surrounded by parens.
        begin: "\\b(?!function)" + hljs.UNDERSCORE_IDENT_RE + "\\([^()]*(\\([^()]*(\\([^()]*\\)[^()]*)*\\)[^()]*)*\\)\\s*\\{",
        // end parens
        returnBegin: true,
        label: "func.def",
        contains: [
          PARAMS,
          hljs.inherit(hljs.TITLE_MODE, { begin: IDENT_RE$1$1, className: "title.function" })
        ]
      },
      // catch ... so it won't trigger the property rule below
      {
        match: /\.\.\./,
        relevance: 0
      },
      PROPERTY_ACCESS,
      // hack: prevents detection of keywords in some circumstances
      // .keyword()
      // $keyword = x
      {
        match: "\\$" + IDENT_RE$1$1,
        relevance: 0
      },
      {
        match: [/\bconstructor(?=\s*\()/],
        className: { 1: "title.function" },
        contains: [PARAMS]
      },
      FUNCTION_CALL,
      UPPER_CASE_CONSTANT,
      CLASS_OR_EXTENDS,
      GETTER_OR_SETTER,
      {
        match: /\$[(.]/
        // relevance booster for a pattern common to JS libs: `$(something)` and `$.something`
      }
    ]
  };
}
function python(hljs) {
  const regex = hljs.regex;
  const IDENT_RE2 = new RegExp("[\\p{XID_Start}_]\\p{XID_Continue}*", "u");
  const RESERVED_WORDS = [
    "and",
    "as",
    "assert",
    "async",
    "await",
    "break",
    "case",
    "class",
    "continue",
    "def",
    "del",
    "elif",
    "else",
    "except",
    "finally",
    "for",
    "from",
    "global",
    "if",
    "import",
    "in",
    "is",
    "lambda",
    "match",
    "nonlocal|10",
    "not",
    "or",
    "pass",
    "raise",
    "return",
    "try",
    "while",
    "with",
    "yield"
  ];
  const BUILT_INS2 = [
    "__import__",
    "abs",
    "all",
    "any",
    "ascii",
    "bin",
    "bool",
    "breakpoint",
    "bytearray",
    "bytes",
    "callable",
    "chr",
    "classmethod",
    "compile",
    "complex",
    "delattr",
    "dict",
    "dir",
    "divmod",
    "enumerate",
    "eval",
    "exec",
    "filter",
    "float",
    "format",
    "frozenset",
    "getattr",
    "globals",
    "hasattr",
    "hash",
    "help",
    "hex",
    "id",
    "input",
    "int",
    "isinstance",
    "issubclass",
    "iter",
    "len",
    "list",
    "locals",
    "map",
    "max",
    "memoryview",
    "min",
    "next",
    "object",
    "oct",
    "open",
    "ord",
    "pow",
    "print",
    "property",
    "range",
    "repr",
    "reversed",
    "round",
    "set",
    "setattr",
    "slice",
    "sorted",
    "staticmethod",
    "str",
    "sum",
    "super",
    "tuple",
    "type",
    "vars",
    "zip"
  ];
  const LITERALS2 = [
    "__debug__",
    "Ellipsis",
    "False",
    "None",
    "NotImplemented",
    "True"
  ];
  const TYPES2 = [
    "Any",
    "Callable",
    "Coroutine",
    "Dict",
    "List",
    "Literal",
    "Generic",
    "Optional",
    "Sequence",
    "Set",
    "Tuple",
    "Type",
    "Union"
  ];
  const KEYWORDS2 = {
    $pattern: /[A-Za-z]\w+|__\w+__/,
    keyword: RESERVED_WORDS,
    built_in: BUILT_INS2,
    literal: LITERALS2,
    type: TYPES2
  };
  const PROMPT = {
    className: "meta",
    begin: /^(>>>|\.\.\.) /
  };
  const SUBST = {
    className: "subst",
    begin: /\{/,
    end: /\}/,
    keywords: KEYWORDS2,
    illegal: /#/
  };
  const LITERAL_BRACKET = {
    begin: /\{\{/,
    relevance: 0
  };
  const STRING = {
    className: "string",
    contains: [hljs.BACKSLASH_ESCAPE],
    variants: [
      {
        begin: /([uU]|[bB]|[rR]|[bB][rR]|[rR][bB])?'''/,
        end: /'''/,
        contains: [
          hljs.BACKSLASH_ESCAPE,
          PROMPT
        ],
        relevance: 10
      },
      {
        begin: /([uU]|[bB]|[rR]|[bB][rR]|[rR][bB])?"""/,
        end: /"""/,
        contains: [
          hljs.BACKSLASH_ESCAPE,
          PROMPT
        ],
        relevance: 10
      },
      {
        begin: /([fF][rR]|[rR][fF]|[fF])'''/,
        end: /'''/,
        contains: [
          hljs.BACKSLASH_ESCAPE,
          PROMPT,
          LITERAL_BRACKET,
          SUBST
        ]
      },
      {
        begin: /([fF][rR]|[rR][fF]|[fF])"""/,
        end: /"""/,
        contains: [
          hljs.BACKSLASH_ESCAPE,
          PROMPT,
          LITERAL_BRACKET,
          SUBST
        ]
      },
      {
        begin: /([uU]|[rR])'/,
        end: /'/,
        relevance: 10
      },
      {
        begin: /([uU]|[rR])"/,
        end: /"/,
        relevance: 10
      },
      {
        begin: /([bB]|[bB][rR]|[rR][bB])'/,
        end: /'/
      },
      {
        begin: /([bB]|[bB][rR]|[rR][bB])"/,
        end: /"/
      },
      {
        begin: /([fF][rR]|[rR][fF]|[fF])'/,
        end: /'/,
        contains: [
          hljs.BACKSLASH_ESCAPE,
          LITERAL_BRACKET,
          SUBST
        ]
      },
      {
        begin: /([fF][rR]|[rR][fF]|[fF])"/,
        end: /"/,
        contains: [
          hljs.BACKSLASH_ESCAPE,
          LITERAL_BRACKET,
          SUBST
        ]
      },
      hljs.APOS_STRING_MODE,
      hljs.QUOTE_STRING_MODE
    ]
  };
  const digitpart = "[0-9](_?[0-9])*";
  const pointfloat = `(\\b(${digitpart}))?\\.(${digitpart})|\\b(${digitpart})\\.`;
  const lookahead = `\\b|${RESERVED_WORDS.join("|")}`;
  const NUMBER = {
    className: "number",
    relevance: 0,
    variants: [
      // exponentfloat, pointfloat
      // https://docs.python.org/3.9/reference/lexical_analysis.html#floating-point-literals
      // optionally imaginary
      // https://docs.python.org/3.9/reference/lexical_analysis.html#imaginary-literals
      // Note: no leading \b because floats can start with a decimal point
      // and we don't want to mishandle e.g. `fn(.5)`,
      // no trailing \b for pointfloat because it can end with a decimal point
      // and we don't want to mishandle e.g. `0..hex()`; this should be safe
      // because both MUST contain a decimal point and so cannot be confused with
      // the interior part of an identifier
      {
        begin: `(\\b(${digitpart})|(${pointfloat}))[eE][+-]?(${digitpart})[jJ]?(?=${lookahead})`
      },
      {
        begin: `(${pointfloat})[jJ]?`
      },
      // decinteger, bininteger, octinteger, hexinteger
      // https://docs.python.org/3.9/reference/lexical_analysis.html#integer-literals
      // optionally "long" in Python 2
      // https://docs.python.org/2.7/reference/lexical_analysis.html#integer-and-long-integer-literals
      // decinteger is optionally imaginary
      // https://docs.python.org/3.9/reference/lexical_analysis.html#imaginary-literals
      {
        begin: `\\b([1-9](_?[0-9])*|0+(_?0)*)[lLjJ]?(?=${lookahead})`
      },
      {
        begin: `\\b0[bB](_?[01])+[lL]?(?=${lookahead})`
      },
      {
        begin: `\\b0[oO](_?[0-7])+[lL]?(?=${lookahead})`
      },
      {
        begin: `\\b0[xX](_?[0-9a-fA-F])+[lL]?(?=${lookahead})`
      },
      // imagnumber (digitpart-based)
      // https://docs.python.org/3.9/reference/lexical_analysis.html#imaginary-literals
      {
        begin: `\\b(${digitpart})[jJ](?=${lookahead})`
      }
    ]
  };
  const COMMENT_TYPE = {
    className: "comment",
    begin: regex.lookahead(/# type:/),
    end: /$/,
    keywords: KEYWORDS2,
    contains: [
      {
        // prevent keywords from coloring `type`
        begin: /# type:/
      },
      // comment within a datatype comment includes no keywords
      {
        begin: /#/,
        end: /\b\B/,
        endsWithParent: true
      }
    ]
  };
  const PARAMS = {
    className: "params",
    variants: [
      // Exclude params in functions without params
      {
        className: "",
        begin: /\(\s*\)/,
        skip: true
      },
      {
        begin: /\(/,
        end: /\)/,
        excludeBegin: true,
        excludeEnd: true,
        keywords: KEYWORDS2,
        contains: [
          "self",
          PROMPT,
          NUMBER,
          STRING,
          hljs.HASH_COMMENT_MODE
        ]
      }
    ]
  };
  SUBST.contains = [
    STRING,
    NUMBER,
    PROMPT
  ];
  return {
    name: "Python",
    aliases: [
      "py",
      "gyp",
      "ipython"
    ],
    unicodeRegex: true,
    keywords: KEYWORDS2,
    illegal: /(<\/|\?)|=>/,
    contains: [
      PROMPT,
      NUMBER,
      {
        // very common convention
        begin: /\bself\b/
      },
      {
        // eat "if" prior to string so that it won't accidentally be
        // labeled as an f-string
        beginKeywords: "if",
        relevance: 0
      },
      STRING,
      COMMENT_TYPE,
      hljs.HASH_COMMENT_MODE,
      {
        match: [
          /\bdef/,
          /\s+/,
          IDENT_RE2
        ],
        scope: {
          1: "keyword",
          3: "title.function"
        },
        contains: [PARAMS]
      },
      {
        variants: [
          {
            match: [
              /\bclass/,
              /\s+/,
              IDENT_RE2,
              /\s*/,
              /\(\s*/,
              IDENT_RE2,
              /\s*\)/
            ]
          },
          {
            match: [
              /\bclass/,
              /\s+/,
              IDENT_RE2
            ]
          }
        ],
        scope: {
          1: "keyword",
          3: "title.class",
          6: "title.class.inherited"
        }
      },
      {
        className: "meta",
        begin: /^[\t ]*@/,
        end: /(?=#)|$/,
        contains: [
          NUMBER,
          PARAMS,
          STRING
        ]
      }
    ]
  };
}
const IDENT_RE = "[A-Za-z$_][0-9A-Za-z$_]*";
const KEYWORDS = [
  "as",
  // for exports
  "in",
  "of",
  "if",
  "for",
  "while",
  "finally",
  "var",
  "new",
  "function",
  "do",
  "return",
  "void",
  "else",
  "break",
  "catch",
  "instanceof",
  "with",
  "throw",
  "case",
  "default",
  "try",
  "switch",
  "continue",
  "typeof",
  "delete",
  "let",
  "yield",
  "const",
  "class",
  // JS handles these with a special rule
  // "get",
  // "set",
  "debugger",
  "async",
  "await",
  "static",
  "import",
  "from",
  "export",
  "extends"
];
const LITERALS = [
  "true",
  "false",
  "null",
  "undefined",
  "NaN",
  "Infinity"
];
const TYPES = [
  // Fundamental objects
  "Object",
  "Function",
  "Boolean",
  "Symbol",
  // numbers and dates
  "Math",
  "Date",
  "Number",
  "BigInt",
  // text
  "String",
  "RegExp",
  // Indexed collections
  "Array",
  "Float32Array",
  "Float64Array",
  "Int8Array",
  "Uint8Array",
  "Uint8ClampedArray",
  "Int16Array",
  "Int32Array",
  "Uint16Array",
  "Uint32Array",
  "BigInt64Array",
  "BigUint64Array",
  // Keyed collections
  "Set",
  "Map",
  "WeakSet",
  "WeakMap",
  // Structured data
  "ArrayBuffer",
  "SharedArrayBuffer",
  "Atomics",
  "DataView",
  "JSON",
  // Control abstraction objects
  "Promise",
  "Generator",
  "GeneratorFunction",
  "AsyncFunction",
  // Reflection
  "Reflect",
  "Proxy",
  // Internationalization
  "Intl",
  // WebAssembly
  "WebAssembly"
];
const ERROR_TYPES = [
  "Error",
  "EvalError",
  "InternalError",
  "RangeError",
  "ReferenceError",
  "SyntaxError",
  "TypeError",
  "URIError"
];
const BUILT_IN_GLOBALS = [
  "setInterval",
  "setTimeout",
  "clearInterval",
  "clearTimeout",
  "require",
  "exports",
  "eval",
  "isFinite",
  "isNaN",
  "parseFloat",
  "parseInt",
  "decodeURI",
  "decodeURIComponent",
  "encodeURI",
  "encodeURIComponent",
  "escape",
  "unescape"
];
const BUILT_IN_VARIABLES = [
  "arguments",
  "this",
  "super",
  "console",
  "window",
  "document",
  "localStorage",
  "sessionStorage",
  "module",
  "global"
  // Node.js
];
const BUILT_INS = [].concat(
  BUILT_IN_GLOBALS,
  TYPES,
  ERROR_TYPES
);
function javascript(hljs) {
  const regex = hljs.regex;
  const hasClosingTag = (match, { after }) => {
    const tag = "</" + match[0].slice(1);
    const pos = match.input.indexOf(tag, after);
    return pos !== -1;
  };
  const IDENT_RE$12 = IDENT_RE;
  const FRAGMENT = {
    begin: "<>",
    end: "</>"
  };
  const XML_SELF_CLOSING = /<[A-Za-z0-9\\._:-]+\s*\/>/;
  const XML_TAG = {
    begin: /<[A-Za-z0-9\\._:-]+/,
    end: /\/[A-Za-z0-9\\._:-]+>|\/>/,
    /**
     * @param {RegExpMatchArray} match
     * @param {CallbackResponse} response
     */
    isTrulyOpeningTag: (match, response) => {
      const afterMatchIndex = match[0].length + match.index;
      const nextChar = match.input[afterMatchIndex];
      if (
        // HTML should not include another raw `<` inside a tag
        // nested type?
        // `<Array<Array<number>>`, etc.
        nextChar === "<" || // the , gives away that this is not HTML
        // `<T, A extends keyof T, V>`
        nextChar === ","
      ) {
        response.ignoreMatch();
        return;
      }
      if (nextChar === ">") {
        if (!hasClosingTag(match, { after: afterMatchIndex })) {
          response.ignoreMatch();
        }
      }
      let m;
      const afterMatch = match.input.substring(afterMatchIndex);
      if (m = afterMatch.match(/^\s*=/)) {
        response.ignoreMatch();
        return;
      }
      if (m = afterMatch.match(/^\s+extends\s+/)) {
        if (m.index === 0) {
          response.ignoreMatch();
          return;
        }
      }
    }
  };
  const KEYWORDS$12 = {
    $pattern: IDENT_RE,
    keyword: KEYWORDS,
    literal: LITERALS,
    built_in: BUILT_INS,
    "variable.language": BUILT_IN_VARIABLES
  };
  const decimalDigits = "[0-9](_?[0-9])*";
  const frac = `\\.(${decimalDigits})`;
  const decimalInteger = `0|[1-9](_?[0-9])*|0[0-7]*[89][0-9]*`;
  const NUMBER = {
    className: "number",
    variants: [
      // DecimalLiteral
      { begin: `(\\b(${decimalInteger})((${frac})|\\.)?|(${frac}))[eE][+-]?(${decimalDigits})\\b` },
      { begin: `\\b(${decimalInteger})\\b((${frac})\\b|\\.)?|(${frac})\\b` },
      // DecimalBigIntegerLiteral
      { begin: `\\b(0|[1-9](_?[0-9])*)n\\b` },
      // NonDecimalIntegerLiteral
      { begin: "\\b0[xX][0-9a-fA-F](_?[0-9a-fA-F])*n?\\b" },
      { begin: "\\b0[bB][0-1](_?[0-1])*n?\\b" },
      { begin: "\\b0[oO][0-7](_?[0-7])*n?\\b" },
      // LegacyOctalIntegerLiteral (does not include underscore separators)
      // https://tc39.es/ecma262/#sec-additional-syntax-numeric-literals
      { begin: "\\b0[0-7]+n?\\b" }
    ],
    relevance: 0
  };
  const SUBST = {
    className: "subst",
    begin: "\\$\\{",
    end: "\\}",
    keywords: KEYWORDS$12,
    contains: []
    // defined later
  };
  const HTML_TEMPLATE = {
    begin: "html`",
    end: "",
    starts: {
      end: "`",
      returnEnd: false,
      contains: [
        hljs.BACKSLASH_ESCAPE,
        SUBST
      ],
      subLanguage: "xml"
    }
  };
  const CSS_TEMPLATE = {
    begin: "css`",
    end: "",
    starts: {
      end: "`",
      returnEnd: false,
      contains: [
        hljs.BACKSLASH_ESCAPE,
        SUBST
      ],
      subLanguage: "css"
    }
  };
  const GRAPHQL_TEMPLATE = {
    begin: "gql`",
    end: "",
    starts: {
      end: "`",
      returnEnd: false,
      contains: [
        hljs.BACKSLASH_ESCAPE,
        SUBST
      ],
      subLanguage: "graphql"
    }
  };
  const TEMPLATE_STRING = {
    className: "string",
    begin: "`",
    end: "`",
    contains: [
      hljs.BACKSLASH_ESCAPE,
      SUBST
    ]
  };
  const JSDOC_COMMENT = hljs.COMMENT(
    /\/\*\*(?!\/)/,
    "\\*/",
    {
      relevance: 0,
      contains: [
        {
          begin: "(?=@[A-Za-z]+)",
          relevance: 0,
          contains: [
            {
              className: "doctag",
              begin: "@[A-Za-z]+"
            },
            {
              className: "type",
              begin: "\\{",
              end: "\\}",
              excludeEnd: true,
              excludeBegin: true,
              relevance: 0
            },
            {
              className: "variable",
              begin: IDENT_RE$12 + "(?=\\s*(-)|$)",
              endsParent: true,
              relevance: 0
            },
            // eat spaces (not newlines) so we can find
            // types or variables
            {
              begin: /(?=[^\n])\s/,
              relevance: 0
            }
          ]
        }
      ]
    }
  );
  const COMMENT = {
    className: "comment",
    variants: [
      JSDOC_COMMENT,
      hljs.C_BLOCK_COMMENT_MODE,
      hljs.C_LINE_COMMENT_MODE
    ]
  };
  const SUBST_INTERNALS = [
    hljs.APOS_STRING_MODE,
    hljs.QUOTE_STRING_MODE,
    HTML_TEMPLATE,
    CSS_TEMPLATE,
    GRAPHQL_TEMPLATE,
    TEMPLATE_STRING,
    // Skip numbers when they are part of a variable name
    { match: /\$\d+/ },
    NUMBER
    // This is intentional:
    // See https://github.com/highlightjs/highlight.js/issues/3288
    // hljs.REGEXP_MODE
  ];
  SUBST.contains = SUBST_INTERNALS.concat({
    // we need to pair up {} inside our subst to prevent
    // it from ending too early by matching another }
    begin: /\{/,
    end: /\}/,
    keywords: KEYWORDS$12,
    contains: [
      "self"
    ].concat(SUBST_INTERNALS)
  });
  const SUBST_AND_COMMENTS = [].concat(COMMENT, SUBST.contains);
  const PARAMS_CONTAINS = SUBST_AND_COMMENTS.concat([
    // eat recursive parens in sub expressions
    {
      begin: /\(/,
      end: /\)/,
      keywords: KEYWORDS$12,
      contains: ["self"].concat(SUBST_AND_COMMENTS)
    }
  ]);
  const PARAMS = {
    className: "params",
    begin: /\(/,
    end: /\)/,
    excludeBegin: true,
    excludeEnd: true,
    keywords: KEYWORDS$12,
    contains: PARAMS_CONTAINS
  };
  const CLASS_OR_EXTENDS = {
    variants: [
      // class Car extends vehicle
      {
        match: [
          /class/,
          /\s+/,
          IDENT_RE$12,
          /\s+/,
          /extends/,
          /\s+/,
          regex.concat(IDENT_RE$12, "(", regex.concat(/\./, IDENT_RE$12), ")*")
        ],
        scope: {
          1: "keyword",
          3: "title.class",
          5: "keyword",
          7: "title.class.inherited"
        }
      },
      // class Car
      {
        match: [
          /class/,
          /\s+/,
          IDENT_RE$12
        ],
        scope: {
          1: "keyword",
          3: "title.class"
        }
      }
    ]
  };
  const CLASS_REFERENCE = {
    relevance: 0,
    match: regex.either(
      // Hard coded exceptions
      /\bJSON/,
      // Float32Array, OutT
      /\b[A-Z][a-z]+([A-Z][a-z]*|\d)*/,
      // CSSFactory, CSSFactoryT
      /\b[A-Z]{2,}([A-Z][a-z]+|\d)+([A-Z][a-z]*)*/,
      // FPs, FPsT
      /\b[A-Z]{2,}[a-z]+([A-Z][a-z]+|\d)*([A-Z][a-z]*)*/
      // P
      // single letters are not highlighted
      // BLAH
      // this will be flagged as a UPPER_CASE_CONSTANT instead
    ),
    className: "title.class",
    keywords: {
      _: [
        // se we still get relevance credit for JS library classes
        ...TYPES,
        ...ERROR_TYPES
      ]
    }
  };
  const USE_STRICT = {
    label: "use_strict",
    className: "meta",
    relevance: 10,
    begin: /^\s*['"]use (strict|asm)['"]/
  };
  const FUNCTION_DEFINITION = {
    variants: [
      {
        match: [
          /function/,
          /\s+/,
          IDENT_RE$12,
          /(?=\s*\()/
        ]
      },
      // anonymous function
      {
        match: [
          /function/,
          /\s*(?=\()/
        ]
      }
    ],
    className: {
      1: "keyword",
      3: "title.function"
    },
    label: "func.def",
    contains: [PARAMS],
    illegal: /%/
  };
  const UPPER_CASE_CONSTANT = {
    relevance: 0,
    match: /\b[A-Z][A-Z_0-9]+\b/,
    className: "variable.constant"
  };
  function noneOf(list) {
    return regex.concat("(?!", list.join("|"), ")");
  }
  const FUNCTION_CALL = {
    match: regex.concat(
      /\b/,
      noneOf([
        ...BUILT_IN_GLOBALS,
        "super",
        "import"
      ]),
      IDENT_RE$12,
      regex.lookahead(/\(/)
    ),
    className: "title.function",
    relevance: 0
  };
  const PROPERTY_ACCESS = {
    begin: regex.concat(/\./, regex.lookahead(
      regex.concat(IDENT_RE$12, /(?![0-9A-Za-z$_(])/)
    )),
    end: IDENT_RE$12,
    excludeBegin: true,
    keywords: "prototype",
    className: "property",
    relevance: 0
  };
  const GETTER_OR_SETTER = {
    match: [
      /get|set/,
      /\s+/,
      IDENT_RE$12,
      /(?=\()/
    ],
    className: {
      1: "keyword",
      3: "title.function"
    },
    contains: [
      {
        // eat to avoid empty params
        begin: /\(\)/
      },
      PARAMS
    ]
  };
  const FUNC_LEAD_IN_RE = "(\\([^()]*(\\([^()]*(\\([^()]*\\)[^()]*)*\\)[^()]*)*\\)|" + hljs.UNDERSCORE_IDENT_RE + ")\\s*=>";
  const FUNCTION_VARIABLE = {
    match: [
      /const|var|let/,
      /\s+/,
      IDENT_RE$12,
      /\s*/,
      /=\s*/,
      /(async\s*)?/,
      // async is optional
      regex.lookahead(FUNC_LEAD_IN_RE)
    ],
    keywords: "async",
    className: {
      1: "keyword",
      3: "title.function"
    },
    contains: [
      PARAMS
    ]
  };
  return {
    name: "JavaScript",
    aliases: ["js", "jsx", "mjs", "cjs"],
    keywords: KEYWORDS$12,
    // this will be extended by TypeScript
    exports: { PARAMS_CONTAINS, CLASS_REFERENCE },
    illegal: /#(?![$_A-z])/,
    contains: [
      hljs.SHEBANG({
        label: "shebang",
        binary: "node",
        relevance: 5
      }),
      USE_STRICT,
      hljs.APOS_STRING_MODE,
      hljs.QUOTE_STRING_MODE,
      HTML_TEMPLATE,
      CSS_TEMPLATE,
      GRAPHQL_TEMPLATE,
      TEMPLATE_STRING,
      COMMENT,
      // Skip numbers when they are part of a variable name
      { match: /\$\d+/ },
      NUMBER,
      CLASS_REFERENCE,
      {
        className: "attr",
        begin: IDENT_RE$12 + regex.lookahead(":"),
        relevance: 0
      },
      FUNCTION_VARIABLE,
      {
        // "value" container
        begin: "(" + hljs.RE_STARTERS_RE + "|\\b(case|return|throw)\\b)\\s*",
        keywords: "return throw case",
        relevance: 0,
        contains: [
          COMMENT,
          hljs.REGEXP_MODE,
          {
            className: "function",
            // we have to count the parens to make sure we actually have the
            // correct bounding ( ) before the =>.  There could be any number of
            // sub-expressions inside also surrounded by parens.
            begin: FUNC_LEAD_IN_RE,
            returnBegin: true,
            end: "\\s*=>",
            contains: [
              {
                className: "params",
                variants: [
                  {
                    begin: hljs.UNDERSCORE_IDENT_RE,
                    relevance: 0
                  },
                  {
                    className: null,
                    begin: /\(\s*\)/,
                    skip: true
                  },
                  {
                    begin: /\(/,
                    end: /\)/,
                    excludeBegin: true,
                    excludeEnd: true,
                    keywords: KEYWORDS$12,
                    contains: PARAMS_CONTAINS
                  }
                ]
              }
            ]
          },
          {
            // could be a comma delimited list of params to a function call
            begin: /,/,
            relevance: 0
          },
          {
            match: /\s+/,
            relevance: 0
          },
          {
            // JSX
            variants: [
              { begin: FRAGMENT.begin, end: FRAGMENT.end },
              { match: XML_SELF_CLOSING },
              {
                begin: XML_TAG.begin,
                // we carefully check the opening tag to see if it truly
                // is a tag and not a false positive
                "on:begin": XML_TAG.isTrulyOpeningTag,
                end: XML_TAG.end
              }
            ],
            subLanguage: "xml",
            contains: [
              {
                begin: XML_TAG.begin,
                end: XML_TAG.end,
                skip: true,
                contains: ["self"]
              }
            ]
          }
        ]
      },
      FUNCTION_DEFINITION,
      {
        // prevent this from getting swallowed up by function
        // since they appear "function like"
        beginKeywords: "while if switch catch for"
      },
      {
        // we have to count the parens to make sure we actually have the correct
        // bounding ( ).  There could be any number of sub-expressions inside
        // also surrounded by parens.
        begin: "\\b(?!function)" + hljs.UNDERSCORE_IDENT_RE + "\\([^()]*(\\([^()]*(\\([^()]*\\)[^()]*)*\\)[^()]*)*\\)\\s*\\{",
        // end parens
        returnBegin: true,
        label: "func.def",
        contains: [
          PARAMS,
          hljs.inherit(hljs.TITLE_MODE, { begin: IDENT_RE$12, className: "title.function" })
        ]
      },
      // catch ... so it won't trigger the property rule below
      {
        match: /\.\.\./,
        relevance: 0
      },
      PROPERTY_ACCESS,
      // hack: prevents detection of keywords in some circumstances
      // .keyword()
      // $keyword = x
      {
        match: "\\$" + IDENT_RE$12,
        relevance: 0
      },
      {
        match: [/\bconstructor(?=\s*\()/],
        className: { 1: "title.function" },
        contains: [PARAMS]
      },
      FUNCTION_CALL,
      UPPER_CASE_CONSTANT,
      CLASS_OR_EXTENDS,
      GETTER_OR_SETTER,
      {
        match: /\$[(.]/
        // relevance booster for a pattern common to JS libs: `$(something)` and `$.something`
      }
    ]
  };
}
function typescript(hljs) {
  const tsLanguage = javascript(hljs);
  const IDENT_RE$12 = IDENT_RE;
  const TYPES2 = [
    "any",
    "void",
    "number",
    "boolean",
    "string",
    "object",
    "never",
    "symbol",
    "bigint",
    "unknown"
  ];
  const NAMESPACE = {
    beginKeywords: "namespace",
    end: /\{/,
    excludeEnd: true,
    contains: [tsLanguage.exports.CLASS_REFERENCE]
  };
  const INTERFACE = {
    beginKeywords: "interface",
    end: /\{/,
    excludeEnd: true,
    keywords: {
      keyword: "interface extends",
      built_in: TYPES2
    },
    contains: [tsLanguage.exports.CLASS_REFERENCE]
  };
  const USE_STRICT = {
    className: "meta",
    relevance: 10,
    begin: /^\s*['"]use strict['"]/
  };
  const TS_SPECIFIC_KEYWORDS = [
    "type",
    "namespace",
    "interface",
    "public",
    "private",
    "protected",
    "implements",
    "declare",
    "abstract",
    "readonly",
    "enum",
    "override"
  ];
  const KEYWORDS$12 = {
    $pattern: IDENT_RE,
    keyword: KEYWORDS.concat(TS_SPECIFIC_KEYWORDS),
    literal: LITERALS,
    built_in: BUILT_INS.concat(TYPES2),
    "variable.language": BUILT_IN_VARIABLES
  };
  const DECORATOR = {
    className: "meta",
    begin: "@" + IDENT_RE$12
  };
  const swapMode = (mode, label, replacement) => {
    const indx = mode.contains.findIndex((m) => m.label === label);
    if (indx === -1) {
      throw new Error("can not find mode to replace");
    }
    mode.contains.splice(indx, 1, replacement);
  };
  Object.assign(tsLanguage.keywords, KEYWORDS$12);
  tsLanguage.exports.PARAMS_CONTAINS.push(DECORATOR);
  tsLanguage.contains = tsLanguage.contains.concat([
    DECORATOR,
    NAMESPACE,
    INTERFACE
  ]);
  swapMode(tsLanguage, "shebang", hljs.SHEBANG());
  swapMode(tsLanguage, "use_strict", USE_STRICT);
  const functionDeclaration = tsLanguage.contains.find((m) => m.label === "func.def");
  functionDeclaration.relevance = 0;
  Object.assign(tsLanguage, {
    name: "TypeScript",
    aliases: [
      "ts",
      "tsx",
      "mts",
      "cts"
    ]
  });
  return tsLanguage;
}
function xml(hljs) {
  const regex = hljs.regex;
  const TAG_NAME_RE = regex.concat(/[\p{L}_]/u, regex.optional(/[\p{L}0-9_.-]*:/u), /[\p{L}0-9_.-]*/u);
  const XML_IDENT_RE = /[\p{L}0-9._:-]+/u;
  const XML_ENTITIES = {
    className: "symbol",
    begin: /&[a-z]+;|&#[0-9]+;|&#x[a-f0-9]+;/
  };
  const XML_META_KEYWORDS = {
    begin: /\s/,
    contains: [
      {
        className: "keyword",
        begin: /#?[a-z_][a-z1-9_-]+/,
        illegal: /\n/
      }
    ]
  };
  const XML_META_PAR_KEYWORDS = hljs.inherit(XML_META_KEYWORDS, {
    begin: /\(/,
    end: /\)/
  });
  const APOS_META_STRING_MODE = hljs.inherit(hljs.APOS_STRING_MODE, { className: "string" });
  const QUOTE_META_STRING_MODE = hljs.inherit(hljs.QUOTE_STRING_MODE, { className: "string" });
  const TAG_INTERNALS = {
    endsWithParent: true,
    illegal: /</,
    relevance: 0,
    contains: [
      {
        className: "attr",
        begin: XML_IDENT_RE,
        relevance: 0
      },
      {
        begin: /=\s*/,
        relevance: 0,
        contains: [
          {
            className: "string",
            endsParent: true,
            variants: [
              {
                begin: /"/,
                end: /"/,
                contains: [XML_ENTITIES]
              },
              {
                begin: /'/,
                end: /'/,
                contains: [XML_ENTITIES]
              },
              { begin: /[^\s"'=<>`]+/ }
            ]
          }
        ]
      }
    ]
  };
  return {
    name: "HTML, XML",
    aliases: [
      "html",
      "xhtml",
      "rss",
      "atom",
      "xjb",
      "xsd",
      "xsl",
      "plist",
      "wsf",
      "svg"
    ],
    case_insensitive: true,
    unicodeRegex: true,
    contains: [
      {
        className: "meta",
        begin: /<![a-z]/,
        end: />/,
        relevance: 10,
        contains: [
          XML_META_KEYWORDS,
          QUOTE_META_STRING_MODE,
          APOS_META_STRING_MODE,
          XML_META_PAR_KEYWORDS,
          {
            begin: /\[/,
            end: /\]/,
            contains: [
              {
                className: "meta",
                begin: /<![a-z]/,
                end: />/,
                contains: [
                  XML_META_KEYWORDS,
                  XML_META_PAR_KEYWORDS,
                  QUOTE_META_STRING_MODE,
                  APOS_META_STRING_MODE
                ]
              }
            ]
          }
        ]
      },
      hljs.COMMENT(
        /<!--/,
        /-->/,
        { relevance: 10 }
      ),
      {
        begin: /<!\[CDATA\[/,
        end: /\]\]>/,
        relevance: 10
      },
      XML_ENTITIES,
      // xml processing instructions
      {
        className: "meta",
        end: /\?>/,
        variants: [
          {
            begin: /<\?xml/,
            relevance: 10,
            contains: [
              QUOTE_META_STRING_MODE
            ]
          },
          {
            begin: /<\?[a-z][a-z0-9]+/
          }
        ]
      },
      {
        className: "tag",
        /*
        The lookahead pattern (?=...) ensures that 'begin' only matches
        '<style' as a single word, followed by a whitespace or an
        ending bracket.
        */
        begin: /<style(?=\s|>)/,
        end: />/,
        keywords: { name: "style" },
        contains: [TAG_INTERNALS],
        starts: {
          end: /<\/style>/,
          returnEnd: true,
          subLanguage: [
            "css",
            "xml"
          ]
        }
      },
      {
        className: "tag",
        // See the comment in the <style tag about the lookahead pattern
        begin: /<script(?=\s|>)/,
        end: />/,
        keywords: { name: "script" },
        contains: [TAG_INTERNALS],
        starts: {
          end: /<\/script>/,
          returnEnd: true,
          subLanguage: [
            "javascript",
            "handlebars",
            "xml"
          ]
        }
      },
      // we need this for now for jSX
      {
        className: "tag",
        begin: /<>|<\/>/
      },
      // open tag
      {
        className: "tag",
        begin: regex.concat(
          /</,
          regex.lookahead(regex.concat(
            TAG_NAME_RE,
            // <tag/>
            // <tag>
            // <tag ...
            regex.either(/\/>/, />/, /\s/)
          ))
        ),
        end: /\/?>/,
        contains: [
          {
            className: "name",
            begin: TAG_NAME_RE,
            relevance: 0,
            starts: TAG_INTERNALS
          }
        ]
      },
      // close tag
      {
        className: "tag",
        begin: regex.concat(
          /<\//,
          regex.lookahead(regex.concat(
            TAG_NAME_RE,
            />/
          ))
        ),
        contains: [
          {
            className: "name",
            begin: TAG_NAME_RE,
            relevance: 0
          },
          {
            begin: />/,
            relevance: 0,
            endsParent: true
          }
        ]
      }
    ]
  };
}
function useChat() {
  return inject(ChatSymbol);
}
function useOptions() {
  const options = inject(ChatOptionsSymbol);
  return {
    options
  };
}
function useI18n() {
  const { options } = useOptions();
  const language = options?.defaultLanguage ?? "en";
  function t(key) {
    const val = options?.i18n?.[language]?.[key];
    if (isRef(val)) {
      return val.value;
    }
    return val ?? key;
  }
  function te(key) {
    return !!options?.i18n?.[language]?.[key];
  }
  return { t, te };
}
const _hoisted_1$c = {
  viewBox: "0 0 24 24",
  width: "1.2em",
  height: "1.2em"
};
function render$7(_ctx, _cache) {
  return openBlock(), createElementBlock("svg", _hoisted_1$c, _cache[0] || (_cache[0] = [
    createBaseVNode("path", {
      fill: "currentColor",
      d: "M20 6.91L17.09 4L12 9.09L6.91 4L4 6.91L9.09 12L4 17.09L6.91 20L12 14.91L17.09 20L20 17.09L14.91 12z"
    }, null, -1)
  ]));
}
const IconDelete = { name: "mdi-closeThick", render: render$7 };
const _hoisted_1$b = {
  viewBox: "0 0 24 24",
  width: "1.2em",
  height: "1.2em"
};
function render$6(_ctx, _cache) {
  return openBlock(), createElementBlock("svg", _hoisted_1$b, _cache[0] || (_cache[0] = [
    createBaseVNode("path", {
      fill: "currentColor",
      d: "M13 9h5.5L13 3.5zM6 2h8l6 6v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4c0-1.11.89-2 2-2m0 18h12v-8l-4 4l-2-2zM8 9a2 2 0 0 0-2 2a2 2 0 0 0 2 2a2 2 0 0 0 2-2a2 2 0 0 0-2-2"
    }, null, -1)
  ]));
}
const IconFileImage = { name: "mdi-fileImage", render: render$6 };
const _hoisted_1$a = {
  viewBox: "0 0 24 24",
  width: "1.2em",
  height: "1.2em"
};
function render$5(_ctx, _cache) {
  return openBlock(), createElementBlock("svg", _hoisted_1$a, _cache[0] || (_cache[0] = [
    createBaseVNode("path", {
      fill: "currentColor",
      d: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zm-1 11h-2v5a2 2 0 0 1-2 2a2 2 0 0 1-2-2a2 2 0 0 1 2-2c.4 0 .7.1 1 .3V11h3zm0-4V3.5L18.5 9z"
    }, null, -1)
  ]));
}
const IconFileMusic = { name: "mdi-fileMusic", render: render$5 };
const _hoisted_1$9 = {
  viewBox: "0 0 24 24",
  width: "1.2em",
  height: "1.2em"
};
function render$4(_ctx, _cache) {
  return openBlock(), createElementBlock("svg", _hoisted_1$9, _cache[0] || (_cache[0] = [
    createBaseVNode("path", {
      fill: "currentColor",
      d: "M13 9h5.5L13 3.5zM6 2h8l6 6v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4c0-1.11.89-2 2-2m9 16v-2H6v2zm3-4v-2H6v2z"
    }, null, -1)
  ]));
}
const IconFileText = { name: "mdi-fileText", render: render$4 };
const _hoisted_1$8 = {
  viewBox: "0 0 24 24",
  width: "1.2em",
  height: "1.2em"
};
function render$3(_ctx, _cache) {
  return openBlock(), createElementBlock("svg", _hoisted_1$8, _cache[0] || (_cache[0] = [
    createBaseVNode("path", {
      fill: "currentColor",
      d: "M13 9h5.5L13 3.5zM6 2h8l6 6v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4c0-1.11.89-2 2-2m11 17v-6l-3 2.2V13H7v6h7v-2.2z"
    }, null, -1)
  ]));
}
const IconFileVideo = { name: "mdi-fileVideo", render: render$3 };
const _hoisted_1$7 = {
  viewBox: "0 0 24 24",
  width: "1.2em",
  height: "1.2em"
};
function render$2(_ctx, _cache) {
  return openBlock(), createElementBlock("svg", _hoisted_1$7, _cache[0] || (_cache[0] = [
    createBaseVNode("path", {
      fill: "currentColor",
      d: "M14 3v2h3.59l-9.83 9.83l1.41 1.41L19 6.41V10h2V3m-2 16H5V5h7V3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7h-2z"
    }, null, -1)
  ]));
}
const IconPreview = { name: "mdi-openInNew", render: render$2 };
const _hoisted_1$6 = { class: "chat-file-name" };
const _sfc_main$c = /* @__PURE__ */ defineComponent({
  __name: "ChatFile",
  props: {
    file: {},
    isRemovable: { type: Boolean },
    isPreviewable: { type: Boolean }
  },
  emits: ["remove"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const iconMapper = {
      document: IconFileText,
      audio: IconFileMusic,
      image: IconFileImage,
      video: IconFileVideo
    };
    const TypeIcon = computed(() => {
      const type = props.file?.type.split("/")[0];
      return iconMapper[type] || IconFileText;
    });
    function onClick() {
      if (props.isPreviewable) {
        window.open(URL.createObjectURL(props.file));
      }
    }
    function onDelete() {
      emit("remove", props.file);
    }
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", {
        class: "chat-file",
        onClick
      }, [
        createVNode(unref(TypeIcon)),
        createBaseVNode("p", _hoisted_1$6, toDisplayString(_ctx.file.name), 1),
        _ctx.isRemovable ? (openBlock(), createElementBlock("span", {
          key: 0,
          class: "chat-file-delete",
          onClick: withModifiers(onDelete, ["stop"])
        }, [
          createVNode(unref(IconDelete))
        ])) : _ctx.isPreviewable ? (openBlock(), createBlock(unref(IconPreview), {
          key: 1,
          class: "chat-file-preview"
        })) : createCommentVNode("", true)
      ]);
    };
  }
});
const ChatFile = /* @__PURE__ */ _export_sfc(_sfc_main$c, [["__scopeId", "data-v-70b9370d"]]);
const _hoisted_1$5 = {
  key: 0,
  class: "chat-message-actions"
};
const _hoisted_2$2 = {
  key: 2,
  class: "chat-message-files"
};
const _sfc_main$b = /* @__PURE__ */ defineComponent({
  __name: "Message",
  props: {
    message: {}
  },
  setup(__props, { expose: __expose }) {
    const props = __props;
    HighlightJS.registerLanguage("javascript", javascript$1);
    HighlightJS.registerLanguage("typescript", typescript);
    HighlightJS.registerLanguage("python", python);
    HighlightJS.registerLanguage("xml", xml);
    HighlightJS.registerLanguage("bash", bash);
    const { message } = toRefs(props);
    const { options } = useOptions();
    const messageContainer = ref(null);
    const fileSources = ref({});
    const messageText = computed(() => {
      return message.value.text || "&lt;Empty response&gt;";
    });
    const classes = computed(() => {
      return {
        "chat-message-from-user": message.value.sender === "user",
        "chat-message-from-bot": message.value.sender === "bot",
        "chat-message-transparent": message.value.transparent === true
      };
    });
    const linksNewTabPlugin = (vueMarkdownItInstance) => {
      vueMarkdownItInstance.use(markdownLink, {
        attrs: {
          target: "_blank",
          rel: "noopener"
        }
      });
    };
    const scrollToView = () => {
      if (messageContainer.value?.scrollIntoView) {
        messageContainer.value.scrollIntoView({
          block: "start"
        });
      }
    };
    const markdownOptions = {
      highlight(str, lang) {
        if (lang && HighlightJS.getLanguage(lang)) {
          try {
            return HighlightJS.highlight(str, { language: lang }).value;
          } catch {
          }
        }
        return "";
      }
    };
    const messageComponents = { ...options?.messageComponents ?? {} };
    __expose({ scrollToView });
    const readFileAsDataURL = async (file) => await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
    onMounted(async () => {
      if (message.value.files) {
        for (const file of message.value.files) {
          try {
            const dataURL = await readFileAsDataURL(file);
            fileSources.value[file.name] = dataURL;
          } catch (error2) {
            console.error("Error reading file:", error2);
          }
        }
      }
    });
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", {
        ref_key: "messageContainer",
        ref: messageContainer,
        class: normalizeClass(["chat-message", classes.value])
      }, [
        _ctx.$slots.beforeMessage ? (openBlock(), createElementBlock("div", _hoisted_1$5, [
          renderSlot(_ctx.$slots, "beforeMessage", normalizeProps(guardReactiveProps({ message: unref(message) })))
        ])) : createCommentVNode("", true),
        renderSlot(_ctx.$slots, "default", {}, () => [
          unref(message).type === "component" && messageComponents[unref(message).key] ? (openBlock(), createBlock(resolveDynamicComponent(messageComponents[unref(message).key]), normalizeProps(mergeProps({ key: 0 }, unref(message).arguments)), null, 16)) : (openBlock(), createBlock(unref(VueMarkdown), {
            key: 1,
            class: "chat-message-markdown",
            source: messageText.value,
            options: markdownOptions,
            plugins: [linksNewTabPlugin]
          }, null, 8, ["source", "plugins"])),
          (unref(message).files ?? []).length > 0 ? (openBlock(), createElementBlock("div", _hoisted_2$2, [
            (openBlock(true), createElementBlock(Fragment, null, renderList(unref(message).files ?? [], (file) => {
              return openBlock(), createElementBlock("div", {
                key: file.name,
                class: "chat-message-file"
              }, [
                createVNode(ChatFile, {
                  file,
                  "is-removable": false,
                  "is-previewable": true
                }, null, 8, ["file"])
              ]);
            }), 128))
          ])) : createCommentVNode("", true)
        ])
      ], 2);
    };
  }
});
const _hoisted_1$4 = {
  viewBox: "0 0 24 24",
  width: "1.2em",
  height: "1.2em"
};
function render$1(_ctx, _cache) {
  return openBlock(), createElementBlock("svg", _hoisted_1$4, _cache[0] || (_cache[0] = [
    createBaseVNode("path", {
      fill: "currentColor",
      d: "M16.5 6v11.5a4 4 0 0 1-4 4a4 4 0 0 1-4-4V5A2.5 2.5 0 0 1 11 2.5A2.5 2.5 0 0 1 13.5 5v10.5a1 1 0 0 1-1 1a1 1 0 0 1-1-1V6H10v9.5a2.5 2.5 0 0 0 2.5 2.5a2.5 2.5 0 0 0 2.5-2.5V5a4 4 0 0 0-4-4a4 4 0 0 0-4 4v12.5a5.5 5.5 0 0 0 5.5 5.5a5.5 5.5 0 0 0 5.5-5.5V6z"
    }, null, -1)
  ]));
}
const IconPaperclip = { name: "mdi-paperclip", render: render$1 };
const _hoisted_1$3 = {
  viewBox: "0 0 24 24",
  width: "1.2em",
  height: "1.2em"
};
function render(_ctx, _cache) {
  return openBlock(), createElementBlock("svg", _hoisted_1$3, _cache[0] || (_cache[0] = [
    createBaseVNode("path", {
      fill: "currentColor",
      d: "m2 21l21-9L2 3v7l15 2l-15 2z"
    }, null, -1)
  ]));
}
const IconSend = { name: "mdi-send", render };
const _hoisted_1$2 = { class: "chat-inputs" };
const _hoisted_2$1 = {
  key: 0,
  class: "chat-input-left-panel"
};
const _hoisted_3$1 = ["disabled", "placeholder"];
const _hoisted_4 = { class: "chat-inputs-controls" };
const _hoisted_5 = ["disabled"];
const _hoisted_6 = ["disabled"];
const _hoisted_7 = {
  key: 0,
  class: "chat-files"
};
const _sfc_main$a = /* @__PURE__ */ defineComponent({
  __name: "Input",
  props: {
    placeholder: { default: "inputPlaceholder" }
  },
  emits: ["arrowKeyDown"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const { t } = useI18n();
    const emit = __emit;
    const { options } = useOptions();
    const chatStore = useChat();
    const { waitingForResponse } = chatStore;
    const files = ref(null);
    const chatTextArea = ref(null);
    const input = ref("");
    const isSubmitting = ref(false);
    const resizeObserver = ref(null);
    const isSubmitDisabled = computed(() => {
      return input.value === "" || unref(waitingForResponse) || options.disabled?.value === true;
    });
    const isInputDisabled = computed(() => options.disabled?.value === true);
    const isFileUploadDisabled = computed(
      () => isFileUploadAllowed.value && unref(waitingForResponse) && !options.disabled?.value
    );
    const isFileUploadAllowed = computed(() => unref(options.allowFileUploads) === true);
    const allowedFileTypes = computed(() => unref(options.allowedFilesMimeTypes));
    const styleVars = computed(() => {
      const controlsCount = isFileUploadAllowed.value ? 2 : 1;
      return {
        "--controls-count": controlsCount
      };
    });
    const {
      open: openFileDialog,
      reset: resetFileDialog,
      onChange
    } = useFileDialog({
      multiple: true,
      reset: false
    });
    onChange((newFiles) => {
      if (!newFiles) return;
      const newFilesDT = new DataTransfer();
      if (files.value) {
        for (let i = 0; i < files.value.length; i++) {
          newFilesDT.items.add(files.value[i]);
        }
      }
      for (let i = 0; i < newFiles.length; i++) {
        newFilesDT.items.add(newFiles[i]);
      }
      files.value = newFilesDT.files;
    });
    onMounted(() => {
      chatEventBus.on("focusInput", focusChatInput);
      chatEventBus.on("blurInput", blurChatInput);
      chatEventBus.on("setInputValue", setInputValue);
      if (chatTextArea.value) {
        resizeObserver.value = new ResizeObserver((entries) => {
          for (const entry of entries) {
            if (entry.target === chatTextArea.value) {
              adjustTextAreaHeight();
            }
          }
        });
        resizeObserver.value.observe(chatTextArea.value);
      }
    });
    onUnmounted(() => {
      chatEventBus.off("focusInput", focusChatInput);
      chatEventBus.off("blurInput", blurChatInput);
      chatEventBus.off("setInputValue", setInputValue);
      if (resizeObserver.value) {
        resizeObserver.value.disconnect();
        resizeObserver.value = null;
      }
    });
    function blurChatInput() {
      if (chatTextArea.value) {
        chatTextArea.value.blur();
      }
    }
    function focusChatInput() {
      if (chatTextArea.value) {
        chatTextArea.value.focus();
      }
    }
    function setInputValue(value) {
      input.value = value;
      focusChatInput();
    }
    async function onSubmit(event) {
      event.preventDefault();
      if (isSubmitDisabled.value) {
        return;
      }
      const messageText = input.value;
      input.value = "";
      isSubmitting.value = true;
      await chatStore.sendMessage(messageText, Array.from(files.value ?? []));
      isSubmitting.value = false;
      resetFileDialog();
      files.value = null;
    }
    async function onSubmitKeydown(event) {
      if (event.shiftKey) {
        return;
      }
      await onSubmit(event);
      adjustTextAreaHeight();
    }
    function onFileRemove(file) {
      if (!files.value) return;
      const dt = new DataTransfer();
      for (let i = 0; i < files.value.length; i++) {
        const currentFile = files.value[i];
        if (file.name !== currentFile.name) dt.items.add(currentFile);
      }
      resetFileDialog();
      files.value = dt.files;
    }
    function onKeyDown(event) {
      if (event.key === "ArrowUp" || event.key === "ArrowDown") {
        event.preventDefault();
        emit("arrowKeyDown", {
          key: event.key,
          currentInputValue: input.value
        });
      }
    }
    function onOpenFileDialog() {
      if (isFileUploadDisabled.value) return;
      openFileDialog({ accept: unref(allowedFileTypes) });
    }
    function adjustTextAreaHeight() {
      const textarea = chatTextArea.value;
      if (!textarea) return;
      textarea.style.height = "var(--chat--textarea--height)";
      const newHeight = Math.min(textarea.scrollHeight, 480);
      textarea.style.height = `${newHeight}px`;
    }
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", {
        class: "chat-input",
        style: normalizeStyle(styleVars.value),
        onKeydown: withModifiers(onKeyDown, ["stop"])
      }, [
        createBaseVNode("div", _hoisted_1$2, [
          _ctx.$slots.leftPanel ? (openBlock(), createElementBlock("div", _hoisted_2$1, [
            renderSlot(_ctx.$slots, "leftPanel", {}, void 0, true)
          ])) : createCommentVNode("", true),
          withDirectives(createBaseVNode("textarea", {
            ref_key: "chatTextArea",
            ref: chatTextArea,
            "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => input.value = $event),
            "data-test-id": "chat-input",
            disabled: isInputDisabled.value,
            placeholder: unref(t)(props.placeholder),
            onKeydown: withKeys(onSubmitKeydown, ["enter"]),
            onInput: adjustTextAreaHeight,
            onMousedown: adjustTextAreaHeight,
            onFocus: adjustTextAreaHeight
          }, null, 40, _hoisted_3$1), [
            [vModelText, input.value]
          ]),
          createBaseVNode("div", _hoisted_4, [
            isFileUploadAllowed.value ? (openBlock(), createElementBlock("button", {
              key: 0,
              disabled: isFileUploadDisabled.value,
              class: "chat-input-file-button",
              "data-test-id": "chat-attach-file-button",
              onClick: onOpenFileDialog
            }, [
              createVNode(unref(IconPaperclip), {
                height: "24",
                width: "24"
              })
            ], 8, _hoisted_5)) : createCommentVNode("", true),
            createBaseVNode("button", {
              disabled: isSubmitDisabled.value,
              class: "chat-input-send-button",
              onClick: onSubmit
            }, [
              createVNode(unref(IconSend), {
                height: "24",
                width: "24"
              })
            ], 8, _hoisted_6)
          ])
        ]),
        files.value?.length && !isSubmitting.value ? (openBlock(), createElementBlock("div", _hoisted_7, [
          (openBlock(true), createElementBlock(Fragment, null, renderList(files.value, (file) => {
            return openBlock(), createBlock(ChatFile, {
              key: file.name,
              file,
              "is-removable": true,
              "is-previewable": true,
              onRemove: onFileRemove
            }, null, 8, ["file"]);
          }), 128))
        ])) : createCommentVNode("", true)
      ], 36);
    };
  }
});
const ChatInput = /* @__PURE__ */ _export_sfc(_sfc_main$a, [["__scopeId", "data-v-f0e5731e"]]);
const _sfc_main$9 = /* @__PURE__ */ defineComponent({
  __name: "MessageTyping",
  props: {
    animation: { default: "bouncing" }
  },
  setup(__props) {
    const props = __props;
    const message = {
      id: "typing",
      text: "",
      sender: "bot"
    };
    const messageContainer = ref();
    const classes = computed(() => {
      return {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        "chat-message-typing": true,
        [`chat-message-typing-animation-${props.animation}`]: true
      };
    });
    onMounted(() => {
      messageContainer.value?.scrollToView();
    });
    return (_ctx, _cache) => {
      return openBlock(), createBlock(unref(_sfc_main$b), {
        ref_key: "messageContainer",
        ref: messageContainer,
        class: normalizeClass(classes.value),
        message,
        "data-test-id": "chat-message-typing"
      }, {
        default: withCtx(() => _cache[0] || (_cache[0] = [
          createBaseVNode("div", { class: "chat-message-typing-body" }, [
            createBaseVNode("span", { class: "chat-message-typing-circle" }),
            createBaseVNode("span", { class: "chat-message-typing-circle" }),
            createBaseVNode("span", { class: "chat-message-typing-circle" })
          ], -1)
        ])),
        _: 1
      }, 8, ["class"]);
    };
  }
});
const _hoisted_1$1 = {
  key: 0,
  class: "empty-container"
};
const _hoisted_2 = {
  class: "empty",
  "data-test-id": "chat-messages-empty"
};
const _hoisted_3 = {
  key: 1,
  class: "chat-messages-list"
};
const _sfc_main$8 = /* @__PURE__ */ defineComponent({
  __name: "MessagesList",
  props: {
    messages: {},
    emptyText: {}
  },
  setup(__props) {
    const chatStore = useChat();
    const messageComponents = ref([]);
    const { initialMessages, waitingForResponse } = chatStore;
    watch(
      () => messageComponents.value.length,
      () => {
        const lastMessageComponent = messageComponents.value[messageComponents.value.length - 1];
        if (lastMessageComponent) {
          lastMessageComponent.scrollToView();
        }
      }
    );
    return (_ctx, _cache) => {
      const _component_N8nIcon = resolveComponent("N8nIcon");
      const _component_N8nText = resolveComponent("N8nText");
      return _ctx.emptyText && unref(initialMessages).length === 0 && _ctx.messages.length === 0 ? (openBlock(), createElementBlock("div", _hoisted_1$1, [
        createBaseVNode("div", _hoisted_2, [
          createVNode(_component_N8nIcon, {
            icon: "comment",
            size: "large",
            class: "emptyIcon"
          }),
          createVNode(_component_N8nText, {
            tag: "p",
            size: "medium",
            color: "text-base"
          }, {
            default: withCtx(() => [
              createTextVNode(toDisplayString(_ctx.emptyText), 1)
            ]),
            _: 1
          })
        ])
      ])) : (openBlock(), createElementBlock("div", _hoisted_3, [
        (openBlock(true), createElementBlock(Fragment, null, renderList(unref(initialMessages), (initialMessage) => {
          return openBlock(), createBlock(_sfc_main$b, {
            key: initialMessage.id,
            message: initialMessage
          }, null, 8, ["message"]);
        }), 128)),
        (openBlock(true), createElementBlock(Fragment, null, renderList(_ctx.messages, (message) => {
          return openBlock(), createBlock(_sfc_main$b, {
            key: message.id,
            ref_for: true,
            ref_key: "messageComponents",
            ref: messageComponents,
            message
          }, {
            beforeMessage: withCtx(({ message: message2 }) => [
              renderSlot(_ctx.$slots, "beforeMessage", mergeProps({ ref_for: true }, { message: message2 }))
            ]),
            _: 2
          }, 1032, ["message"]);
        }), 128)),
        unref(waitingForResponse) ? (openBlock(), createBlock(_sfc_main$9, { key: 0 })) : createCommentVNode("", true)
      ]));
    };
  }
});
const _sfc_main$7 = /* @__PURE__ */ defineComponent({
  __name: "MessageOptionTooltip",
  props: {
    placement: {
      type: String,
      default: "top"
    }
  },
  setup(__props) {
    return (_ctx, _cache) => {
      const _component_n8n_icon = resolveComponent("n8n-icon");
      const _component_n8n_tooltip = resolveComponent("n8n-tooltip");
      return openBlock(), createElementBlock("div", {
        class: normalizeClass(_ctx.$style.container)
      }, [
        createVNode(_component_n8n_tooltip, { placement: __props.placement }, {
          content: withCtx(() => [
            renderSlot(_ctx.$slots, "default")
          ]),
          default: withCtx(() => [
            createBaseVNode("span", {
              class: normalizeClass(_ctx.$style.icon)
            }, [
              createVNode(_component_n8n_icon, {
                icon: "info",
                size: "xsmall"
              })
            ], 2)
          ]),
          _: 3
        }, 8, ["placement"])
      ], 2);
    };
  }
});
const container$4 = "_container_pqtqf_123";
const icon$2 = "_icon_pqtqf_129";
const style0$6 = {
  container: container$4,
  icon: icon$2
};
const cssModules$6 = {
  "$style": style0$6
};
const MessageOptionTooltip = /* @__PURE__ */ _export_sfc(_sfc_main$7, [["__cssModules", cssModules$6]]);
const _sfc_main$6 = /* @__PURE__ */ defineComponent({
  __name: "MessageOptionAction",
  props: {
    label: {
      type: String,
      required: true
    },
    icon: {
      type: String,
      required: true
    },
    placement: {
      type: String,
      default: "top"
    }
  },
  setup(__props) {
    return (_ctx, _cache) => {
      const _component_n8n_icon = resolveComponent("n8n-icon");
      const _component_n8n_tooltip = resolveComponent("n8n-tooltip");
      return openBlock(), createElementBlock("div", {
        class: normalizeClass(_ctx.$style.container)
      }, [
        createVNode(_component_n8n_tooltip, { placement: __props.placement }, {
          content: withCtx(() => [
            createTextVNode(toDisplayString(__props.label), 1)
          ]),
          default: withCtx(() => [
            createVNode(_component_n8n_icon, {
              class: normalizeClass(_ctx.$style.icon),
              icon: __props.icon,
              size: "xsmall",
              onClick: _ctx.$attrs.onClick
            }, null, 8, ["class", "icon", "onClick"])
          ]),
          _: 1
        }, 8, ["placement"])
      ], 2);
    };
  }
});
const container$3 = "_container_u1r1u_123";
const icon$1 = "_icon_u1r1u_129";
const style0$5 = {
  container: container$3,
  icon: icon$1
};
const cssModules$5 = {
  "$style": style0$5
};
const MessageOptionAction = /* @__PURE__ */ _export_sfc(_sfc_main$6, [["__cssModules", cssModules$5]]);
const _hoisted_1 = ["onClick"];
const _sfc_main$5 = /* @__PURE__ */ defineComponent({
  __name: "ChatMessagesPanel",
  props: {
    pastChatMessages: {},
    messages: {},
    sessionId: {},
    showCloseButton: { type: Boolean },
    isOpen: { type: Boolean, default: true },
    isReadOnly: { type: Boolean, default: false }
  },
  emits: ["displayExecution", "sendMessage", "refreshSession", "close", "clickHeader"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const clipboard = useClipboard();
    const locale = useI18n$1();
    const toast = useToast();
    const previousMessageIndex = ref(0);
    const sessionIdText = computed(
      () => locale.baseText("chat.window.session.id", {
        interpolate: { id: `${props.sessionId.slice(0, 5)}...` }
      })
    );
    const inputPlaceholder = computed(() => {
      if (props.messages.length > 0) {
        return locale.baseText("chat.window.chat.placeholder");
      }
      return locale.baseText("chat.window.chat.placeholderPristine");
    });
    function isTextMessage(message) {
      return message.type === "text" || !message.type;
    }
    function repostMessage(message) {
      void sendMessage(message.text);
    }
    function reuseMessage(message) {
      chatEventBus.emit("setInputValue", message.text);
    }
    function sendMessage(message) {
      previousMessageIndex.value = 0;
      emit("sendMessage", message);
    }
    function onRefreshSession() {
      emit("refreshSession");
    }
    function onArrowKeyDown({ currentInputValue, key }) {
      const pastMessages = props.pastChatMessages;
      const isCurrentInputEmptyOrMatch = currentInputValue.length === 0 || pastMessages.includes(currentInputValue);
      if (isCurrentInputEmptyOrMatch && (key === "ArrowUp" || key === "ArrowDown")) {
        if (pastMessages.length === 0) return;
        chatEventBus.emit("blurInput");
        if (pastMessages.length === 1) {
          previousMessageIndex.value = 0;
        } else {
          if (key === "ArrowUp") {
            if (currentInputValue.length === 0 && previousMessageIndex.value === 0) {
              previousMessageIndex.value = pastMessages.length - 1;
            } else {
              previousMessageIndex.value = previousMessageIndex.value === 0 ? pastMessages.length - 1 : previousMessageIndex.value - 1;
            }
          } else if (key === "ArrowDown") {
            previousMessageIndex.value = previousMessageIndex.value === pastMessages.length - 1 ? 0 : previousMessageIndex.value + 1;
          }
        }
        const selectedMessage = pastMessages[previousMessageIndex.value];
        chatEventBus.emit("setInputValue", selectedMessage);
        chatEventBus.emit("focusInput");
      }
      if (!isCurrentInputEmptyOrMatch) {
        previousMessageIndex.value = 0;
      }
    }
    async function copySessionId() {
      await clipboard.copy(props.sessionId);
      toast.showMessage({
        title: locale.baseText("generic.copiedToClipboard"),
        message: "",
        type: "success"
      });
    }
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", {
        class: normalizeClass([_ctx.$style.chat, "ignore-key-press-canvas"]),
        "data-test-id": "workflow-lm-chat-dialog",
        tabindex: "0"
      }, [
        createVNode(LogsPanelHeader, {
          "data-test-id": "chat-header",
          title: unref(locale).baseText("chat.window.title"),
          onClick: _cache[0] || (_cache[0] = ($event) => emit("clickHeader"))
        }, {
          actions: withCtx(() => [
            unref(clipboard).isSupported && !_ctx.isReadOnly ? (openBlock(), createBlock(unref(N8nTooltip), { key: 0 }, {
              content: withCtx(() => [
                createTextVNode(toDisplayString(_ctx.sessionId) + " ", 1),
                _cache[3] || (_cache[3] = createBaseVNode("br", null, null, -1)),
                createTextVNode(" " + toDisplayString(unref(locale).baseText("chat.window.session.id.copy")), 1)
              ]),
              default: withCtx(() => [
                createVNode(unref(N8nButton), {
                  "data-test-id": "chat-session-id",
                  type: "secondary",
                  size: "mini",
                  class: normalizeClass(_ctx.$style.newHeaderButton),
                  onClick: withModifiers(copySessionId, ["stop"])
                }, {
                  default: withCtx(() => [
                    createTextVNode(toDisplayString(sessionIdText.value), 1)
                  ]),
                  _: 1
                }, 8, ["class"])
              ]),
              _: 1
            })) : createCommentVNode("", true),
            _ctx.messages.length > 0 && !_ctx.isReadOnly ? (openBlock(), createBlock(unref(N8nTooltip), {
              key: 1,
              content: unref(locale).baseText("chat.window.session.resetSession")
            }, {
              default: withCtx(() => [
                createVNode(unref(_sfc_main$l), {
                  class: normalizeClass(_ctx.$style.newHeaderButton),
                  "data-test-id": "refresh-session-button",
                  outline: "",
                  type: "secondary",
                  size: "small",
                  "icon-size": "medium",
                  icon: "undo",
                  title: unref(locale).baseText("chat.window.session.reset"),
                  onClick: withModifiers(onRefreshSession, ["stop"])
                }, null, 8, ["class", "title"])
              ]),
              _: 1
            }, 8, ["content"])) : createCommentVNode("", true)
          ]),
          _: 1
        }, 8, ["title"]),
        _ctx.isOpen ? (openBlock(), createElementBlock("main", {
          key: 0,
          class: normalizeClass(_ctx.$style.chatBody),
          "data-test-id": "canvas-chat-body"
        }, [
          createVNode(_sfc_main$8, {
            messages: _ctx.messages,
            class: normalizeClass(_ctx.$style.messages),
            "empty-text": unref(locale).baseText("chat.window.chat.emptyChatMessage.v2")
          }, {
            beforeMessage: withCtx(({ message }) => [
              !_ctx.isReadOnly && message.sender === "bot" && !message.id.includes("preload") ? (openBlock(), createBlock(MessageOptionTooltip, {
                key: 0,
                placement: "right",
                "data-test-id": "execution-id-tooltip"
              }, {
                default: withCtx(() => [
                  createTextVNode(toDisplayString(unref(locale).baseText("chat.window.chat.chatMessageOptions.executionId")) + ": ", 1),
                  createBaseVNode("a", {
                    href: "#",
                    onClick: ($event) => emit("displayExecution", message.id)
                  }, toDisplayString(message.id), 9, _hoisted_1)
                ]),
                _: 2
              }, 1024)) : createCommentVNode("", true),
              !_ctx.isReadOnly && isTextMessage(message) && message.sender === "user" ? (openBlock(), createBlock(MessageOptionAction, {
                key: 1,
                "data-test-id": "repost-message-button",
                icon: "redo",
                label: unref(locale).baseText("chat.window.chat.chatMessageOptions.repostMessage"),
                placement: "left",
                onClickOnce: ($event) => repostMessage(message)
              }, null, 8, ["label", "onClickOnce"])) : createCommentVNode("", true),
              !_ctx.isReadOnly && isTextMessage(message) && message.sender === "user" ? (openBlock(), createBlock(MessageOptionAction, {
                key: 2,
                "data-test-id": "reuse-message-button",
                icon: "copy",
                label: unref(locale).baseText("chat.window.chat.chatMessageOptions.reuseMessage"),
                placement: "left",
                onClick: ($event) => reuseMessage(message)
              }, null, 8, ["label", "onClick"])) : createCommentVNode("", true)
            ]),
            _: 1
          }, 8, ["messages", "class", "empty-text"])
        ], 2)) : createCommentVNode("", true),
        _ctx.isOpen ? (openBlock(), createElementBlock("div", {
          key: 1,
          class: normalizeClass(_ctx.$style.messagesInput)
        }, [
          createVNode(ChatInput, {
            "data-test-id": "lm-chat-inputs",
            placeholder: inputPlaceholder.value,
            onArrowKeyDown
          }, createSlots({ _: 2 }, [
            _ctx.pastChatMessages.length > 0 ? {
              name: "leftPanel",
              fn: withCtx(() => [
                createBaseVNode("div", {
                  class: normalizeClass(_ctx.$style.messagesHistory)
                }, [
                  createVNode(unref(N8nButton), {
                    title: "Navigate to previous message",
                    icon: "chevron-up",
                    type: "tertiary",
                    text: "",
                    size: "mini",
                    onClick: _cache[1] || (_cache[1] = ($event) => onArrowKeyDown({ currentInputValue: "", key: "ArrowUp" }))
                  }),
                  createVNode(unref(N8nButton), {
                    title: "Navigate to next message",
                    icon: "chevron-down",
                    type: "tertiary",
                    text: "",
                    size: "mini",
                    onClick: _cache[2] || (_cache[2] = ($event) => onArrowKeyDown({ currentInputValue: "", key: "ArrowDown" }))
                  })
                ], 2)
              ]),
              key: "0"
            } : void 0
          ]), 1032, ["placeholder"])
        ], 2)) : createCommentVNode("", true)
      ], 2);
    };
  }
});
const chat$1 = "_chat_1r0jy_123";
const chatHeader = "_chatHeader_1r0jy_148";
const chatTitle = "_chatTitle_1r0jy_161";
const session = "_session_1r0jy_165";
const sessionId = "_sessionId_1r0jy_173";
const copyable = "_copyable_1r0jy_179";
const headerButton = "_headerButton_1r0jy_183";
const newHeaderButton = "_newHeaderButton_1r0jy_188";
const chatBody = "_chatBody_1r0jy_193";
const messages = "_messages_1r0jy_202";
const messagesInput = "_messagesInput_1r0jy_213";
const style0$4 = {
  chat: chat$1,
  chatHeader,
  chatTitle,
  session,
  sessionId,
  copyable,
  headerButton,
  newHeaderButton,
  chatBody,
  messages,
  messagesInput
};
const cssModules$4 = {
  "$style": style0$4
};
const ChatMessagesPanel = /* @__PURE__ */ _export_sfc(_sfc_main$5, [["__cssModules", cssModules$4]]);
const _sfc_main$4 = /* @__PURE__ */ defineComponent({
  __name: "LogsViewRunData",
  props: {
    title: {},
    paneType: {},
    logEntry: {}
  },
  setup(__props) {
    const locale = useI18n$1();
    const ndvStore = useNDVStore();
    const pipWindow = inject(PiPWindowSymbol, ref());
    const displayMode = ref(__props.paneType === "input" ? "schema" : "table");
    const isMultipleInput = computed(
      () => __props.paneType === "input" && (__props.logEntry.runData?.source.length ?? 0) > 1
    );
    const runDataProps = computed(() => {
      if (__props.logEntry.depth > 0 || __props.paneType === "output") {
        return { node: __props.logEntry.node, runIndex: __props.logEntry.runIndex };
      }
      const source = __props.logEntry.runData?.source[0];
      const node = source && __props.logEntry.workflow.getNode(source.previousNode);
      if (!source || !node) {
        return void 0;
      }
      return {
        node: {
          ...node,
          disabled: false
          // For RunData component to render data from disabled nodes as well
        },
        runIndex: source.previousNodeRun ?? 0,
        overrideOutputs: [source.previousNodeOutput ?? 0]
      };
    });
    const isExecuting = computed(
      () => __props.paneType === "output" && (__props.logEntry.runData?.executionStatus === "running" || __props.logEntry.runData?.executionStatus === "waiting")
    );
    function handleClickOpenNdv() {
      ndvStore.setActiveNodeName(__props.logEntry.node.name);
    }
    function handleChangeDisplayMode(value) {
      displayMode.value = value;
    }
    return (_ctx, _cache) => {
      const _directive_n8n_html = resolveDirective("n8n-html");
      return runDataProps.value ? (openBlock(), createBlock(RunData, mergeProps({ key: 0 }, runDataProps.value, {
        key: `run-data${unref(pipWindow) ? "-pip" : ""}`,
        workflow: _ctx.logEntry.workflow,
        "workflow-execution": _ctx.logEntry.execution,
        "too-much-data-title": unref(locale).baseText("ndv.output.tooMuchData.title"),
        "no-data-in-branch-message": unref(locale).baseText("ndv.output.noOutputDataInBranch"),
        "executing-message": unref(locale).baseText("ndv.output.executing"),
        "pane-type": _ctx.paneType,
        "disable-run-index-selection": true,
        compact: true,
        "disable-pin": true,
        "disable-edit": true,
        "disable-hover-highlight": true,
        "display-mode": displayMode.value,
        "disable-ai-content": _ctx.logEntry.depth === 0,
        "is-executing": isExecuting.value,
        "table-header-bg-color": "light",
        onDisplayModeChange: handleChangeDisplayMode
      }), createSlots({
        header: withCtx(() => [
          createVNode(unref(N8nText), {
            class: normalizeClass(_ctx.$style.title),
            bold: true,
            color: "text-light",
            size: "small"
          }, {
            default: withCtx(() => [
              createTextVNode(toDisplayString(_ctx.title), 1)
            ]),
            _: 1
          }, 8, ["class"])
        ]),
        "no-output-data": withCtx(() => [
          createVNode(unref(N8nText), {
            bold: true,
            color: "text-dark",
            size: "large"
          }, {
            default: withCtx(() => [
              createTextVNode(toDisplayString(unref(locale).baseText("ndv.output.noOutputData.title")), 1)
            ]),
            _: 1
          })
        ]),
        "node-waiting": withCtx(() => [
          createVNode(unref(N8nText), {
            bold: true,
            color: "text-dark",
            size: "large"
          }, {
            default: withCtx(() => [
              createTextVNode(toDisplayString(unref(locale).baseText("ndv.output.waitNodeWaiting.title")), 1)
            ]),
            _: 1
          }),
          withDirectives(createVNode(unref(N8nText), null, null, 512), [
            [_directive_n8n_html, unref(waitingNodeTooltip)(_ctx.logEntry.node)]
          ])
        ]),
        _: 2
      }, [
        isMultipleInput.value ? {
          name: "content",
          fn: withCtx(() => []),
          key: "0"
        } : void 0,
        isMultipleInput.value ? {
          name: "callout-message",
          fn: withCtx(() => [
            createVNode(unref(I18nT), { keypath: "logs.details.body.multipleInputs" }, {
              button: withCtx(() => [
                createVNode(unref(N8nLink), {
                  size: "small",
                  onClick: handleClickOpenNdv
                }, {
                  default: withCtx(() => [
                    createTextVNode(toDisplayString(unref(locale).baseText("logs.details.body.multipleInputs.openingTheNode")), 1)
                  ]),
                  _: 1
                })
              ]),
              _: 1
            })
          ]),
          key: "1"
        } : void 0
      ]), 1040, ["workflow", "workflow-execution", "too-much-data-title", "no-data-in-branch-message", "executing-message", "pane-type", "display-mode", "disable-ai-content", "is-executing"])) : createCommentVNode("", true);
    };
  }
});
const title$1 = "_title_1ur7r_123";
const style0$3 = {
  title: title$1
};
const cssModules$3 = {
  "$style": style0$3
};
const LogsViewRunData = /* @__PURE__ */ _export_sfc(_sfc_main$4, [["__cssModules", cssModules$3]]);
function useResizablePanel(localStorageKey, {
  container: container2,
  defaultSize,
  snap = true,
  minSize = 0,
  maxSize = (size) => size,
  position = "left",
  allowCollapse,
  allowFullSize
}) {
  const containerSize = ref(0);
  const persistedSize = useLocalStorage(localStorageKey, -1, { writeDefaults: false });
  const isResizing = ref(false);
  const sizeOnResizeStart = ref();
  const minSizeValue = computed(() => resolveSize(minSize, containerSize.value));
  const maxSizeValue = computed(() => resolveSize(maxSize, containerSize.value));
  const constrainedSize = computed(() => {
    const sizeInPixels = persistedSize.value >= 0 && persistedSize.value <= 1 ? containerSize.value * persistedSize.value : -1;
    if (isResizing.value && allowCollapse && sizeInPixels < 30) {
      return 0;
    }
    if (isResizing.value && allowFullSize && sizeInPixels > containerSize.value - 30) {
      return containerSize.value;
    }
    const defaultSizeValue = resolveSize(defaultSize, containerSize.value);
    if (Number.isNaN(sizeInPixels) || !Number.isFinite(sizeInPixels) || sizeInPixels < 0) {
      return defaultSizeValue;
    }
    return Math.max(
      minSizeValue.value,
      Math.min(
        snap && Math.abs(defaultSizeValue - sizeInPixels) < 30 ? defaultSizeValue : sizeInPixels,
        maxSizeValue.value
      )
    );
  });
  function getSize(el) {
    return position === "bottom" ? el.height : el.width;
  }
  function getOffsetSize(el) {
    return position === "bottom" ? el.offsetHeight : el.offsetWidth;
  }
  function getValue(data) {
    return position === "bottom" ? data.y : data.x;
  }
  function resolveSize(getter, containerSizeValue) {
    return typeof getter === "number" ? getter : getter(containerSizeValue);
  }
  function onResize(data) {
    const containerRect = unref(container2)?.getBoundingClientRect();
    const newSizeInPixels = Math.max(
      0,
      position === "bottom" ? (containerRect ? getSize(containerRect) : 0) - getValue(data) : getValue(data) - (containerRect ? getValue(containerRect) : 0)
    );
    isResizing.value = true;
    persistedSize.value = newSizeInPixels / containerSize.value;
    if (sizeOnResizeStart.value === void 0) {
      sizeOnResizeStart.value = persistedSize.value;
    }
  }
  function onResizeEnd() {
    if (minSizeValue.value > 0 && constrainedSize.value <= 0 || maxSizeValue.value < containerSize.value && constrainedSize.value >= containerSize.value) {
      persistedSize.value = sizeOnResizeStart.value;
    }
    sizeOnResizeStart.value = void 0;
    isResizing.value = false;
  }
  watch(
    () => unref(container2),
    (el, _, onCleanUp) => {
      if (!el) {
        return;
      }
      const observer = new ResizeObserver(() => {
        containerSize.value = getOffsetSize(el);
      });
      observer.observe(el);
      containerSize.value = getOffsetSize(el);
      onCleanUp(() => observer.disconnect());
    },
    { immediate: true }
  );
  return {
    isResizing: computed(() => isResizing.value),
    isCollapsed: computed(() => isResizing.value && constrainedSize.value <= 0),
    isFullSize: computed(() => isResizing.value && constrainedSize.value >= containerSize.value),
    size: constrainedSize,
    onResize,
    onResizeEnd
  };
}
const MIN_IO_PANEL_WIDTH = 200;
const _sfc_main$3 = /* @__PURE__ */ defineComponent({
  __name: "LogDetailsPanel",
  props: {
    isOpen: { type: Boolean },
    logEntry: {},
    window: {},
    latestInfo: {},
    panels: {}
  },
  emits: ["clickHeader", "toggleInputOpen", "toggleOutputOpen"],
  setup(__props, { emit: __emit }) {
    const emit = __emit;
    const locale = useI18n$1();
    const nodeTypeStore = useNodeTypesStore();
    const type = computed(() => nodeTypeStore.getNodeType(__props.logEntry.node.type));
    const consumedTokens2 = computed(() => getSubtreeTotalConsumedTokens(__props.logEntry, false));
    const isTriggerNode = computed(() => type.value?.group.includes("trigger"));
    const container2 = useTemplateRef("container");
    const resizer = useResizablePanel("N8N_LOGS_INPUT_PANEL_WIDTH", {
      container: container2,
      defaultSize: (size) => size / 2,
      minSize: MIN_IO_PANEL_WIDTH,
      maxSize: (size) => size - MIN_IO_PANEL_WIDTH,
      allowCollapse: true,
      allowFullSize: true
    });
    const shouldResize = computed(() => __props.panels === LOG_DETAILS_PANEL_STATE.BOTH);
    function handleResizeEnd() {
      if (resizer.isCollapsed.value) {
        emit("toggleInputOpen", false);
      }
      if (resizer.isFullSize.value) {
        emit("toggleOutputOpen", false);
      }
      resizer.onResizeEnd();
    }
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", {
        ref_key: "container",
        ref: container2,
        class: normalizeClass(_ctx.$style.container),
        "data-test-id": "log-details"
      }, [
        createVNode(LogsPanelHeader, {
          "data-test-id": "log-details-header",
          class: normalizeClass(_ctx.$style.header),
          onClick: _cache[2] || (_cache[2] = ($event) => emit("clickHeader"))
        }, {
          title: withCtx(() => [
            createBaseVNode("div", {
              class: normalizeClass(_ctx.$style.title)
            }, [
              createVNode(_sfc_main$k, {
                "node-type": type.value,
                size: 16,
                class: normalizeClass(_ctx.$style.icon)
              }, null, 8, ["node-type", "class"]),
              createVNode(LogsViewNodeName, {
                "latest-name": _ctx.latestInfo?.name ?? _ctx.logEntry.node.name,
                name: _ctx.logEntry.node.name,
                "is-deleted": _ctx.latestInfo?.deleted ?? false
              }, null, 8, ["latest-name", "name", "is-deleted"]),
              _ctx.isOpen && _ctx.logEntry.runData !== void 0 ? (openBlock(), createBlock(LogsViewExecutionSummary, {
                key: 0,
                class: normalizeClass(_ctx.$style.executionSummary),
                status: _ctx.logEntry.runData.executionStatus ?? "unknown",
                "consumed-tokens": consumedTokens2.value,
                "start-time": _ctx.logEntry.runData.startTime,
                "time-took": _ctx.logEntry.runData.executionTime
              }, null, 8, ["class", "status", "consumed-tokens", "start-time", "time-took"])) : createCommentVNode("", true)
            ], 2)
          ]),
          actions: withCtx(() => [
            _ctx.isOpen && !isTriggerNode.value && !unref(isPlaceholderLog)(_ctx.logEntry) ? (openBlock(), createElementBlock("div", {
              key: 0,
              class: normalizeClass(_ctx.$style.actions)
            }, [
              createVNode(KeyboardShortcutTooltip, {
                label: unref(locale).baseText("generic.shortcutHint"),
                shortcut: { keys: ["i"] }
              }, {
                default: withCtx(() => [
                  createVNode(unref(N8nButton), {
                    size: "mini",
                    type: "secondary",
                    class: normalizeClass(_ctx.panels === unref(LOG_DETAILS_PANEL_STATE).OUTPUT ? "" : _ctx.$style.pressed),
                    onClick: _cache[0] || (_cache[0] = withModifiers(($event) => emit("toggleInputOpen"), ["stop"]))
                  }, {
                    default: withCtx(() => [
                      createTextVNode(toDisplayString(unref(locale).baseText("logs.details.header.actions.input")), 1)
                    ]),
                    _: 1
                  }, 8, ["class"])
                ]),
                _: 1
              }, 8, ["label"]),
              createVNode(KeyboardShortcutTooltip, {
                label: unref(locale).baseText("generic.shortcutHint"),
                shortcut: { keys: ["o"] }
              }, {
                default: withCtx(() => [
                  createVNode(unref(N8nButton), {
                    size: "mini",
                    type: "secondary",
                    class: normalizeClass(_ctx.panels === unref(LOG_DETAILS_PANEL_STATE).INPUT ? "" : _ctx.$style.pressed),
                    onClick: _cache[1] || (_cache[1] = withModifiers(($event) => emit("toggleOutputOpen"), ["stop"]))
                  }, {
                    default: withCtx(() => [
                      createTextVNode(toDisplayString(unref(locale).baseText("logs.details.header.actions.output")), 1)
                    ]),
                    _: 1
                  }, 8, ["class"])
                ]),
                _: 1
              }, 8, ["label"])
            ], 2)) : createCommentVNode("", true),
            renderSlot(_ctx.$slots, "actions")
          ]),
          _: 3
        }, 8, ["class"]),
        _ctx.isOpen ? (openBlock(), createElementBlock("div", {
          key: 0,
          class: normalizeClass(_ctx.$style.content),
          "data-test-id": "logs-details-body"
        }, [
          unref(isPlaceholderLog)(_ctx.logEntry) ? (openBlock(), createElementBlock("div", {
            key: 0,
            class: normalizeClass(_ctx.$style.placeholder)
          }, [
            createVNode(unref(N8nText), { color: "text-base" }, {
              default: withCtx(() => [
                createTextVNode(toDisplayString(unref(locale).baseText("ndv.output.runNodeHint")), 1)
              ]),
              _: 1
            })
          ], 2)) : (openBlock(), createElementBlock(Fragment, { key: 1 }, [
            !isTriggerNode.value && _ctx.panels !== unref(LOG_DETAILS_PANEL_STATE).OUTPUT ? (openBlock(), createBlock(unref(N8nResizeWrapper), {
              key: 0,
              class: normalizeClass({
                [_ctx.$style.inputResizer]: true,
                [_ctx.$style.collapsed]: unref(resizer).isCollapsed.value,
                [_ctx.$style.full]: unref(resizer).isFullSize.value
              }),
              width: unref(resizer).size.value,
              style: normalizeStyle(shouldResize.value ? { width: `${unref(resizer).size.value ?? 0}px` } : void 0),
              "supported-directions": ["right"],
              "is-resizing-enabled": shouldResize.value,
              window: _ctx.window,
              onResize: unref(resizer).onResize,
              onResizeend: handleResizeEnd
            }, {
              default: withCtx(() => [
                createVNode(LogsViewRunData, {
                  "data-test-id": "log-details-input",
                  "pane-type": "input",
                  title: unref(locale).baseText("logs.details.header.actions.input"),
                  "log-entry": _ctx.logEntry
                }, null, 8, ["title", "log-entry"])
              ]),
              _: 1
            }, 8, ["class", "width", "style", "is-resizing-enabled", "window", "onResize"])) : createCommentVNode("", true),
            isTriggerNode.value || _ctx.panels !== unref(LOG_DETAILS_PANEL_STATE).INPUT ? (openBlock(), createBlock(LogsViewRunData, {
              key: 1,
              "data-test-id": "log-details-output",
              "pane-type": "output",
              class: normalizeClass(_ctx.$style.outputPanel),
              title: unref(locale).baseText("logs.details.header.actions.output"),
              "log-entry": _ctx.logEntry
            }, null, 8, ["class", "title", "log-entry"])) : createCommentVNode("", true)
          ], 64))
        ], 2)) : createCommentVNode("", true)
      ], 2);
    };
  }
});
const container$2 = "_container_tdw6t_123";
const header = "_header_tdw6t_132";
const actions = "_actions_tdw6t_136";
const pressed = "_pressed_tdw6t_142";
const title = "_title_tdw6t_146";
const icon = "_icon_tdw6t_152";
const executionSummary = "_executionSummary_tdw6t_156";
const content = "_content_tdw6t_160";
const outputPanel = "_outputPanel_tdw6t_168";
const inputResizer = "_inputResizer_tdw6t_173";
const collapsed = "_collapsed_tdw6t_177";
const full = "_full_tdw6t_177";
const placeholder = "_placeholder_tdw6t_181";
const style0$2 = {
  container: container$2,
  header,
  actions,
  pressed,
  title,
  icon,
  executionSummary,
  content,
  outputPanel,
  inputResizer,
  collapsed,
  full,
  placeholder
};
const cssModules$2 = {
  "$style": style0$2
};
const LogsDetailsPanel = /* @__PURE__ */ _export_sfc(_sfc_main$3, [["__cssModules", cssModules$2]]);
const _sfc_main$2 = /* @__PURE__ */ defineComponent({
  __name: "LogsPanelActions",
  props: {
    isOpen: { type: Boolean },
    isSyncSelectionEnabled: { type: Boolean },
    showToggleButton: { type: Boolean },
    showPopOutButton: { type: Boolean }
  },
  emits: ["popOut", "toggleOpen", "toggleSyncSelection"],
  setup(__props, { emit: __emit }) {
    const emit = __emit;
    const appStyles = useStyles();
    const locales = useI18n$1();
    const tooltipZIndex = computed(() => appStyles.APP_Z_INDEXES.ASK_ASSISTANT_FLOATING_BUTTON + 100);
    const popOutButtonText = computed(() => locales.baseText("runData.panel.actions.popOut"));
    const toggleButtonText = computed(
      () => locales.baseText(__props.isOpen ? "runData.panel.actions.collapse" : "runData.panel.actions.open")
    );
    const menuItems = computed(() => [
      {
        id: "toggleSyncSelection",
        label: locales.baseText("runData.panel.actions.sync"),
        checked: __props.isSyncSelectionEnabled
      },
      ...__props.showPopOutButton ? [{ id: "popOut", label: popOutButtonText.value }] : []
    ]);
    function handleSelectMenuItem(selected2) {
      switch (selected2) {
        case "popOut":
          emit(selected2);
          return;
        case "toggleSyncSelection":
          emit(selected2);
          return;
      }
    }
    return (_ctx, _cache) => {
      const _component_N8nTooltip = resolveComponent("N8nTooltip");
      return openBlock(), createElementBlock("div", {
        class: normalizeClass(_ctx.$style.container)
      }, [
        !_ctx.isOpen && _ctx.showPopOutButton ? (openBlock(), createBlock(_component_N8nTooltip, {
          key: 0,
          "z-index": tooltipZIndex.value,
          content: popOutButtonText.value
        }, {
          default: withCtx(() => [
            createVNode(unref(_sfc_main$l), {
              icon: "pop-out",
              type: "tertiary",
              text: "",
              size: "small",
              "icon-size": "medium",
              "aria-label": popOutButtonText.value,
              onClick: _cache[0] || (_cache[0] = withModifiers(($event) => emit("popOut"), ["stop"]))
            }, null, 8, ["aria-label"])
          ]),
          _: 1
        }, 8, ["z-index", "content"])) : createCommentVNode("", true),
        _ctx.isOpen ? (openBlock(), createBlock(unref(N8nActionDropdown), {
          key: 1,
          "icon-size": "small",
          "activator-icon": "ellipsis-h",
          "activator-size": "small",
          items: menuItems.value,
          teleported: false,
          onSelect: handleSelectMenuItem
        }, null, 8, ["items"])) : createCommentVNode("", true),
        _ctx.showToggleButton ? (openBlock(), createBlock(KeyboardShortcutTooltip, {
          key: 2,
          label: unref(locales).baseText("generic.shortcutHint"),
          shortcut: { keys: ["l"] },
          "z-index": tooltipZIndex.value
        }, {
          default: withCtx(() => [
            createVNode(unref(_sfc_main$l), {
              type: "tertiary",
              text: "",
              size: "small",
              "icon-size": "medium",
              icon: _ctx.isOpen ? "chevron-down" : "chevron-up",
              "aria-label": toggleButtonText.value,
              onClick: _cache[1] || (_cache[1] = withModifiers(($event) => emit("toggleOpen"), ["stop"]))
            }, null, 8, ["icon", "aria-label"])
          ]),
          _: 1
        }, 8, ["label", "z-index"])) : createCommentVNode("", true)
      ], 2);
    };
  }
});
const container$1 = "_container_xdwf0_123";
const style0$1 = {
  container: container$1
};
const cssModules$1 = {
  "$style": style0$1
};
const LogsPanelActions = /* @__PURE__ */ _export_sfc(_sfc_main$2, [["__cssModules", cssModules$1]]);
function useLogsExecutionData() {
  const nodeHelpers = useNodeHelpers();
  const workflowsStore = useWorkflowsStore();
  const toast = useToast();
  const execData = ref();
  const subWorkflowExecData = ref({});
  const subWorkflows = ref({});
  const workflow = computed(
    () => execData.value ? new Workflow({
      ...execData.value?.workflowData,
      nodeTypes: workflowsStore.getNodeTypes()
    }) : void 0
  );
  const latestNodeNameById = computed(
    () => Object.values(workflow.value?.nodes ?? {}).reduce(
      (acc, node) => {
        const nodeInStore = workflowsStore.getNodeById(node.id);
        acc[node.id] = {
          deleted: !nodeInStore,
          disabled: nodeInStore?.disabled ?? false,
          name: nodeInStore?.name ?? node.name
        };
        return acc;
      },
      {}
    )
  );
  const hasChat = computed(
    () => [Object.values(workflow.value?.nodes ?? {}), workflowsStore.workflow.nodes].some(
      (nodes) => nodes.some(isChatNode)
    )
  );
  const entries = computed(() => {
    if (!execData.value?.data || !workflow.value) {
      return [];
    }
    return createLogTree(
      workflow.value,
      execData.value,
      subWorkflows.value,
      subWorkflowExecData.value
    );
  });
  const updateInterval = computed(() => (entries.value?.length ?? 0) > 10 ? 300 : 0);
  function resetExecutionData() {
    execData.value = void 0;
    workflowsStore.setWorkflowExecutionData(null);
    nodeHelpers.updateNodesExecutionIssues();
  }
  async function loadSubExecution(logEntry) {
    const locator = findSubExecutionLocator(logEntry);
    if (!execData.value?.data || locator === void 0) {
      return;
    }
    try {
      const subExecution = await workflowsStore.fetchExecutionDataById(locator.executionId);
      const data = subExecution?.data ? parse(subExecution.data) : void 0;
      if (!data || !subExecution) {
        throw Error("Data is missing");
      }
      subWorkflowExecData.value[locator.executionId] = data;
      subWorkflows.value[locator.workflowId] = new Workflow({
        ...subExecution.workflowData,
        nodeTypes: workflowsStore.getNodeTypes()
      });
    } catch (e) {
      toast.showError(e, "Unable to load sub execution");
    }
  }
  watch(
    // Fields that should trigger update
    [
      () => workflowsStore.workflowExecutionData?.id,
      () => workflowsStore.workflowExecutionData?.workflowData.id,
      () => workflowsStore.workflowExecutionData?.status,
      () => workflowsStore.workflowExecutionResultDataLastUpdate,
      () => workflowsStore.workflowExecutionStartedData
    ],
    useThrottleFn(
      ([executionId], [previousExecutionId]) => {
        execData.value = workflowsStore.workflowExecutionData === null ? void 0 : deepToRaw(
          mergeStartData(
            workflowsStore.workflowExecutionStartedData?.[1] ?? {},
            workflowsStore.workflowExecutionData
          )
        );
        if (executionId !== previousExecutionId) {
          subWorkflowExecData.value = {};
          subWorkflows.value = {};
        }
      },
      updateInterval,
      true,
      true
    ),
    { immediate: true }
  );
  return {
    execution: computed(() => execData.value),
    entries,
    hasChat,
    latestNodeNameById,
    resetExecutionData,
    loadSubExecution
  };
}
function useLogsSelection(execution, tree2, flatLogEntries, toggleExpand) {
  const telemetry = useTelemetry();
  const manualLogEntrySelection = ref({ type: "initial" });
  const selected2 = computed(() => findSelectedLogEntry(manualLogEntrySelection.value, tree2.value));
  const logsStore = useLogsStore();
  const uiStore = useUIStore();
  const canvasStore = useCanvasStore();
  function syncSelectionToCanvasIfEnabled(value) {
    if (!logsStore.isLogSelectionSyncedWithCanvas) {
      return;
    }
    canvasEventBus.emit("nodes:select", { ids: [value.node.id], panIntoView: true });
  }
  function select(value) {
    manualLogEntrySelection.value = value === void 0 ? { type: "none" } : { type: "selected", id: value.id };
    if (value) {
      syncSelectionToCanvasIfEnabled(value);
      telemetry.track("User selected node in log view", {
        node_type: value.node.type,
        node_id: value.node.id,
        execution_id: execution.value?.id,
        workflow_id: execution.value?.workflowData.id,
        subworkflow_depth: getDepth(value)
      });
    }
  }
  function selectPrev() {
    const entries = flatLogEntries.value;
    const prevEntry = selected2.value ? getEntryAtRelativeIndex(entries, selected2.value.id, -1) ?? entries[0] : entries[entries.length - 1];
    manualLogEntrySelection.value = { type: "selected", id: prevEntry.id };
    syncSelectionToCanvasIfEnabled(prevEntry);
  }
  function selectNext() {
    const entries = flatLogEntries.value;
    const nextEntry = selected2.value ? getEntryAtRelativeIndex(entries, selected2.value.id, 1) ?? entries[entries.length - 1] : entries[0];
    manualLogEntrySelection.value = { type: "selected", id: nextEntry.id };
    syncSelectionToCanvasIfEnabled(nextEntry);
  }
  watch(
    selected2,
    (sel) => {
      if (sel) {
        logsStore.setSubNodeSelected(isSubNodeLog(sel));
      }
    },
    { immediate: true }
  );
  watch(
    [() => uiStore.lastSelectedNode, () => logsStore.isLogSelectionSyncedWithCanvas],
    ([selectedOnCanvas, shouldSync]) => {
      if (!shouldSync || !selectedOnCanvas || canvasStore.hasRangeSelection || selected2.value?.node.name === selectedOnCanvas) {
        return;
      }
      const entry = findLogEntryRec((e) => e.node.name === selectedOnCanvas, tree2.value);
      if (!entry) {
        return;
      }
      manualLogEntrySelection.value = { type: "selected", id: entry.id };
      let parent = entry.parent;
      while (parent !== void 0) {
        toggleExpand(parent, true);
        parent = parent.parent;
      }
    },
    { immediate: true }
  );
  return { selected: selected2, select, selectPrev, selectNext };
}
function useLogsTreeExpand(entries) {
  const collapsedEntries = ref({});
  const flatLogEntries = computed(() => flattenLogEntries(entries.value, collapsedEntries.value));
  function toggleExpanded(treeNode, expand) {
    collapsedEntries.value[treeNode.id] = expand === void 0 ? !collapsedEntries.value[treeNode.id] : !expand;
  }
  return {
    flatLogEntries,
    toggleExpanded
  };
}
function isStyle(node) {
  return node instanceof HTMLStyleElement || node instanceof HTMLLinkElement && node.rel === "stylesheet";
}
function syncStyleMutations(destination, mutations) {
  const currentStyles = destination.document.head.querySelectorAll('style, link[rel="stylesheet"]');
  for (const mutation of mutations) {
    for (const node of mutation.addedNodes) {
      if (isStyle(node)) {
        destination.document.head.appendChild(node.cloneNode(true));
      }
    }
    for (const node of mutation.removedNodes) {
      if (isStyle(node)) {
        for (const found of currentStyles) {
          if (found.isEqualNode(node)) {
            found.remove();
          }
        }
      }
    }
  }
}
function usePiPWindow({
  container: container2,
  content: content2,
  initialHeight,
  initialWidth,
  shouldPopOut,
  onRequestClose
}) {
  const pipWindow = ref();
  const isUnmounting = ref(false);
  const canPopOut = computed(
    () => !!window.documentPictureInPicture && window.parent === window
  );
  const isPoppedOut = computed(() => !!pipWindow.value);
  const tooltipContainer = computed(
    () => isPoppedOut.value ? content2.value ?? void 0 : void 0
  );
  const uiStore = useUIStore();
  const observer = new MutationObserver((mutations) => {
    if (pipWindow.value) {
      syncStyleMutations(pipWindow.value, mutations);
    }
  });
  observer.observe(document.head, { childList: true, subtree: true });
  provide(PiPWindowSymbol, pipWindow);
  useProvideTooltipAppendTo(tooltipContainer);
  async function showPip() {
    if (!content2.value) {
      return;
    }
    pipWindow.value = pipWindow.value ?? await window.documentPictureInPicture?.requestWindow({
      width: initialWidth,
      height: initialHeight,
      disallowReturnToOpener: true
    });
    [...document.styleSheets].forEach((styleSheet) => {
      try {
        const cssRules = [...styleSheet.cssRules].map((rule) => rule.cssText).join("");
        const style = document.createElement("style");
        style.textContent = cssRules;
        pipWindow.value?.document.head.appendChild(style);
      } catch (e) {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.type = styleSheet.type;
        link.media = styleSheet.media;
        link.href = styleSheet.href;
        pipWindow.value?.document.head.appendChild(link);
      }
    });
    pipWindow.value?.document.body.append(content2.value);
    pipWindow.value?.addEventListener("pagehide", () => !isUnmounting.value && onRequestClose());
  }
  function hidePiP() {
    pipWindow.value?.close();
    pipWindow.value = void 0;
    if (content2.value) {
      container2.value?.appendChild(content2.value);
    }
  }
  watch(shouldPopOut, (value) => value ? requestAnimationFrame(showPip) : hidePiP(), {
    immediate: true
  });
  watch(
    [() => uiStore.appliedTheme, pipWindow],
    ([theme, pip]) => {
      if (pip) {
        applyThemeToBody(theme, pip);
      }
    },
    { immediate: true }
  );
  onScopeDispose(() => {
    observer.disconnect();
  });
  onBeforeUnmount(() => {
    isUnmounting.value = true;
    pipWindow.value?.close();
  });
  return { canPopOut, isPoppedOut, pipWindow };
}
function useLogsPanelLayout(pipContainer, pipContent2, container2, logsContainer2) {
  const logsStore = useLogsStore();
  const telemetry = useTelemetry();
  const resizer = useResizablePanel(LOCAL_STORAGE_PANEL_HEIGHT, {
    container: document.body,
    position: "bottom",
    snap: false,
    defaultSize: (size) => size * 0.3,
    minSize: 160,
    maxSize: (size) => size * 0.75,
    allowCollapse: true
  });
  const chatPanelResizer = useResizablePanel(LOCAL_STORAGE_PANEL_WIDTH, {
    container: container2,
    defaultSize: (size) => Math.min(800, size * 0.3),
    minSize: 240,
    maxSize: (size) => size * 0.8
  });
  const overviewPanelResizer = useResizablePanel(LOCAL_STORAGE_OVERVIEW_PANEL_WIDTH, {
    container: logsContainer2,
    defaultSize: (size) => Math.min(240, size * 0.2),
    minSize: 80,
    maxSize: 500,
    allowFullSize: true
  });
  const isOpen = computed(
    () => logsStore.isOpen ? !resizer.isCollapsed.value : resizer.isResizing.value && resizer.size.value > 0
  );
  const isCollapsingDetailsPanel = computed(() => overviewPanelResizer.isFullSize.value);
  const { canPopOut, isPoppedOut, pipWindow } = usePiPWindow({
    initialHeight: 400,
    initialWidth: window.document.body.offsetWidth * 0.8,
    container: pipContainer,
    content: pipContent2,
    shouldPopOut: computed(() => logsStore.state === LOGS_PANEL_STATE.FLOATING),
    onRequestClose: () => {
      if (!isOpen.value) {
        return;
      }
      telemetry.track("User toggled log view", { new_state: "attached" });
      logsStore.setPreferPoppedOut(false);
    }
  });
  function handleToggleOpen(open) {
    const wasOpen = logsStore.isOpen;
    if (open === wasOpen) {
      return;
    }
    logsStore.toggleOpen(open);
    telemetry.track("User toggled log view", {
      new_state: wasOpen ? "collapsed" : "attached"
    });
  }
  function handlePopOut() {
    telemetry.track("User toggled log view", { new_state: "floating" });
    logsStore.toggleOpen(true);
    logsStore.setPreferPoppedOut(true);
  }
  function handleResizeEnd() {
    if (!logsStore.isOpen && !resizer.isCollapsed.value) {
      handleToggleOpen(true);
    }
    if (resizer.isCollapsed.value) {
      handleToggleOpen(false);
    }
    resizer.onResizeEnd();
  }
  watch(
    [() => logsStore.state, resizer.size],
    ([state, height]) => {
      logsStore.setHeight(
        state === LOGS_PANEL_STATE.FLOATING ? 0 : state === LOGS_PANEL_STATE.ATTACHED ? height : 32
      );
    },
    { immediate: true }
  );
  return {
    height: resizer.size,
    chatPanelWidth: chatPanelResizer.size,
    overviewPanelWidth: overviewPanelResizer.size,
    canPopOut,
    isOpen,
    isCollapsingDetailsPanel,
    isPoppedOut,
    isOverviewPanelFullWidth: overviewPanelResizer.isFullSize,
    pipWindow,
    onToggleOpen: handleToggleOpen,
    onPopOut: handlePopOut,
    onResize: resizer.onResize,
    onResizeEnd: handleResizeEnd,
    onChatPanelResize: chatPanelResizer.onResize,
    onChatPanelResizeEnd: chatPanelResizer.onResizeEnd,
    onOverviewPanelResize: overviewPanelResizer.onResize,
    onOverviewPanelResizeEnd: overviewPanelResizer.onResizeEnd
  };
}
const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "LogsViewKeyboardEventListener",
  props: {
    keyMap: {},
    container: {}
  },
  setup(__props) {
    const pipWindow = inject(PiPWindowSymbol);
    const activeElement = useActiveElement({ window: pipWindow?.value });
    const isBlurred = computed(() => {
      if (pipWindow?.value) {
        return pipWindow.value.document.activeElement === null;
      }
      return !activeElement.value || !__props.container || !__props.container.contains(activeElement.value) && __props.container !== activeElement.value;
    });
    useKeybindings(
      toRef(() => __props.keyMap),
      { disabled: isBlurred }
    );
    return () => {
    };
  }
});
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "LogsPanel",
  props: {
    isReadOnly: { type: Boolean, default: false }
  },
  setup(__props) {
    const props = __props;
    const container2 = useTemplateRef("container");
    const logsContainer2 = useTemplateRef("logsContainer");
    const pipContainer = useTemplateRef("pipContainer");
    const pipContent2 = useTemplateRef("pipContent");
    const logsStore = useLogsStore();
    const ndvStore = useNDVStore();
    const {
      height,
      chatPanelWidth,
      overviewPanelWidth,
      canPopOut,
      isOpen,
      isPoppedOut,
      isCollapsingDetailsPanel,
      isOverviewPanelFullWidth,
      pipWindow,
      onResize,
      onResizeEnd,
      onToggleOpen,
      onPopOut,
      onChatPanelResize,
      onChatPanelResizeEnd,
      onOverviewPanelResize,
      onOverviewPanelResizeEnd
    } = useLogsPanelLayout(pipContainer, pipContent2, container2, logsContainer2);
    const {
      currentSessionId,
      messages: messages2,
      previousChatMessages,
      sendMessage,
      refreshSession,
      displayExecution
    } = useChatState(props.isReadOnly);
    const { entries, execution, hasChat, latestNodeNameById, resetExecutionData, loadSubExecution } = useLogsExecutionData();
    const { flatLogEntries, toggleExpanded } = useLogsTreeExpand(entries);
    const { selected: selected2, select, selectNext, selectPrev } = useLogsSelection(
      execution,
      entries,
      flatLogEntries,
      toggleExpanded
    );
    const isLogDetailsOpen = computed(() => isOpen.value && selected2.value !== void 0);
    const isLogDetailsVisuallyOpen = computed(
      () => isLogDetailsOpen.value && !isCollapsingDetailsPanel.value
    );
    const logsPanelActionsProps = computed(() => ({
      isOpen: isOpen.value,
      isSyncSelectionEnabled: logsStore.isLogSelectionSyncedWithCanvas,
      showToggleButton: !isPoppedOut.value,
      showPopOutButton: canPopOut.value && !isPoppedOut.value,
      onPopOut,
      onToggleOpen,
      onToggleSyncSelection: logsStore.toggleLogSelectionSync
    }));
    const keyMap = computed(() => ({
      j: selectNext,
      k: selectPrev,
      Escape: () => select(void 0),
      ArrowDown: selectNext,
      ArrowUp: selectPrev,
      Space: () => selected2.value && toggleExpanded(selected2.value),
      Enter: () => selected2.value && handleOpenNdv(selected2.value)
    }));
    function handleResizeOverviewPanelEnd() {
      if (isOverviewPanelFullWidth.value) {
        select(void 0);
      }
      onOverviewPanelResizeEnd();
    }
    function handleOpenNdv(treeNode) {
      ndvStore.setActiveNodeName(treeNode.node.name);
      void nextTick(() => {
        const source = treeNode.runData?.source[0];
        const inputBranch = source?.previousNodeOutput ?? 0;
        ndvEventBus.emit("updateInputNodeName", source?.previousNode);
        ndvEventBus.emit("setInputBranchIndex", inputBranch);
        ndvStore.setOutputRunIndex(treeNode.runIndex);
      });
    }
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", {
        ref_key: "pipContainer",
        ref: pipContainer
      }, [
        (openBlock(), createBlock(_sfc_main$1, {
          key: String(!!unref(pipWindow)),
          "key-map": keyMap.value,
          container: unref(container2)
        }, null, 8, ["key-map", "container"])),
        createBaseVNode("div", {
          ref_key: "pipContent",
          ref: pipContent2,
          class: normalizeClass(_ctx.$style.pipContent)
        }, [
          createVNode(unref(N8nResizeWrapper), {
            height: unref(height),
            "supported-directions": ["top"],
            "is-resizing-enabled": !unref(isPoppedOut),
            class: normalizeClass(_ctx.$style.resizeWrapper),
            style: normalizeStyle({ height: unref(isOpen) ? `${unref(height)}px` : "auto" }),
            onResize: unref(onResize),
            onResizeend: unref(onResizeEnd)
          }, {
            default: withCtx(() => [
              createBaseVNode("div", {
                ref_key: "container",
                ref: container2,
                class: normalizeClass(_ctx.$style.container),
                tabindex: "-1"
              }, [
                unref(hasChat) && (!props.isReadOnly || unref(messages2).length > 0) ? (openBlock(), createBlock(unref(N8nResizeWrapper), {
                  key: 0,
                  "supported-directions": ["right"],
                  "is-resizing-enabled": unref(isOpen),
                  width: unref(chatPanelWidth),
                  style: normalizeStyle({ width: `${unref(chatPanelWidth)}px` }),
                  class: normalizeClass(_ctx.$style.chat),
                  window: unref(pipWindow),
                  onResize: unref(onChatPanelResize),
                  onResizeend: unref(onChatPanelResizeEnd)
                }, {
                  default: withCtx(() => [
                    (openBlock(), createBlock(ChatMessagesPanel, {
                      key: `canvas-chat-${unref(currentSessionId)}${unref(isPoppedOut) ? "-pip" : ""}`,
                      "data-test-id": "canvas-chat",
                      "is-open": unref(isOpen),
                      "is-read-only": _ctx.isReadOnly,
                      messages: unref(messages2),
                      "session-id": unref(currentSessionId),
                      "past-chat-messages": unref(previousChatMessages),
                      "show-close-button": false,
                      "is-new-logs-enabled": true,
                      onClose: unref(onToggleOpen),
                      onRefreshSession: unref(refreshSession),
                      onDisplayExecution: unref(displayExecution),
                      onSendMessage: unref(sendMessage),
                      onClickHeader: _cache[0] || (_cache[0] = ($event) => unref(onToggleOpen)(true))
                    }, null, 8, ["is-open", "is-read-only", "messages", "session-id", "past-chat-messages", "onClose", "onRefreshSession", "onDisplayExecution", "onSendMessage"]))
                  ]),
                  _: 1
                }, 8, ["is-resizing-enabled", "width", "style", "class", "window", "onResize", "onResizeend"])) : createCommentVNode("", true),
                createBaseVNode("div", {
                  ref_key: "logsContainer",
                  ref: logsContainer2,
                  class: normalizeClass(_ctx.$style.logsContainer)
                }, [
                  createVNode(unref(N8nResizeWrapper), {
                    class: normalizeClass(_ctx.$style.overviewResizer),
                    width: unref(overviewPanelWidth),
                    style: normalizeStyle({ width: isLogDetailsVisuallyOpen.value ? `${unref(overviewPanelWidth)}px` : "" }),
                    "supported-directions": ["right"],
                    "is-resizing-enabled": isLogDetailsOpen.value,
                    window: unref(pipWindow),
                    onResize: unref(onOverviewPanelResize),
                    onResizeend: handleResizeOverviewPanelEnd
                  }, {
                    default: withCtx(() => [
                      (openBlock(), createBlock(LogsOverviewPanel, {
                        key: unref(execution)?.id ?? "",
                        class: normalizeClass(_ctx.$style.logsOverview),
                        "is-open": unref(isOpen),
                        "is-read-only": _ctx.isReadOnly,
                        "is-compact": isLogDetailsVisuallyOpen.value,
                        selected: unref(selected2),
                        execution: unref(execution),
                        entries: unref(entries),
                        "latest-node-info": unref(latestNodeNameById),
                        "flat-log-entries": unref(flatLogEntries),
                        onClickHeader: _cache[1] || (_cache[1] = ($event) => unref(onToggleOpen)(true)),
                        onSelect: unref(select),
                        onClearExecutionData: unref(resetExecutionData),
                        onToggleExpanded: unref(toggleExpanded),
                        onOpenNdv: handleOpenNdv,
                        onLoadSubExecution: unref(loadSubExecution)
                      }, {
                        actions: withCtx(() => [
                          !isLogDetailsVisuallyOpen.value ? (openBlock(), createBlock(LogsPanelActions, normalizeProps(mergeProps({ key: 0 }, logsPanelActionsProps.value)), null, 16)) : createCommentVNode("", true)
                        ]),
                        _: 1
                      }, 8, ["class", "is-open", "is-read-only", "is-compact", "selected", "execution", "entries", "latest-node-info", "flat-log-entries", "onSelect", "onClearExecutionData", "onToggleExpanded", "onLoadSubExecution"]))
                    ]),
                    _: 1
                  }, 8, ["class", "width", "style", "is-resizing-enabled", "window", "onResize"]),
                  isLogDetailsVisuallyOpen.value && unref(selected2) ? (openBlock(), createBlock(LogsDetailsPanel, {
                    key: 0,
                    class: normalizeClass(_ctx.$style.logDetails),
                    "is-open": unref(isOpen),
                    "log-entry": unref(selected2),
                    window: unref(pipWindow),
                    "latest-info": unref(latestNodeNameById)[unref(selected2).id],
                    panels: unref(logsStore).detailsState,
                    onClickHeader: _cache[2] || (_cache[2] = ($event) => unref(onToggleOpen)(true)),
                    onToggleInputOpen: unref(logsStore).toggleInputOpen,
                    onToggleOutputOpen: unref(logsStore).toggleOutputOpen
                  }, {
                    actions: withCtx(() => [
                      isLogDetailsVisuallyOpen.value ? (openBlock(), createBlock(LogsPanelActions, normalizeProps(mergeProps({ key: 0 }, logsPanelActionsProps.value)), null, 16)) : createCommentVNode("", true)
                    ]),
                    _: 1
                  }, 8, ["class", "is-open", "log-entry", "window", "latest-info", "panels", "onToggleInputOpen", "onToggleOutputOpen"])) : createCommentVNode("", true)
                ], 2)
              ], 2)
            ]),
            _: 1
          }, 8, ["height", "is-resizing-enabled", "class", "style", "onResize", "onResizeend"])
        ], 2)
      ], 512);
    };
  }
});
const resizeWrapper = "_resizeWrapper_19m2p_124";
const pipContent = "_pipContent_19m2p_129";
const container = "_container_19m2p_143";
const chat = "_chat_19m2p_152";
const logsContainer = "_logsContainer_19m2p_156";
const overviewResizer = "_overviewResizer_19m2p_166";
const logsOverview = "_logsOverview_19m2p_174";
const logsDetails = "_logsDetails_19m2p_178";
const style0 = {
  resizeWrapper,
  pipContent,
  container,
  chat,
  logsContainer,
  overviewResizer,
  logsOverview,
  logsDetails
};
const cssModules = {
  "$style": style0
};
const LogsPanel = /* @__PURE__ */ _export_sfc(_sfc_main, [["__cssModules", cssModules]]);
export {
  LogsPanel as default
};
