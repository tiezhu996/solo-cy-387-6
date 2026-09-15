/// <reference types="../../node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../node_modules/@vue/language-core/types/props-fallback.d.ts" />
const __VLS_props = defineProps();
const __VLS_emit = defineEmits();
function statusTagType(status) {
    switch (status) {
        case '待核销':
            return 'warning';
        case '已核销':
            return 'primary';
        case '已完成':
            return 'success';
        case '已取消':
            return 'info';
        case '爽约':
            return 'danger';
    }
}
function hasTimestamp(row) {
    return Boolean(row.checkedInAt || row.finishedAt || row.cancelledAt || row.noShowAt);
}
function formatTime(value) {
    const date = new Date(value);
    const pad = (n) => String(n).padStart(2, '0');
    return `${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}
const __VLS_ctx = {
    ...{},
    ...{},
    ...{},
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
let __VLS_0;
/** @ts-ignore @type { | typeof __VLS_components.elTable | typeof __VLS_components.ElTable | typeof __VLS_components['el-table'] | typeof __VLS_components.elTable | typeof __VLS_components.ElTable | typeof __VLS_components['el-table']} */
elTable;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    data: (__VLS_ctx.reservations),
    size: "small",
    emptyText: "暂无预约记录",
}));
const __VLS_2 = __VLS_1({
    data: (__VLS_ctx.reservations),
    size: "small",
    emptyText: "暂无预约记录",
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
var __VLS_5;
const { default: __VLS_6 } = __VLS_3.slots;
let __VLS_7;
/** @ts-ignore @type { | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components['el-table-column'] | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components['el-table-column']} */
elTableColumn;
// @ts-ignore
const __VLS_8 = __VLS_asFunctionalComponent1(__VLS_7, new __VLS_7({
    prop: "voucherCode",
    label: "核销凭证",
    width: "140",
}));
const __VLS_9 = __VLS_8({
    prop: "voucherCode",
    label: "核销凭证",
    width: "140",
}, ...__VLS_functionalComponentArgsRest(__VLS_8));
const { default: __VLS_12 } = __VLS_10.slots;
{
    const { default: __VLS_13 } = __VLS_10.slots;
    const [{ row }] = __VLS_vSlot(__VLS_13);
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
        ...{ class: "voucher" },
    });
    /** @type {__VLS_StyleScopedClasses['voucher']} */ ;
    (row.voucherCode);
    // @ts-ignore
    [reservations,];
}
// @ts-ignore
[];
var __VLS_10;
let __VLS_14;
/** @ts-ignore @type { | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components['el-table-column']} */
elTableColumn;
// @ts-ignore
const __VLS_15 = __VLS_asFunctionalComponent1(__VLS_14, new __VLS_14({
    prop: "facilityName",
    label: "设施",
    width: "110",
}));
const __VLS_16 = __VLS_15({
    prop: "facilityName",
    label: "设施",
    width: "110",
}, ...__VLS_functionalComponentArgsRest(__VLS_15));
let __VLS_19;
/** @ts-ignore @type { | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components['el-table-column'] | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components['el-table-column']} */
elTableColumn;
// @ts-ignore
const __VLS_20 = __VLS_asFunctionalComponent1(__VLS_19, new __VLS_19({
    label: "时段",
    width: "200",
}));
const __VLS_21 = __VLS_20({
    label: "时段",
    width: "200",
}, ...__VLS_functionalComponentArgsRest(__VLS_20));
const { default: __VLS_24 } = __VLS_22.slots;
{
    const { default: __VLS_25 } = __VLS_22.slots;
    const [{ row }] = __VLS_vSlot(__VLS_25);
    (row.date);
    (row.startTime);
    (row.endTime);
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_22;
if (!__VLS_ctx.hideTenant) {
    let __VLS_26;
    /** @ts-ignore @type { | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components['el-table-column'] | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components['el-table-column']} */
    elTableColumn;
    // @ts-ignore
    const __VLS_27 = __VLS_asFunctionalComponent1(__VLS_26, new __VLS_26({
        label: "租客",
        width: "150",
    }));
    const __VLS_28 = __VLS_27({
        label: "租客",
        width: "150",
    }, ...__VLS_functionalComponentArgsRest(__VLS_27));
    const { default: __VLS_31 } = __VLS_29.slots;
    {
        const { default: __VLS_32 } = __VLS_29.slots;
        const [{ row }] = __VLS_vSlot(__VLS_32);
        (row.tenantName);
        (row.tenantPhone);
        // @ts-ignore
        [hideTenant,];
    }
    // @ts-ignore
    [];
    var __VLS_29;
}
let __VLS_33;
/** @ts-ignore @type { | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components['el-table-column'] | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components['el-table-column']} */
elTableColumn;
// @ts-ignore
const __VLS_34 = __VLS_asFunctionalComponent1(__VLS_33, new __VLS_33({
    label: "状态",
    width: "90",
}));
const __VLS_35 = __VLS_34({
    label: "状态",
    width: "90",
}, ...__VLS_functionalComponentArgsRest(__VLS_34));
const { default: __VLS_38 } = __VLS_36.slots;
{
    const { default: __VLS_39 } = __VLS_36.slots;
    const [{ row }] = __VLS_vSlot(__VLS_39);
    let __VLS_40;
    /** @ts-ignore @type { | typeof __VLS_components.elTag | typeof __VLS_components.ElTag | typeof __VLS_components['el-tag'] | typeof __VLS_components.elTag | typeof __VLS_components.ElTag | typeof __VLS_components['el-tag']} */
    elTag;
    // @ts-ignore
    const __VLS_41 = __VLS_asFunctionalComponent1(__VLS_40, new __VLS_40({
        type: (__VLS_ctx.statusTagType(row.status)),
        size: "small",
    }));
    const __VLS_42 = __VLS_41({
        type: (__VLS_ctx.statusTagType(row.status)),
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_41));
    const { default: __VLS_45 } = __VLS_43.slots;
    (row.status);
    // @ts-ignore
    [statusTagType,];
    var __VLS_43;
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_36;
let __VLS_46;
/** @ts-ignore @type { | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components['el-table-column'] | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components['el-table-column']} */
elTableColumn;
// @ts-ignore
const __VLS_47 = __VLS_asFunctionalComponent1(__VLS_46, new __VLS_46({
    label: "时间记录",
    minWidth: "230",
}));
const __VLS_48 = __VLS_47({
    label: "时间记录",
    minWidth: "230",
}, ...__VLS_functionalComponentArgsRest(__VLS_47));
const { default: __VLS_51 } = __VLS_49.slots;
{
    const { default: __VLS_52 } = __VLS_49.slots;
    const [{ row }] = __VLS_vSlot(__VLS_52);
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "times" },
    });
    /** @type {__VLS_StyleScopedClasses['times']} */ ;
    if (row.checkedInAt) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
        (__VLS_ctx.formatTime(row.checkedInAt));
    }
    if (row.finishedAt) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
        (__VLS_ctx.formatTime(row.finishedAt));
    }
    if (row.cancelledAt) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
        (__VLS_ctx.formatTime(row.cancelledAt));
    }
    if (row.noShowAt) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
        (__VLS_ctx.formatTime(row.noShowAt));
    }
    if (!__VLS_ctx.hasTimestamp(row)) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
            ...{ class: "hint" },
        });
        /** @type {__VLS_StyleScopedClasses['hint']} */ ;
    }
    // @ts-ignore
    [formatTime, formatTime, formatTime, formatTime, hasTimestamp,];
}
// @ts-ignore
[];
var __VLS_49;
if (__VLS_ctx.$slots.actions || __VLS_ctx.showCancel) {
    let __VLS_53;
    /** @ts-ignore @type { | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components['el-table-column'] | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components['el-table-column']} */
    elTableColumn;
    // @ts-ignore
    const __VLS_54 = __VLS_asFunctionalComponent1(__VLS_53, new __VLS_53({
        label: "操作",
        width: "150",
        fixed: "right",
    }));
    const __VLS_55 = __VLS_54({
        label: "操作",
        width: "150",
        fixed: "right",
    }, ...__VLS_functionalComponentArgsRest(__VLS_54));
    const { default: __VLS_58 } = __VLS_56.slots;
    {
        const { default: __VLS_59 } = __VLS_56.slots;
        const [{ row }] = __VLS_vSlot(__VLS_59);
        var __VLS_60 = {
            row: (row),
        };
        if (__VLS_ctx.showCancel && row.status === '待核销') {
            let __VLS_62;
            /** @ts-ignore @type { | typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components['el-button'] | typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components['el-button']} */
            elButton;
            // @ts-ignore
            const __VLS_63 = __VLS_asFunctionalComponent1(__VLS_62, new __VLS_62({
                ...{ 'onClick': {} },
                size: "small",
                type: "warning",
            }));
            const __VLS_64 = __VLS_63({
                ...{ 'onClick': {} },
                size: "small",
                type: "warning",
            }, ...__VLS_functionalComponentArgsRest(__VLS_63));
            let __VLS_67;
            const __VLS_68 = {
                /** @type {typeof __VLS_67.click} */
                onClick: (...[$event]) => {
                    if (!(__VLS_ctx.$slots.actions || __VLS_ctx.showCancel))
                        throw 0;
                    if (!(__VLS_ctx.showCancel && row.status === '待核销'))
                        throw 0;
                    return (__VLS_ctx.$emit('cancel', row));
                    // @ts-ignore
                    [$slots, showCancel, showCancel, $emit,];
                },
            };
            const { default: __VLS_69 } = __VLS_65.slots;
            // @ts-ignore
            [];
            var __VLS_65;
            var __VLS_66;
        }
        // @ts-ignore
        [];
    }
    // @ts-ignore
    [];
    var __VLS_56;
}
// @ts-ignore
[];
var __VLS_3;
// @ts-ignore
var __VLS_61 = __VLS_60;
// @ts-ignore
[];
const __VLS_base = (await import('vue')).defineComponent({
    __typeEmits: {},
    __typeProps: {},
});
const __VLS_export = {};
export default {};
