/// <reference types="../../../node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="../../../node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { computed, onMounted, reactive, ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { checkIn, closeSlot, createFacility, createSlot, deleteFacility, finishUse, listFacilities, listReservations, listSlots, markNoShow, updateFacility, } from '../../api/facility';
import ReservationTable from '../../components/ReservationTable.vue';
const STATUSES = ['待核销', '已取消', '已核销', '已完成', '爽约'];
const facilities = ref([]);
const reservations = ref([]);
const managedSlots = ref([]);
const voucherCode = ref('');
const busy = ref(false);
const query = reactive({});
const slotFilterFacility = ref();
const slotFilterDate = ref('');
const newFacility = reactive({ name: '', location: '', description: '' });
const newSlot = reactive({
    facilityId: undefined,
    date: '',
    startTime: '09:00',
    endTime: '11:00',
});
const openFacilities = computed(() => facilities.value.filter((f) => f.status === '开放'));
async function loadFacilities() {
    facilities.value = await listFacilities(true);
}
async function loadReservations() {
    try {
        reservations.value = await listReservations({
            status: query.status,
            facilityId: query.facilityId,
            date: query.date,
        });
    }
    catch (error) {
        ElMessage.error(error.message);
    }
}
async function loadSlots() {
    try {
        managedSlots.value = await listSlots({
            facilityId: slotFilterFacility.value,
            date: slotFilterDate.value,
        });
    }
    catch (error) {
        ElMessage.error(error.message);
    }
}
async function onCheckIn() {
    if (!voucherCode.value.trim()) {
        ElMessage.warning('请输入凭证号');
        return;
    }
    busy.value = true;
    try {
        const result = await checkIn(voucherCode.value.trim().toUpperCase());
        ElMessage.success(`核销成功：${result.facilityName} ${result.date} ${result.startTime}`);
        await loadReservations();
    }
    catch (error) {
        ElMessage.error(`核销失败：${error.message}`);
    }
    finally {
        busy.value = false;
    }
}
async function onFinish() {
    if (!voucherCode.value.trim()) {
        ElMessage.warning('请输入凭证号');
        return;
    }
    busy.value = true;
    try {
        const result = await finishUse(voucherCode.value.trim().toUpperCase());
        ElMessage.success(`已登记使用结束，结束时间已记录`);
        await loadReservations();
    }
    catch (error) {
        ElMessage.error(`操作失败：${error.message}`);
    }
    finally {
        busy.value = false;
    }
}
async function onCheckInThenFinish() {
    await onCheckIn();
    voucherCode.value && (await onFinish());
}
async function onNoShow(row) {
    try {
        await ElMessageBox.confirm(`确认把凭证 ${row.voucherCode} 标记为爽约？`, '标记爽约', { type: 'warning' });
        await markNoShow(row.id);
        ElMessage.success('已标记爽约');
        await loadReservations();
    }
    catch (error) {
        if (error !== 'cancel')
            ElMessage.error(error.message);
    }
}
async function onCreateFacility() {
    if (!newFacility.name) {
        ElMessage.warning('请填写设施名称');
        return;
    }
    try {
        await createFacility({ ...newFacility });
        ElMessage.success('设施已创建');
        newFacility.name = '';
        newFacility.location = '';
        newFacility.description = '';
        await loadFacilities();
    }
    catch (error) {
        ElMessage.error(error.message);
    }
}
async function onToggleFacility(row) {
    try {
        await updateFacility(row.id, { status: row.status === '开放' ? '停用' : '开放' });
        await loadFacilities();
    }
    catch (error) {
        ElMessage.error(error.message);
    }
}
async function onDeleteFacility(row) {
    try {
        await ElMessageBox.confirm(`确认删除设施「${row.name}」？存在预约时将被拒绝。`, '删除设施', { type: 'warning' });
        await deleteFacility(row.id);
        ElMessage.success('设施已删除');
        await loadFacilities();
    }
    catch (error) {
        if (error !== 'cancel')
            ElMessage.error(error.message);
    }
}
async function onCreateSlot() {
    if (!newSlot.facilityId || !newSlot.date || !newSlot.startTime || !newSlot.endTime) {
        ElMessage.warning('请完整选择设施、日期和起止时间');
        return;
    }
    try {
        await createSlot({ ...newSlot, facilityId: newSlot.facilityId });
        ElMessage.success('开放时段已创建');
        await loadSlots();
    }
    catch (error) {
        ElMessage.error(error.message);
    }
}
async function onCloseSlot(row) {
    try {
        await closeSlot(row.id);
        ElMessage.success('时段已关闭');
        await loadSlots();
    }
    catch (error) {
        ElMessage.error(error.message);
    }
}
onMounted(async () => {
    try {
        await loadFacilities();
        await Promise.all([loadReservations(), loadSlots()]);
    }
    catch (error) {
        ElMessage.error(error.message);
    }
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
{
    const { header: __VLS_6 } = __VLS_3.slots;
}
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "checkin-bar" },
});
/** @type {__VLS_StyleScopedClasses['checkin-bar']} */ ;
let __VLS_7;
/** @ts-ignore @type { | typeof __VLS_components.elInput | typeof __VLS_components.ElInput | typeof __VLS_components['el-input']} */
elInput;
// @ts-ignore
const __VLS_8 = __VLS_asFunctionalComponent1(__VLS_7, new __VLS_7({
    ...{ 'onKeyup': {} },
    modelValue: (__VLS_ctx.voucherCode),
    placeholder: "请输入或粘贴 12 位核销凭证",
    maxlength: "12",
    ...{ style: {} },
}));
const __VLS_9 = __VLS_8({
    ...{ 'onKeyup': {} },
    modelValue: (__VLS_ctx.voucherCode),
    placeholder: "请输入或粘贴 12 位核销凭证",
    maxlength: "12",
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_8));
let __VLS_12;
const __VLS_13 = {
    /** @type {typeof __VLS_12.keyup} */
    onKeyup: (__VLS_ctx.onCheckIn),
};
var __VLS_10;
var __VLS_11;
let __VLS_14;
/** @ts-ignore @type { | typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components['el-button'] | typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components['el-button']} */
elButton;
// @ts-ignore
const __VLS_15 = __VLS_asFunctionalComponent1(__VLS_14, new __VLS_14({
    ...{ 'onClick': {} },
    type: "primary",
    loading: (__VLS_ctx.busy),
}));
const __VLS_16 = __VLS_15({
    ...{ 'onClick': {} },
    type: "primary",
    loading: (__VLS_ctx.busy),
}, ...__VLS_functionalComponentArgsRest(__VLS_15));
let __VLS_19;
const __VLS_20 = {
    /** @type {typeof __VLS_19.click} */
    onClick: (__VLS_ctx.onCheckIn),
};
const { default: __VLS_21 } = __VLS_17.slots;
// @ts-ignore
[voucherCode, onCheckIn, onCheckIn, busy,];
var __VLS_17;
var __VLS_18;
let __VLS_22;
/** @ts-ignore @type { | typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components['el-button'] | typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components['el-button']} */
elButton;
// @ts-ignore
const __VLS_23 = __VLS_asFunctionalComponent1(__VLS_22, new __VLS_22({
    ...{ 'onClick': {} },
    type: "success",
    loading: (__VLS_ctx.busy),
}));
const __VLS_24 = __VLS_23({
    ...{ 'onClick': {} },
    type: "success",
    loading: (__VLS_ctx.busy),
}, ...__VLS_functionalComponentArgsRest(__VLS_23));
let __VLS_27;
const __VLS_28 = {
    /** @type {typeof __VLS_27.click} */
    onClick: (__VLS_ctx.onFinish),
};
const { default: __VLS_29 } = __VLS_25.slots;
// @ts-ignore
[busy, onFinish,];
var __VLS_25;
var __VLS_26;
let __VLS_30;
/** @ts-ignore @type { | typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components['el-button'] | typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components['el-button']} */
elButton;
// @ts-ignore
const __VLS_31 = __VLS_asFunctionalComponent1(__VLS_30, new __VLS_30({
    ...{ 'onClick': {} },
}));
const __VLS_32 = __VLS_31({
    ...{ 'onClick': {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_31));
let __VLS_35;
const __VLS_36 = {
    /** @type {typeof __VLS_35.click} */
    onClick: (__VLS_ctx.onCheckInThenFinish),
};
const { default: __VLS_37 } = __VLS_33.slots;
// @ts-ignore
[onCheckInThenFinish,];
var __VLS_33;
var __VLS_34;
__VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({
    ...{ class: "hint" },
});
/** @type {__VLS_StyleScopedClasses['hint']} */ ;
// @ts-ignore
[];
var __VLS_3;
let __VLS_38;
/** @ts-ignore @type { | typeof __VLS_components.elCard | typeof __VLS_components.ElCard | typeof __VLS_components['el-card'] | typeof __VLS_components.elCard | typeof __VLS_components.ElCard | typeof __VLS_components['el-card']} */
elCard;
// @ts-ignore
const __VLS_39 = __VLS_asFunctionalComponent1(__VLS_38, new __VLS_38({
    shadow: "never",
    ...{ class: "block" },
}));
const __VLS_40 = __VLS_39({
    shadow: "never",
    ...{ class: "block" },
}, ...__VLS_functionalComponentArgsRest(__VLS_39));
/** @type {__VLS_StyleScopedClasses['block']} */ ;
const { default: __VLS_43 } = __VLS_41.slots;
{
    const { header: __VLS_44 } = __VLS_41.slots;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "card-head" },
    });
    /** @type {__VLS_StyleScopedClasses['card-head']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.span, __VLS_intrinsics.span)({});
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "filters" },
    });
    /** @type {__VLS_StyleScopedClasses['filters']} */ ;
    let __VLS_45;
    /** @ts-ignore @type { | typeof __VLS_components.elSelect | typeof __VLS_components.ElSelect | typeof __VLS_components['el-select'] | typeof __VLS_components.elSelect | typeof __VLS_components.ElSelect | typeof __VLS_components['el-select']} */
    elSelect;
    // @ts-ignore
    const __VLS_46 = __VLS_asFunctionalComponent1(__VLS_45, new __VLS_45({
        modelValue: (__VLS_ctx.query.status),
        placeholder: "全部状态",
        clearable: true,
        ...{ style: {} },
    }));
    const __VLS_47 = __VLS_46({
        modelValue: (__VLS_ctx.query.status),
        placeholder: "全部状态",
        clearable: true,
        ...{ style: {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_46));
    const { default: __VLS_50 } = __VLS_48.slots;
    for (const [s] of __VLS_vFor((__VLS_ctx.STATUSES))) {
        let __VLS_51;
        /** @ts-ignore @type { | typeof __VLS_components.elOption | typeof __VLS_components.ElOption | typeof __VLS_components['el-option']} */
        elOption;
        // @ts-ignore
        const __VLS_52 = __VLS_asFunctionalComponent1(__VLS_51, new __VLS_51({
            key: (s),
            label: (s),
            value: (s),
        }));
        const __VLS_53 = __VLS_52({
            key: (s),
            label: (s),
            value: (s),
        }, ...__VLS_functionalComponentArgsRest(__VLS_52));
        // @ts-ignore
        [query, STATUSES,];
    }
    // @ts-ignore
    [];
    var __VLS_48;
    let __VLS_56;
    /** @ts-ignore @type { | typeof __VLS_components.elSelect | typeof __VLS_components.ElSelect | typeof __VLS_components['el-select'] | typeof __VLS_components.elSelect | typeof __VLS_components.ElSelect | typeof __VLS_components['el-select']} */
    elSelect;
    // @ts-ignore
    const __VLS_57 = __VLS_asFunctionalComponent1(__VLS_56, new __VLS_56({
        modelValue: (__VLS_ctx.query.facilityId),
        placeholder: "全部设施",
        clearable: true,
        ...{ style: {} },
    }));
    const __VLS_58 = __VLS_57({
        modelValue: (__VLS_ctx.query.facilityId),
        placeholder: "全部设施",
        clearable: true,
        ...{ style: {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_57));
    const { default: __VLS_61 } = __VLS_59.slots;
    for (const [f] of __VLS_vFor((__VLS_ctx.facilities))) {
        let __VLS_62;
        /** @ts-ignore @type { | typeof __VLS_components.elOption | typeof __VLS_components.ElOption | typeof __VLS_components['el-option']} */
        elOption;
        // @ts-ignore
        const __VLS_63 = __VLS_asFunctionalComponent1(__VLS_62, new __VLS_62({
            key: (f.id),
            label: (f.name),
            value: (f.id),
        }));
        const __VLS_64 = __VLS_63({
            key: (f.id),
            label: (f.name),
            value: (f.id),
        }, ...__VLS_functionalComponentArgsRest(__VLS_63));
        // @ts-ignore
        [query, facilities,];
    }
    // @ts-ignore
    [];
    var __VLS_59;
    let __VLS_67;
    /** @ts-ignore @type { | typeof __VLS_components.elDatePicker | typeof __VLS_components.ElDatePicker | typeof __VLS_components['el-date-picker']} */
    elDatePicker;
    // @ts-ignore
    const __VLS_68 = __VLS_asFunctionalComponent1(__VLS_67, new __VLS_67({
        modelValue: (__VLS_ctx.query.date),
        type: "date",
        valueFormat: "YYYY-MM-DD",
        placeholder: "日期",
        clearable: true,
        ...{ style: {} },
    }));
    const __VLS_69 = __VLS_68({
        modelValue: (__VLS_ctx.query.date),
        type: "date",
        valueFormat: "YYYY-MM-DD",
        placeholder: "日期",
        clearable: true,
        ...{ style: {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_68));
    let __VLS_72;
    /** @ts-ignore @type { | typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components['el-button'] | typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components['el-button']} */
    elButton;
    // @ts-ignore
    const __VLS_73 = __VLS_asFunctionalComponent1(__VLS_72, new __VLS_72({
        ...{ 'onClick': {} },
    }));
    const __VLS_74 = __VLS_73({
        ...{ 'onClick': {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_73));
    let __VLS_77;
    const __VLS_78 = {
        /** @type {typeof __VLS_77.click} */
        onClick: (__VLS_ctx.loadReservations),
    };
    const { default: __VLS_79 } = __VLS_75.slots;
    // @ts-ignore
    [query, loadReservations,];
    var __VLS_75;
    var __VLS_76;
    // @ts-ignore
    [];
}
const __VLS_80 = ReservationTable || ReservationTable;
// @ts-ignore
const __VLS_81 = __VLS_asFunctionalComponent1(__VLS_80, new __VLS_80({
    reservations: (__VLS_ctx.reservations),
    hideTenant: true,
}));
const __VLS_82 = __VLS_81({
    reservations: (__VLS_ctx.reservations),
    hideTenant: true,
}, ...__VLS_functionalComponentArgsRest(__VLS_81));
const { default: __VLS_85 } = __VLS_83.slots;
{
    const { actions: __VLS_86 } = __VLS_83.slots;
    const [{ row }] = __VLS_vSlot(__VLS_86);
    if (row.status === '待核销') {
        let __VLS_87;
        /** @ts-ignore @type { | typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components['el-button'] | typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components['el-button']} */
        elButton;
        // @ts-ignore
        const __VLS_88 = __VLS_asFunctionalComponent1(__VLS_87, new __VLS_87({
            ...{ 'onClick': {} },
            size: "small",
            type: "danger",
        }));
        const __VLS_89 = __VLS_88({
            ...{ 'onClick': {} },
            size: "small",
            type: "danger",
        }, ...__VLS_functionalComponentArgsRest(__VLS_88));
        let __VLS_92;
        const __VLS_93 = {
            /** @type {typeof __VLS_92.click} */
            onClick: (...[$event]) => {
                if (!(row.status === '待核销'))
                    throw 0;
                return (__VLS_ctx.onNoShow(row));
                // @ts-ignore
                [reservations, onNoShow,];
            },
        };
        const { default: __VLS_94 } = __VLS_90.slots;
        // @ts-ignore
        [];
        var __VLS_90;
        var __VLS_91;
    }
    else if (row.status === '爽约') {
        let __VLS_95;
        /** @ts-ignore @type { | typeof __VLS_components.elTag | typeof __VLS_components.ElTag | typeof __VLS_components['el-tag'] | typeof __VLS_components.elTag | typeof __VLS_components.ElTag | typeof __VLS_components['el-tag']} */
        elTag;
        // @ts-ignore
        const __VLS_96 = __VLS_asFunctionalComponent1(__VLS_95, new __VLS_95({
            type: "danger",
            size: "small",
        }));
        const __VLS_97 = __VLS_96({
            type: "danger",
            size: "small",
        }, ...__VLS_functionalComponentArgsRest(__VLS_96));
        const { default: __VLS_100 } = __VLS_98.slots;
        // @ts-ignore
        [];
        var __VLS_98;
    }
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_83;
// @ts-ignore
[];
var __VLS_41;
let __VLS_101;
/** @ts-ignore @type { | typeof __VLS_components.elCard | typeof __VLS_components.ElCard | typeof __VLS_components['el-card'] | typeof __VLS_components.elCard | typeof __VLS_components.ElCard | typeof __VLS_components['el-card']} */
elCard;
// @ts-ignore
const __VLS_102 = __VLS_asFunctionalComponent1(__VLS_101, new __VLS_101({
    shadow: "never",
    ...{ class: "block" },
}));
const __VLS_103 = __VLS_102({
    shadow: "never",
    ...{ class: "block" },
}, ...__VLS_functionalComponentArgsRest(__VLS_102));
/** @type {__VLS_StyleScopedClasses['block']} */ ;
const { default: __VLS_106 } = __VLS_104.slots;
{
    const { header: __VLS_107 } = __VLS_104.slots;
    // @ts-ignore
    [];
}
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "maintain-bar" },
});
/** @type {__VLS_StyleScopedClasses['maintain-bar']} */ ;
let __VLS_108;
/** @ts-ignore @type { | typeof __VLS_components.elInput | typeof __VLS_components.ElInput | typeof __VLS_components['el-input']} */
elInput;
// @ts-ignore
const __VLS_109 = __VLS_asFunctionalComponent1(__VLS_108, new __VLS_108({
    modelValue: (__VLS_ctx.newFacility.name),
    placeholder: "设施名称（如 瑜伽室）",
    ...{ style: {} },
}));
const __VLS_110 = __VLS_109({
    modelValue: (__VLS_ctx.newFacility.name),
    placeholder: "设施名称（如 瑜伽室）",
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_109));
let __VLS_113;
/** @ts-ignore @type { | typeof __VLS_components.elInput | typeof __VLS_components.ElInput | typeof __VLS_components['el-input']} */
elInput;
// @ts-ignore
const __VLS_114 = __VLS_asFunctionalComponent1(__VLS_113, new __VLS_113({
    modelValue: (__VLS_ctx.newFacility.location),
    placeholder: "位置",
    ...{ style: {} },
}));
const __VLS_115 = __VLS_114({
    modelValue: (__VLS_ctx.newFacility.location),
    placeholder: "位置",
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_114));
let __VLS_118;
/** @ts-ignore @type { | typeof __VLS_components.elInput | typeof __VLS_components.ElInput | typeof __VLS_components['el-input']} */
elInput;
// @ts-ignore
const __VLS_119 = __VLS_asFunctionalComponent1(__VLS_118, new __VLS_118({
    modelValue: (__VLS_ctx.newFacility.description),
    placeholder: "说明",
    ...{ style: {} },
}));
const __VLS_120 = __VLS_119({
    modelValue: (__VLS_ctx.newFacility.description),
    placeholder: "说明",
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_119));
let __VLS_123;
/** @ts-ignore @type { | typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components['el-button'] | typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components['el-button']} */
elButton;
// @ts-ignore
const __VLS_124 = __VLS_asFunctionalComponent1(__VLS_123, new __VLS_123({
    ...{ 'onClick': {} },
    type: "primary",
}));
const __VLS_125 = __VLS_124({
    ...{ 'onClick': {} },
    type: "primary",
}, ...__VLS_functionalComponentArgsRest(__VLS_124));
let __VLS_128;
const __VLS_129 = {
    /** @type {typeof __VLS_128.click} */
    onClick: (__VLS_ctx.onCreateFacility),
};
const { default: __VLS_130 } = __VLS_126.slots;
// @ts-ignore
[newFacility, newFacility, newFacility, onCreateFacility,];
var __VLS_126;
var __VLS_127;
let __VLS_131;
/** @ts-ignore @type { | typeof __VLS_components.elTable | typeof __VLS_components.ElTable | typeof __VLS_components['el-table'] | typeof __VLS_components.elTable | typeof __VLS_components.ElTable | typeof __VLS_components['el-table']} */
elTable;
// @ts-ignore
const __VLS_132 = __VLS_asFunctionalComponent1(__VLS_131, new __VLS_131({
    data: (__VLS_ctx.facilities),
    size: "small",
    ...{ style: {} },
}));
const __VLS_133 = __VLS_132({
    data: (__VLS_ctx.facilities),
    size: "small",
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_132));
const { default: __VLS_136 } = __VLS_134.slots;
let __VLS_137;
/** @ts-ignore @type { | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components['el-table-column']} */
elTableColumn;
// @ts-ignore
const __VLS_138 = __VLS_asFunctionalComponent1(__VLS_137, new __VLS_137({
    prop: "id",
    label: "ID",
    width: "60",
}));
const __VLS_139 = __VLS_138({
    prop: "id",
    label: "ID",
    width: "60",
}, ...__VLS_functionalComponentArgsRest(__VLS_138));
let __VLS_142;
/** @ts-ignore @type { | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components['el-table-column']} */
elTableColumn;
// @ts-ignore
const __VLS_143 = __VLS_asFunctionalComponent1(__VLS_142, new __VLS_142({
    prop: "name",
    label: "名称",
    width: "130",
}));
const __VLS_144 = __VLS_143({
    prop: "name",
    label: "名称",
    width: "130",
}, ...__VLS_functionalComponentArgsRest(__VLS_143));
let __VLS_147;
/** @ts-ignore @type { | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components['el-table-column']} */
elTableColumn;
// @ts-ignore
const __VLS_148 = __VLS_asFunctionalComponent1(__VLS_147, new __VLS_147({
    prop: "location",
    label: "位置",
    width: "150",
}));
const __VLS_149 = __VLS_148({
    prop: "location",
    label: "位置",
    width: "150",
}, ...__VLS_functionalComponentArgsRest(__VLS_148));
let __VLS_152;
/** @ts-ignore @type { | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components['el-table-column']} */
elTableColumn;
// @ts-ignore
const __VLS_153 = __VLS_asFunctionalComponent1(__VLS_152, new __VLS_152({
    prop: "description",
    label: "说明",
    minWidth: "180",
}));
const __VLS_154 = __VLS_153({
    prop: "description",
    label: "说明",
    minWidth: "180",
}, ...__VLS_functionalComponentArgsRest(__VLS_153));
let __VLS_157;
/** @ts-ignore @type { | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components['el-table-column'] | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components['el-table-column']} */
elTableColumn;
// @ts-ignore
const __VLS_158 = __VLS_asFunctionalComponent1(__VLS_157, new __VLS_157({
    label: "状态",
    width: "90",
}));
const __VLS_159 = __VLS_158({
    label: "状态",
    width: "90",
}, ...__VLS_functionalComponentArgsRest(__VLS_158));
const { default: __VLS_162 } = __VLS_160.slots;
{
    const { default: __VLS_163 } = __VLS_160.slots;
    const [{ row }] = __VLS_vSlot(__VLS_163);
    let __VLS_164;
    /** @ts-ignore @type { | typeof __VLS_components.elTag | typeof __VLS_components.ElTag | typeof __VLS_components['el-tag'] | typeof __VLS_components.elTag | typeof __VLS_components.ElTag | typeof __VLS_components['el-tag']} */
    elTag;
    // @ts-ignore
    const __VLS_165 = __VLS_asFunctionalComponent1(__VLS_164, new __VLS_164({
        type: (row.status === '开放' ? 'success' : 'info'),
        size: "small",
    }));
    const __VLS_166 = __VLS_165({
        type: (row.status === '开放' ? 'success' : 'info'),
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_165));
    const { default: __VLS_169 } = __VLS_167.slots;
    (row.status);
    // @ts-ignore
    [facilities,];
    var __VLS_167;
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_160;
let __VLS_170;
/** @ts-ignore @type { | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components['el-table-column'] | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components['el-table-column']} */
elTableColumn;
// @ts-ignore
const __VLS_171 = __VLS_asFunctionalComponent1(__VLS_170, new __VLS_170({
    label: "操作",
    width: "190",
}));
const __VLS_172 = __VLS_171({
    label: "操作",
    width: "190",
}, ...__VLS_functionalComponentArgsRest(__VLS_171));
const { default: __VLS_175 } = __VLS_173.slots;
{
    const { default: __VLS_176 } = __VLS_173.slots;
    const [{ row }] = __VLS_vSlot(__VLS_176);
    let __VLS_177;
    /** @ts-ignore @type { | typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components['el-button'] | typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components['el-button']} */
    elButton;
    // @ts-ignore
    const __VLS_178 = __VLS_asFunctionalComponent1(__VLS_177, new __VLS_177({
        ...{ 'onClick': {} },
        size: "small",
    }));
    const __VLS_179 = __VLS_178({
        ...{ 'onClick': {} },
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_178));
    let __VLS_182;
    const __VLS_183 = {
        /** @type {typeof __VLS_182.click} */
        onClick: (...[$event]) => {
            return (__VLS_ctx.onToggleFacility(row));
            // @ts-ignore
            [onToggleFacility,];
        },
    };
    const { default: __VLS_184 } = __VLS_180.slots;
    (row.status === '开放' ? '停用' : '启用');
    // @ts-ignore
    [];
    var __VLS_180;
    var __VLS_181;
    let __VLS_185;
    /** @ts-ignore @type { | typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components['el-button'] | typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components['el-button']} */
    elButton;
    // @ts-ignore
    const __VLS_186 = __VLS_asFunctionalComponent1(__VLS_185, new __VLS_185({
        ...{ 'onClick': {} },
        size: "small",
        type: "danger",
    }));
    const __VLS_187 = __VLS_186({
        ...{ 'onClick': {} },
        size: "small",
        type: "danger",
    }, ...__VLS_functionalComponentArgsRest(__VLS_186));
    let __VLS_190;
    const __VLS_191 = {
        /** @type {typeof __VLS_190.click} */
        onClick: (...[$event]) => {
            return (__VLS_ctx.onDeleteFacility(row));
            // @ts-ignore
            [onDeleteFacility,];
        },
    };
    const { default: __VLS_192 } = __VLS_188.slots;
    // @ts-ignore
    [];
    var __VLS_188;
    var __VLS_189;
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_173;
// @ts-ignore
[];
var __VLS_134;
// @ts-ignore
[];
var __VLS_104;
let __VLS_193;
/** @ts-ignore @type { | typeof __VLS_components.elCard | typeof __VLS_components.ElCard | typeof __VLS_components['el-card'] | typeof __VLS_components.elCard | typeof __VLS_components.ElCard | typeof __VLS_components['el-card']} */
elCard;
// @ts-ignore
const __VLS_194 = __VLS_asFunctionalComponent1(__VLS_193, new __VLS_193({
    shadow: "never",
    ...{ class: "block" },
}));
const __VLS_195 = __VLS_194({
    shadow: "never",
    ...{ class: "block" },
}, ...__VLS_functionalComponentArgsRest(__VLS_194));
/** @type {__VLS_StyleScopedClasses['block']} */ ;
const { default: __VLS_198 } = __VLS_196.slots;
{
    const { header: __VLS_199 } = __VLS_196.slots;
    // @ts-ignore
    [];
}
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "maintain-bar" },
});
/** @type {__VLS_StyleScopedClasses['maintain-bar']} */ ;
let __VLS_200;
/** @ts-ignore @type { | typeof __VLS_components.elSelect | typeof __VLS_components.ElSelect | typeof __VLS_components['el-select'] | typeof __VLS_components.elSelect | typeof __VLS_components.ElSelect | typeof __VLS_components['el-select']} */
elSelect;
// @ts-ignore
const __VLS_201 = __VLS_asFunctionalComponent1(__VLS_200, new __VLS_200({
    modelValue: (__VLS_ctx.newSlot.facilityId),
    placeholder: "选择设施",
    ...{ style: {} },
}));
const __VLS_202 = __VLS_201({
    modelValue: (__VLS_ctx.newSlot.facilityId),
    placeholder: "选择设施",
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_201));
const { default: __VLS_205 } = __VLS_203.slots;
for (const [f] of __VLS_vFor((__VLS_ctx.openFacilities))) {
    let __VLS_206;
    /** @ts-ignore @type { | typeof __VLS_components.elOption | typeof __VLS_components.ElOption | typeof __VLS_components['el-option']} */
    elOption;
    // @ts-ignore
    const __VLS_207 = __VLS_asFunctionalComponent1(__VLS_206, new __VLS_206({
        key: (f.id),
        label: (f.name),
        value: (f.id),
    }));
    const __VLS_208 = __VLS_207({
        key: (f.id),
        label: (f.name),
        value: (f.id),
    }, ...__VLS_functionalComponentArgsRest(__VLS_207));
    // @ts-ignore
    [newSlot, openFacilities,];
}
// @ts-ignore
[];
var __VLS_203;
let __VLS_211;
/** @ts-ignore @type { | typeof __VLS_components.elDatePicker | typeof __VLS_components.ElDatePicker | typeof __VLS_components['el-date-picker']} */
elDatePicker;
// @ts-ignore
const __VLS_212 = __VLS_asFunctionalComponent1(__VLS_211, new __VLS_211({
    modelValue: (__VLS_ctx.newSlot.date),
    type: "date",
    valueFormat: "YYYY-MM-DD",
    placeholder: "日期",
    ...{ style: {} },
}));
const __VLS_213 = __VLS_212({
    modelValue: (__VLS_ctx.newSlot.date),
    type: "date",
    valueFormat: "YYYY-MM-DD",
    placeholder: "日期",
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_212));
let __VLS_216;
/** @ts-ignore @type { | typeof __VLS_components.elTimePicker | typeof __VLS_components.ElTimePicker | typeof __VLS_components['el-time-picker']} */
elTimePicker;
// @ts-ignore
const __VLS_217 = __VLS_asFunctionalComponent1(__VLS_216, new __VLS_216({
    modelValue: (__VLS_ctx.newSlot.startTime),
    valueFormat: "HH:mm",
    format: "HH:mm",
    placeholder: "开始",
    ...{ style: {} },
}));
const __VLS_218 = __VLS_217({
    modelValue: (__VLS_ctx.newSlot.startTime),
    valueFormat: "HH:mm",
    format: "HH:mm",
    placeholder: "开始",
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_217));
let __VLS_221;
/** @ts-ignore @type { | typeof __VLS_components.elTimePicker | typeof __VLS_components.ElTimePicker | typeof __VLS_components['el-time-picker']} */
elTimePicker;
// @ts-ignore
const __VLS_222 = __VLS_asFunctionalComponent1(__VLS_221, new __VLS_221({
    modelValue: (__VLS_ctx.newSlot.endTime),
    valueFormat: "HH:mm",
    format: "HH:mm",
    placeholder: "结束",
    ...{ style: {} },
}));
const __VLS_223 = __VLS_222({
    modelValue: (__VLS_ctx.newSlot.endTime),
    valueFormat: "HH:mm",
    format: "HH:mm",
    placeholder: "结束",
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_222));
let __VLS_226;
/** @ts-ignore @type { | typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components['el-button'] | typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components['el-button']} */
elButton;
// @ts-ignore
const __VLS_227 = __VLS_asFunctionalComponent1(__VLS_226, new __VLS_226({
    ...{ 'onClick': {} },
    type: "primary",
}));
const __VLS_228 = __VLS_227({
    ...{ 'onClick': {} },
    type: "primary",
}, ...__VLS_functionalComponentArgsRest(__VLS_227));
let __VLS_231;
const __VLS_232 = {
    /** @type {typeof __VLS_231.click} */
    onClick: (__VLS_ctx.onCreateSlot),
};
const { default: __VLS_233 } = __VLS_229.slots;
// @ts-ignore
[newSlot, newSlot, newSlot, onCreateSlot,];
var __VLS_229;
var __VLS_230;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "maintain-bar" },
    ...{ style: {} },
});
/** @type {__VLS_StyleScopedClasses['maintain-bar']} */ ;
let __VLS_234;
/** @ts-ignore @type { | typeof __VLS_components.elSelect | typeof __VLS_components.ElSelect | typeof __VLS_components['el-select'] | typeof __VLS_components.elSelect | typeof __VLS_components.ElSelect | typeof __VLS_components['el-select']} */
elSelect;
// @ts-ignore
const __VLS_235 = __VLS_asFunctionalComponent1(__VLS_234, new __VLS_234({
    modelValue: (__VLS_ctx.slotFilterFacility),
    placeholder: "查看某设施的时段",
    clearable: true,
    ...{ style: {} },
}));
const __VLS_236 = __VLS_235({
    modelValue: (__VLS_ctx.slotFilterFacility),
    placeholder: "查看某设施的时段",
    clearable: true,
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_235));
const { default: __VLS_239 } = __VLS_237.slots;
for (const [f] of __VLS_vFor((__VLS_ctx.facilities))) {
    let __VLS_240;
    /** @ts-ignore @type { | typeof __VLS_components.elOption | typeof __VLS_components.ElOption | typeof __VLS_components['el-option']} */
    elOption;
    // @ts-ignore
    const __VLS_241 = __VLS_asFunctionalComponent1(__VLS_240, new __VLS_240({
        key: (f.id),
        label: (f.name),
        value: (f.id),
    }));
    const __VLS_242 = __VLS_241({
        key: (f.id),
        label: (f.name),
        value: (f.id),
    }, ...__VLS_functionalComponentArgsRest(__VLS_241));
    // @ts-ignore
    [facilities, slotFilterFacility,];
}
// @ts-ignore
[];
var __VLS_237;
let __VLS_245;
/** @ts-ignore @type { | typeof __VLS_components.elDatePicker | typeof __VLS_components.ElDatePicker | typeof __VLS_components['el-date-picker']} */
elDatePicker;
// @ts-ignore
const __VLS_246 = __VLS_asFunctionalComponent1(__VLS_245, new __VLS_245({
    modelValue: (__VLS_ctx.slotFilterDate),
    type: "date",
    valueFormat: "YYYY-MM-DD",
    placeholder: "日期",
    clearable: true,
    ...{ style: {} },
}));
const __VLS_247 = __VLS_246({
    modelValue: (__VLS_ctx.slotFilterDate),
    type: "date",
    valueFormat: "YYYY-MM-DD",
    placeholder: "日期",
    clearable: true,
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_246));
let __VLS_250;
/** @ts-ignore @type { | typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components['el-button'] | typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components['el-button']} */
elButton;
// @ts-ignore
const __VLS_251 = __VLS_asFunctionalComponent1(__VLS_250, new __VLS_250({
    ...{ 'onClick': {} },
}));
const __VLS_252 = __VLS_251({
    ...{ 'onClick': {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_251));
let __VLS_255;
const __VLS_256 = {
    /** @type {typeof __VLS_255.click} */
    onClick: (__VLS_ctx.loadSlots),
};
const { default: __VLS_257 } = __VLS_253.slots;
// @ts-ignore
[slotFilterDate, loadSlots,];
var __VLS_253;
var __VLS_254;
let __VLS_258;
/** @ts-ignore @type { | typeof __VLS_components.elTable | typeof __VLS_components.ElTable | typeof __VLS_components['el-table'] | typeof __VLS_components.elTable | typeof __VLS_components.ElTable | typeof __VLS_components['el-table']} */
elTable;
// @ts-ignore
const __VLS_259 = __VLS_asFunctionalComponent1(__VLS_258, new __VLS_258({
    data: (__VLS_ctx.managedSlots),
    size: "small",
    ...{ style: {} },
}));
const __VLS_260 = __VLS_259({
    data: (__VLS_ctx.managedSlots),
    size: "small",
    ...{ style: {} },
}, ...__VLS_functionalComponentArgsRest(__VLS_259));
const { default: __VLS_263 } = __VLS_261.slots;
let __VLS_264;
/** @ts-ignore @type { | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components['el-table-column']} */
elTableColumn;
// @ts-ignore
const __VLS_265 = __VLS_asFunctionalComponent1(__VLS_264, new __VLS_264({
    prop: "facilityName",
    label: "设施",
    width: "120",
}));
const __VLS_266 = __VLS_265({
    prop: "facilityName",
    label: "设施",
    width: "120",
}, ...__VLS_functionalComponentArgsRest(__VLS_265));
let __VLS_269;
/** @ts-ignore @type { | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components['el-table-column']} */
elTableColumn;
// @ts-ignore
const __VLS_270 = __VLS_asFunctionalComponent1(__VLS_269, new __VLS_269({
    prop: "date",
    label: "日期",
    width: "110",
}));
const __VLS_271 = __VLS_270({
    prop: "date",
    label: "日期",
    width: "110",
}, ...__VLS_functionalComponentArgsRest(__VLS_270));
let __VLS_274;
/** @ts-ignore @type { | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components['el-table-column'] | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components['el-table-column']} */
elTableColumn;
// @ts-ignore
const __VLS_275 = __VLS_asFunctionalComponent1(__VLS_274, new __VLS_274({
    label: "时间",
    width: "130",
}));
const __VLS_276 = __VLS_275({
    label: "时间",
    width: "130",
}, ...__VLS_functionalComponentArgsRest(__VLS_275));
const { default: __VLS_279 } = __VLS_277.slots;
{
    const { default: __VLS_280 } = __VLS_277.slots;
    const [{ row }] = __VLS_vSlot(__VLS_280);
    (row.startTime);
    (row.endTime);
    // @ts-ignore
    [managedSlots,];
}
// @ts-ignore
[];
var __VLS_277;
let __VLS_281;
/** @ts-ignore @type { | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components['el-table-column'] | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components['el-table-column']} */
elTableColumn;
// @ts-ignore
const __VLS_282 = __VLS_asFunctionalComponent1(__VLS_281, new __VLS_281({
    label: "预约状态",
    width: "100",
}));
const __VLS_283 = __VLS_282({
    label: "预约状态",
    width: "100",
}, ...__VLS_functionalComponentArgsRest(__VLS_282));
const { default: __VLS_286 } = __VLS_284.slots;
{
    const { default: __VLS_287 } = __VLS_284.slots;
    const [{ row }] = __VLS_vSlot(__VLS_287);
    let __VLS_288;
    /** @ts-ignore @type { | typeof __VLS_components.elTag | typeof __VLS_components.ElTag | typeof __VLS_components['el-tag'] | typeof __VLS_components.elTag | typeof __VLS_components.ElTag | typeof __VLS_components['el-tag']} */
    elTag;
    // @ts-ignore
    const __VLS_289 = __VLS_asFunctionalComponent1(__VLS_288, new __VLS_288({
        type: (row.status === '可预约' ? 'success' : row.status === '已约满' ? 'danger' : 'info'),
        size: "small",
    }));
    const __VLS_290 = __VLS_289({
        type: (row.status === '可预约' ? 'success' : row.status === '已约满' ? 'danger' : 'info'),
        size: "small",
    }, ...__VLS_functionalComponentArgsRest(__VLS_289));
    const { default: __VLS_293 } = __VLS_291.slots;
    (row.status);
    // @ts-ignore
    [];
    var __VLS_291;
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_284;
let __VLS_294;
/** @ts-ignore @type { | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components['el-table-column'] | typeof __VLS_components.elTableColumn | typeof __VLS_components.ElTableColumn | typeof __VLS_components['el-table-column']} */
elTableColumn;
// @ts-ignore
const __VLS_295 = __VLS_asFunctionalComponent1(__VLS_294, new __VLS_294({
    label: "操作",
    width: "120",
}));
const __VLS_296 = __VLS_295({
    label: "操作",
    width: "120",
}, ...__VLS_functionalComponentArgsRest(__VLS_295));
const { default: __VLS_299 } = __VLS_297.slots;
{
    const { default: __VLS_300 } = __VLS_297.slots;
    const [{ row }] = __VLS_vSlot(__VLS_300);
    let __VLS_301;
    /** @ts-ignore @type { | typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components['el-button'] | typeof __VLS_components.elButton | typeof __VLS_components.ElButton | typeof __VLS_components['el-button']} */
    elButton;
    // @ts-ignore
    const __VLS_302 = __VLS_asFunctionalComponent1(__VLS_301, new __VLS_301({
        ...{ 'onClick': {} },
        size: "small",
        disabled: (row.booked),
    }));
    const __VLS_303 = __VLS_302({
        ...{ 'onClick': {} },
        size: "small",
        disabled: (row.booked),
    }, ...__VLS_functionalComponentArgsRest(__VLS_302));
    let __VLS_306;
    const __VLS_307 = {
        /** @type {typeof __VLS_306.click} */
        onClick: (...[$event]) => {
            return (__VLS_ctx.onCloseSlot(row));
            // @ts-ignore
            [onCloseSlot,];
        },
    };
    const { default: __VLS_308 } = __VLS_304.slots;
    // @ts-ignore
    [];
    var __VLS_304;
    var __VLS_305;
    // @ts-ignore
    [];
}
// @ts-ignore
[];
var __VLS_297;
// @ts-ignore
[];
var __VLS_261;
// @ts-ignore
[];
var __VLS_196;
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({});
export default {};
