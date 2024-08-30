<template>
  <div class="system-dic-container">
    <el-card shadow="hover">
      <div class="system-user-search mb15">
        <el-form ref="queryRef" :inline="true" label-width="68px">
          <el-form-item>
            <el-button size="default" type="success" class="ml10" @click="onOpenAddCate">
              <el-icon>
                <ele-FolderAdd />
              </el-icon>
              新增分类
            </el-button>
            <el-button size="default" type="danger" class="ml10" @click="onRowDel(null)">
              <el-icon>
                <ele-Delete />
              </el-icon>
              删除分类
            </el-button>
          </el-form-item>
        </el-form>
      </div>
      <el-table :data="tableData.data" style="width: 100%" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="ID" align="center" prop="id" width="120" />
        <el-table-column label="名称" align="center" prop="name" :show-overflow-tooltip="true" />
        <el-table-column label="操作" width="200">
          <template #default="scope">
            <el-button size="small" text type="primary" @click="onOpenEdit(scope.row)">修改</el-button>
            <el-button size="small" text type="primary" @click="onRowDel(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <EditCate ref="EditCateRef" @typeList="dataList" />
  </div>
</template>

<script lang="ts">
import { toRefs, reactive, onMounted, ref, defineComponent } from 'vue';
import { ElMessageBox, ElMessage, FormInstance } from 'element-plus';
import EditCate from '/@/views/biz/cate/component/editCate.vue';
import { deleteCate, getCateList } from "/@/api/biz/cate";


// 定义接口来定义对象的类型
interface TableDataRow {
  id: number;
  name: string;
}
interface TableDataState {
  ids: number[];
  tableData: {
    data: Array<TableDataRow>;
    loading: boolean;
  };
}

export default defineComponent({
  name: 'editCate',
  components: { EditCate },
  setup() {
    const addDicRef = ref();
    const EditCateRef = ref();
    const queryRef = ref();
    const state = reactive<TableDataState>({
      ids: [],
      tableData: {
        data: [],
        loading: false,
      },
    });
    // 初始化表格数据
    const initTableData = () => {
      dataList()
    };
    const dataList = () => {
      getCateList({}).then((res: any) => {
        state.tableData.data = res.data.cates;
      });
    };
    // 打开新增字典弹窗
    const onOpenAddCate = () => {
      EditCateRef.value.openDialog();
    };
    // 打开修改字典弹窗
    const onOpenEdit = (row: TableDataRow) => {
      EditCateRef.value.openDialog(row);
    };
    // 删除
    const onRowDel = (row: TableDataRow) => {
      let msg = '你确定要删除所选数据？';
      let ids: number[] = [];
      if (row) {
        msg = `此操作将永久删除：“${row.name}”，是否继续?`
        ids = [row.id]
      } else {
        ids = state.ids
      }
      if (ids.length === 0) {
        ElMessage.error('请选择要删除的数据。');
        return
      }
      ElMessageBox.confirm(msg, '提示', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(() => {
          deleteCate({ids: ids}).then(() => {
            ElMessage.success('删除成功');
            dataList();
          })
        })
        .catch(() => { });
    };
    // 页面加载时
    onMounted(() => {
      initTableData();
    });
    /** 重置按钮操作 */
    const resetQuery = (formEl: FormInstance | undefined) => {
      if (!formEl) return
      formEl.resetFields()
      dataList()
    };
    // 多选框选中数据
    const handleSelectionChange = (selection: TableDataRow[]) => {
      state.ids = selection.map(item => item.id)
    };
    return {
      addDicRef,
      EditCateRef,
      queryRef,
      onOpenAddCate,
      onOpenEdit,
      onRowDel,
      dataList,
      resetQuery,
      handleSelectionChange,
      ...toRefs(state),
    };
  },
});
</script>
