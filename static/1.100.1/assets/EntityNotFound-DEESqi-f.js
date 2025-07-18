import { d as defineComponent, i as createElementBlock, g as openBlock, j as createVNode, w as withCtx, k as createBaseVNode, m as unref, N as N8nHeading, l as createTextVNode, t as toDisplayString, c as useI18n, p as N8nText, q as N8nButton, s as N8nCard, _ as _export_sfc } from "./index-Cb_lQ9m_.js";
const _hoisted_1 = { class: "entity-not-found-view" };
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "EntityNotFound",
  props: {
    entityType: {}
  },
  setup(__props) {
    const locale = useI18n();
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", _hoisted_1, [
        createVNode(unref(N8nCard), {
          style: {},
          class: "entity-card"
        }, {
          default: withCtx(() => [
            _cache[0] || (_cache[0] = createBaseVNode("div", { class: "text-center mb-l" }, [
              createBaseVNode("svg", {
                xmlns: "http://www.w3.org/2000/svg",
                width: "24",
                height: "24",
                viewBox: "0 0 24 24",
                fill: "none"
              }, [
                createBaseVNode("circle", {
                  cx: "12",
                  cy: "12",
                  r: "10",
                  stroke: "var(--color-text-button-secondary-font)",
                  "stroke-width": "2"
                }),
                createBaseVNode("rect", {
                  x: "11",
                  y: "6",
                  width: "2",
                  height: "8",
                  fill: "var(--color-text-button-secondary-font)"
                }),
                createBaseVNode("rect", {
                  x: "11",
                  y: "16",
                  width: "2",
                  height: "2",
                  fill: "var(--color-text-button-secondary-font)"
                })
              ])
            ], -1)),
            createVNode(unref(N8nHeading), {
              size: "xlarge",
              align: "center",
              tag: "h2",
              color: "text-dark",
              class: "mb-2xs"
            }, {
              default: withCtx(() => [
                createTextVNode(toDisplayString(unref(locale).baseText("error.entityNotFound.title", {
                  interpolate: { entity: unref(locale).baseText(`generic.${_ctx.entityType}`) }
                })), 1)
              ]),
              _: 1
            }),
            createVNode(unref(N8nText), {
              color: "text-base",
              tag: "p",
              align: "center",
              class: "mb-m"
            }, {
              default: withCtx(() => [
                createTextVNode(toDisplayString(unref(locale).baseText("error.entityNotFound.text", {
                  interpolate: { entity: unref(locale).baseText(`generic.${_ctx.entityType}`).toLocaleLowerCase() }
                })), 1)
              ]),
              _: 1
            }),
            createVNode(unref(N8nButton), {
              href: "/",
              element: "a",
              type: "secondary"
            }, {
              default: withCtx(() => [
                createTextVNode(toDisplayString(unref(locale).baseText("error.entityNotFound.action")), 1)
              ]),
              _: 1
            })
          ]),
          _: 1
        })
      ]);
    };
  }
});
const EntityNotFound = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-30756e55"]]);
export {
  EntityNotFound as default
};
