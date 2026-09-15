/// <reference types="../node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { ref } from 'vue';
import TenantFacilityView from './views/facility/TenantFacilityView.vue';
import PropertyFacilityView from './views/facility/PropertyFacilityView.vue';
const view = ref('tenant');
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.main, __VLS_intrinsics.main)({
    ...{ class: "page" },
});
/** @type {__VLS_StyleScopedClasses['page']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.section, __VLS_intrinsics.section)({
    ...{ class: "top-nav" },
});
/** @type {__VLS_StyleScopedClasses['top-nav']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "brand" },
});
/** @type {__VLS_StyleScopedClasses['brand']} */ ;
let __VLS_0;
/** @ts-ignore @type { | typeof __VLS_components.elRadioGroup | typeof __VLS_components.ElRadioGroup | typeof __VLS_components['el-radio-group'] | typeof __VLS_components.elRadioGroup | typeof __VLS_components.ElRadioGroup | typeof __VLS_components['el-radio-group']} */
elRadioGroup;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    modelValue: (__VLS_ctx.view),
    size: "large",
}));
const __VLS_2 = __VLS_1({
    modelValue: (__VLS_ctx.view),
    size: "large",
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
const { default: __VLS_5 } = __VLS_3.slots;
let __VLS_6;
/** @ts-ignore @type { | typeof __VLS_components.elRadioButton | typeof __VLS_components.ElRadioButton | typeof __VLS_components['el-radio-button'] | typeof __VLS_components.elRadioButton | typeof __VLS_components.ElRadioButton | typeof __VLS_components['el-radio-button']} */
elRadioButton;
// @ts-ignore
const __VLS_7 = __VLS_asFunctionalComponent1(__VLS_6, new __VLS_6({
    value: "tenant",
}));
const __VLS_8 = __VLS_7({
    value: "tenant",
}, ...__VLS_functionalComponentArgsRest(__VLS_7));
const { default: __VLS_11 } = __VLS_9.slots;
// @ts-ignore
[view,];
var __VLS_9;
let __VLS_12;
/** @ts-ignore @type { | typeof __VLS_components.elRadioButton | typeof __VLS_components.ElRadioButton | typeof __VLS_components['el-radio-button'] | typeof __VLS_components.elRadioButton | typeof __VLS_components.ElRadioButton | typeof __VLS_components['el-radio-button']} */
elRadioButton;
// @ts-ignore
const __VLS_13 = __VLS_asFunctionalComponent1(__VLS_12, new __VLS_12({
    value: "property",
}));
const __VLS_14 = __VLS_13({
    value: "property",
}, ...__VLS_functionalComponentArgsRest(__VLS_13));
const { default: __VLS_17 } = __VLS_15.slots;
// @ts-ignore
[];
var __VLS_15;
// @ts-ignore
[];
var __VLS_3;
if (__VLS_ctx.view === 'tenant') {
    const __VLS_18 = TenantFacilityView;
    // @ts-ignore
    const __VLS_19 = __VLS_asFunctionalComponent1(__VLS_18, new __VLS_18({}));
    const __VLS_20 = __VLS_19({}, ...__VLS_functionalComponentArgsRest(__VLS_19));
}
else {
    const __VLS_23 = PropertyFacilityView;
    // @ts-ignore
    const __VLS_24 = __VLS_asFunctionalComponent1(__VLS_23, new __VLS_23({}));
    const __VLS_25 = __VLS_24({}, ...__VLS_functionalComponentArgsRest(__VLS_24));
}
// @ts-ignore
[view,];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
