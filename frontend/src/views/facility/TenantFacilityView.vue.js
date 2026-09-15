/// <reference types="../../../node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { onMounted, ref } from 'vue';
import { ElMessage } from 'element-plus';
import { cancelReservation, createReservation, listFacilities, listReservations, listSlots, } from '../../api/facility';
import { profileStore } from '../../utils/storage';
import ReservationTable from '../../components/ReservationTable.vue';
const facilities = ref([]);
const slots = ref([]);
const myReservations = ref([]);
const facilityFilter = ref();
const dateFilter = ref('');
const loadingSlots = ref(false);
const profile = ref(profileStore.load());
function saveProfile() {
    if (!profile.value.name || !profile.value.phone) {
        ElMessage.warning('请先填写姓名和手机号');
        return;
    }
    profileStore.save(profile.value);
    ElMessage.success('身份已记住');
    loadMyReservations();
}
function facilityLocation(id) {
    return facilities.value.find((f) => f.id === id)?.location ?? '-';
}
function slotTagType(status) {
    if (status === '可预约')
        return 'success';
    if (status === '已约满')
        return 'danger';
    return 'info';
}
async function loadSlots() {
    loadingSlots.value = true;
    try {
        slots.value = await listSlots({ facilityId: facilityFilter.value, date: dateFilter.value });
    }
    catch (error) {
        ElMessage.error(error.message);
    }
    finally {
        loadingSlots.value = false;
    }
}
async function loadMyReservations() {
    if (!profile.value.phone) {
        myReservations.value = [];
        return;
    }
    try {
        myReservations.value = await listReservations({ tenantPhone: profile.value.phone });
    }
    catch (error) {
        ElMessage.error(error.message);
    }
}
async function book(slot) {
    if (!profile.value.name || !profile.value.phone) {
        ElMessage.warning('请先在上方填写租客姓名和手机号');
        return;
    }
    try {
        const reservation = await createReservation({
            slotId: slot.id,
            tenantName: profile.value.name,
            tenantPhone: profile.value.phone,
        });
        ElMessage.success(`预约成功，核销凭证：${reservation.voucherCode}`);
        await Promise.all([loadSlots(), loadMyReservations()]);
    }
    catch (error) {
        ElMessage.error(error.message);
    }
}
async function onCancel(reservation) {
    try {
        await cancelReservation(reservation.id, profile.value.phone);
        ElMessage.success('预约已取消，时段已释放');
        await Promise.all([loadSlots(), loadMyReservations()]);
    }
    catch (error) {
        ElMessage.error(error.message);
    }
}
onMounted(async () => {
    facilities.value = await listFacilities(false);
    await Promise.all([loadSlots(), loadMyReservations()]);
});
const __VLS_ctx = {
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
__VLS_asFunctionalElement1(__VLS_intrinsics.section, __VLS_intrinsics.section)({
    ...{ class: "facility-panel" },
});
/** @type {__VLS_StyleScopedClasses['facility-panel']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.h2, __VLS_intrinsics.h2)({});
let __VLS_0;
/** @ts-ignore @type { | typeof __VLS_components.elCard | typeof __VLS_components.ElCard | typeof __VLS_components['el-card'] | typeof __VLS_components.elCard | typeof __VLS_components.ElCard | typeof __VLS_components['el-card']} */
elCard;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    shadow: "never",
    ...{ class: "block" },
}));
const __VLS_2 = __VLS_1({
    shadow: "never",
    ...{ class: "block" },
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
/** @type {__VLS_StyleScopedClasses['block']} */ ;
const { default: __VLS_5 } = __VLS_3.slots;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "identity" },
});
/** @type {__VLS_StyleScopedClasses['identity']} */ ;
let __VLS_6;
/** @ts-ignore @type { | typeof __VLS_components.elInput | typeof __VLS_components.ElInput | typeof __VLS_components['el-input']} */
elInput;
// @ts-ignore
const __VLS_7 = __VLS_asFunctionalComponent1(__VLS_6, new __VLS_6({
    modelValue: (__VLS_ctx.profile.name),
    placeholder: "租客姓名",
    ...{ style: {} },
}));
const __VLS_8 = __VLS_7({
    modelValue: (__VLS_ctx.profile.name),
    placeholder: "租客姓名",
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_7));
let __VLS_11;
/** @ts-ignore @type { | typeof __VLS_components.elInput | typeof __VLS_components.ElInput | typeof __VLS_components['el-input']} */
elInput;
// @ts-ignore
const __VLS_12 = __VLS_asFunctionalComponent1(__VLS_11, new __VLS_11({
    modelValue: (__VLS_ctx.profile.phone),
    placeholder: "手机号（用于查询我的预约）",
    ...{ style: {} },
}));
const __VLS_13 = __VLS_12({
    modelValue: (__VLS_ctx.profile.phone),
    placeholder: "手机号（用于查询我的预约）",
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_12));
let __VLS_16;
/** @ts-ignore @type { | typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components['el-button'] | typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components['el-button']} */
elButton;
// @ts-ignore
const __VLS_17 = __VLS_asFunctionalComponent1(__VLS_16, new __VLS_16({
    ...{ 'onClick': {} },
}));
const __VLS_18 = __VLS_17({
    ...{ 'onClick': {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_17));
let __VLS_21;
const __VLS_22 = {
    /** @type {typeof __VLS_21.click} */
    onClick: (__VLS_ctx.saveProfile),
};
const { default: __VLS_23 } = __VLS_19.slots;
// @ts-ignore
[profile, profile, saveProfile,];
var __VLS_19;
var __VLS_20;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "hint" },
});
/** @type {__VLS_StyleScopedClasses['hint']} */ ;
// @ts-ignore
[];
var __VLS_3;
let __VLS_24;
/** @ts-ignore @type { | typeof __VLS_components.elCard | typeof __VLS_components.ElCard | typeof __VLS_components['el-card'] | typeof __VLS_components.elCard | typeof __VLS_components.ElCard | typeof __VLS_components['el-card']} */
elCard;
// @ts-ignore
const __VLS_25 = __VLS_asFunctionalComponent1(__VLS_24, new __VLS_24({
    shadow: "never",
    ...{ class: "block" },
}));
const __VLS_26 = __VLS_25({
    shadow: "never",
    ...{ class: "block" },
}, ...__VLS_functionalComponentArgsRest(__VLS_25));
/** @type {__VLS_StyleScopedClasses['block']} */ ;
const { default: __VLS_29 } = __VLS_27.slots;
{
    const { header: __VLS_30 } = __VLS_27.slots;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "card-head" },
    });
    /** @type {__VLS_StyleScopedClasses['card-head']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "filters" },
    });
    /** @type {__VLS_StyleScopedClasses['filters']} */ ;
    let __VLS_31;
    /** @ts-ignore @type { | typeof __VLS_components.elSelect | typeof __VLS_components.ElSelect | typeof __VLS_components['el-select'] | typeof __VLS_components.elSelect | typeof __VLS_components.ElSelect | typeof __VLS_components['el-select']} */
    elSelect;
    // @ts-ignore
    const __VLS_32 = __VLS_asFunctionalComponent1(__VLS_31, new __VLS_31({
        modelValue: (__VLS_ctx.facilityFilter),
        placeholder: "全部设施",
        clearable: true,
        ...{ style: {} },
    }));
    const __VLS_33 = __VLS_32({
        modelValue: (__VLS_ctx.facilityFilter),
        placeholder: "全部设施",
        clearable: true,
        ...{ style: {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_32));
    const { default: __VLS_36 } = __VLS_34.slots;
    for (const [f] of __VLS_vFor((__VLS_ctx.facilities))) {
        let __VLS_37;
        /** @ts-ignore @type { | typeof __VLS_components.elOption | typeof __VLS_components.ElOption | typeof __VLS_components['el-option']} */
        elOption;
        // @ts-ignore
        const __VLS_38 = __VLS_asFunctionalComponent1(__VLS_37, new __VLS_37({
            key: (f.id),
            label: (f.name),
            value: (f.id),
        }));
        const __VLS_39 = __VLS_38({
            key: (f.id),
            label: (f.name),
            value: (f.id),
        }, ...__VLS_functionalComponentArgsRest(__VLS_38));
        // @ts-ignore
        [facilityFilter, facilities,];
    }
    // @ts-ignore
    [];
    var __VLS_34;
    let __VLS_42;
    /** @ts-ignore @type { | typeof __VLS_components.elDatePicker | typeof __VLS_components.ElDatePicker | typeof __VLS_components['el-date-picker']} */
    elDatePicker;
    // @ts-ignore
    const __VLS_43 = __VLS_asFunctionalComponent1(__VLS_42, new __VLS_42({
        modelValue: (__VLS_ctx.dateFilter),
        type: "date",
        valueFormat: "YYYY-MM-DD",
        placeholder: "选择日期",
        clearable: true,
        ...{ style: {} },
    }));
    const __VLS_44 = __VLS_43({
        modelValue: (__VLS_ctx.dateFilter),
        type: "date",
        valueFormat: "YYYY-MM-DD",
        placeholder: "选择日期",
        clearable: true,
        ...{ style: {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_43));
    let __VLS_47;
    /** @ts-ignore @type { | typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components['el-button'] | typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components['el-button']} */
    elButton;
    // @ts-ignore
    const __VLS_48 = __VLS_asFunctionalComponent1(__VLS_47, new __VLS_47({
        ...{ 'onClick': {} },
    }));
    const __VLS_49 = __VLS_48({
        ...{ 'onClick': {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_48));
    let __VLS_52;
    const __VLS_53 = {
        /** @type {typeof __VLS_52.click} */
        onClick: (__VLS_ctx.loadSlots),
    };
    const { default: __VLS_54 } = __VLS_50.slots;
    // @ts-ignore
    [dateFilter, loadSlots,];
    var __VLS_50;
    var __VLS_51;
    // @ts-ignore
    [];
}
let __VLS_55;
/** @ts-ignore @type { | typeof __VLS_components.elTable | typeof __VLS_components.ElTable | typeof __VLS_components['el-table'] | typeof __VLS_components.elTable | typeof __VLS_components.ElTable | typeof __VLS_components['el-table']} */
elTable;
// @ts-ignore
const __VLS_56 = __VLS_asFunctionalComponent1(__VLS_55, new __VLS_55({
    data: (__VLS_ctx.slots),
    size: "small",
    emptyText: "暂无可预约时段",
}));
const __VLS_57 = __VLS_56({
    data: (__VLS_ctx.slots),
    size: "small",
    emptyText: "暂无可预约时段",
}, ...__VLS_functionalComponentArgsRest(__VLS_56));
__VLS_asFunctionalDirective(__VLS_directives.vLoading, {})(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.loadingSlots), }, null, null);
const { default: __VLS_60 } = __VLS_58.slots;
let __VLS_61;
/** @ts-ignore @type { | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components['el-table-column']} */
elTableColumn;
// @ts-ignore
const __VLS_62 = __VLS_asFunctionalComponent1(__VLS_61, new __VLS_61({
    prop: "facilityName",
    label: "设施",
    width: "120",
}));
const __VLS_63 = __VLS_62({
    prop: "facilityName",
    label: "设施",
    width: "120",
}, ...__VLS_functionalComponentArgsRest(__VLS_62));
let __VLS_66;
/** @ts-ignore @type { | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components['el-table-column'] | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components['el-table-column']} */
elTableColumn;
// @ts-ignore
const __VLS_67 = __VLS_asFunctionalComponent1(__VLS_66, new __VLS_66({
    label: "位置",
    width: "140",
}));
const __VLS_68 = __VLS_67({
    label: "位置",
    width: "140",
}, ...__VLS_functionalComponentArgsRest(__VLS_67));
const { default: __VLS_71 } = __VLS_69.slots;
{
    const { default: __VLS_72 } = __VLS_69.slots;
    const [{ row }] = __VLS_vSlot(__VLS_72);
    (__VLS_ctx.facilityLocation(row.facilityId));
    // @ts-ignore
    [slots, vLoading, loadingSlots, facilityLocation,];
}
// @ts-ignore
[];
var __VLS_69;
let __VLS_73;
/** @ts-ignore @type { | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components['el-table-column']} */
elTableColumn;
// @ts-ignore
const __VLS_74 = __VLS_asFunctionalComponent1(__VLS_73, new __VLS_73({
    prop: "date",
    label: "日期",
    width: "110",
}));
const __VLS_75 = __VLS_74({
    prop: "date",
    label: "日期",
    width: "110",
}, ...__VLS_functionalComponentArgsRest(__VLS_74));
let __VLS_78;
/** @ts-ignore @type { | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components['el-table-column'] | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components['el-table-column']} */
elTableColumn;
// @ts-ignore
const __VLS_79 = __VLS_asFunctionalComponent1(__VLS_78, new __VLS_78({
    label: "时间",
    width: "130",
}));
const __VLS_80 = __VLS_79({
    label: "时间",
    width: "130",
}, ...__VLS_functionalComponentArgsRest(__VLS_79));
const { default: __VLS_83 } = __VLS_81.slots;
{
    const { default: __VLS_84 } = __VLS_81.slots;
    const [{ row }] = __VLS_vSlot(__VLS_84);
    (row.startTime);
    (row.endTime);
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_81;
let __VLS_85;
/** @ts-ignore @type { | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components['el-table-column'] | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components['el-table-column']} */
elTableColumn;
// @ts-ignore
const __VLS_86 = __VLS_asFunctionalComponent1(__VLS_85, new __VLS_85({
    label: "状态",
    width: "100",
}));
const __VLS_87 = __VLS_86({
    label: "状态",
    width: "100",
}, ...__VLS_functionalComponentArgsRest(__VLS_86));
const { default: __VLS_90 } = __VLS_88.slots;
{
    const { default: __VLS_91 } = __VLS_88.slots;
    const [{ row }] = __VLS_vSlot(__VLS_91);
    let __VLS_92;
    /** @ts-ignore @type { | typeof __VLS_components.elTag | typeof __VLS_components.ElTag | typeof __VLS_components['el-tag'] | typeof __VLS_components.elTag | typeof __VLS_components.ElTag | typeof __VLS_components['el-tag']} */
    elTag;
    // @ts-ignore
    const __VLS_93 = __VLS_asFunctionalComponent1(__VLS_92, new __VLS_92({
        type: (__VLS_ctx.slotTagType(row.status)),
        size: "small",
    }));
    const __VLS_94 = __VLS_93({
        type: (__VLS_ctx.slotTagType(row.status)),
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_93));
    const { default: __VLS_97 } = __VLS_95.slots;
    (row.status);
    // @ts-ignore
    [slotTagType,];
    var __VLS_95;
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_88;
let __VLS_98;
/** @ts-ignore @type { | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components['el-table-column'] | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components['el-table-column']} */
elTableColumn;
// @ts-ignore
const __VLS_99 = __VLS_asFunctionalComponent1(__VLS_98, new __VLS_98({
    label: "操作",
    width: "120",
}));
const __VLS_100 = __VLS_99({
    label: "操作",
    width: "120",
}, ...__VLS_functionalComponentArgsRest(__VLS_99));
const { default: __VLS_103 } = __VLS_101.slots;
{
    const { default: __VLS_104 } = __VLS_101.slots;
    const [{ row }] = __VLS_vSlot(__VLS_104);
    let __VLS_105;
    /** @ts-ignore @type { | typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components['el-button'] | typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components['el-button']} */
    elButton;
    // @ts-ignore
    const __VLS_106 = __VLS_asFunctionalComponent1(__VLS_105, new __VLS_105({
        ...{ 'onClick': {} },
        type: "primary",
        size: "small",
        disabled: (row.status !== '可预约'),
    }));
    const __VLS_107 = __VLS_106({
        ...{ 'onClick': {} },
        type: "primary",
        size: "small",
        disabled: (row.status !== '可预约'),
    }, ...__VLS_functionalComponentArgsRest(__VLS_106));
    let __VLS_110;
    const __VLS_111 = {
        /** @type {typeof __VLS_110.click} */
        onClick: (...[$event]) => {
            return (__VLS_ctx.book(row));
            // @ts-ignore
            [book,];
        },
    };
    const { default: __VLS_112 } = __VLS_108.slots;
    // @ts-ignore
    [];
    var __VLS_108;
    var __VLS_109;
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_101;
// @ts-ignore
[];
var __VLS_58;
// @ts-ignore
[];
var __VLS_27;
let __VLS_113;
/** @ts-ignore @type { | typeof __VLS_components.elCard | typeof __VLS_components.ElCard | typeof __VLS_components['el-card'] | typeof __VLS_components.elCard | typeof __VLS_components.ElCard | typeof __VLS_components['el-card']} */
elCard;
// @ts-ignore
const __VLS_114 = __VLS_asFunctionalComponent1(__VLS_113, new __VLS_113({
    shadow: "never",
    ...{ class: "block" },
}));
const __VLS_115 = __VLS_114({
    shadow: "never",
    ...{ class: "block" },
}, ...__VLS_functionalComponentArgsRest(__VLS_114));
/** @type {__VLS_StyleScopedClasses['block']} */ ;
const { default: __VLS_118 } = __VLS_116.slots;
{
    const { header: __VLS_119 } = __VLS_116.slots;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "card-head" },
    });
    /** @type {__VLS_StyleScopedClasses['card-head']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    let __VLS_120;
    /** @ts-ignore @type { | typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components['el-button'] | typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components['el-button']} */
    elButton;
    // @ts-ignore
    const __VLS_121 = __VLS_asFunctionalComponent1(__VLS_120, new __VLS_120({
        ...{ 'onClick': {} },
        size: "small",
    }));
    const __VLS_122 = __VLS_121({
        ...{ 'onClick': {} },
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_121));
    let __VLS_125;
    const __VLS_126 = {
        /** @type {typeof __VLS_125.click} */
        onClick: (__VLS_ctx.loadMyReservations),
    };
    const { default: __VLS_127 } = __VLS_123.slots;
    // @ts-ignore
    [loadMyReservations,];
    var __VLS_123;
    var __VLS_124;
    // @ts-ignore
    [];
}
const __VLS_128 = ReservationTable;
// @ts-ignore
const __VLS_129 = __VLS_asFunctionalComponent1(__VLS_128, new __VLS_128({
    ...{ 'onCancel': {} },
    reservations: (__VLS_ctx.myReservations),
    showCancel: true,
}));
const __VLS_130 = __VLS_129({
    ...{ 'onCancel': {} },
    reservations: (__VLS_ctx.myReservations),
    showCancel: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_129));
let __VLS_133;
const __VLS_134 = {
    /** @type {typeof __VLS_133.cancel} */
    onCancel: (__VLS_ctx.onCancel),
};
var __VLS_131;
var __VLS_132;
// @ts-ignore
[myReservations, onCancel,];
var __VLS_116;
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
