<template>
  <div class="system-dic-container">
    <el-card shadow="hover">
      <div class="system-user-search mb15">
        <el-form :model="tableData.param" ref="queryRef" :inline="true" label-width="68px">
          <el-form-item label="关键词" prop="keyword">
            <el-input v-model="tableData.param.keyword" placeholder="请输入名称/简介/详情" clearable size="default"
              style="width: 240px" @keyup.enter.native="dataList" />
          </el-form-item>
          <el-form-item label="分类" prop="cateId" style="width: 200px;">
            <el-select v-model="tableData.param.cateId" placeholder="分类" clearable size="default"
              style="width: 240px">
              <el-option v-for="(v,k) in cates" :key="k" :label="v.name" :value="v.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="状态" prop="isEnable" style="width: 200px;">
            <el-select v-model="tableData.param.isEnable" placeholder="状态" clearable size="default"
              style="width: 240px">
              <el-option label="启用" :value="'Y'" />
              <el-option label="禁用" :value="'N'" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button size="default" type="primary" class="ml10" @click="dataList">
              <el-icon>
                <ele-Search />
              </el-icon>
              查询
            </el-button>
            <el-button size="default" @click="resetQuery(queryRef)">
              <el-icon>
                <ele-Refresh />
              </el-icon>
              重置
            </el-button>
            <el-button size="default" type="success" class="ml10" @click="onOpenAddDic">
              <el-icon>
                <ele-FolderAdd />
              </el-icon>
              新增模板
            </el-button>
            <el-button size="default" type="danger" class="ml10" @click="onRowDel(null)">
              <el-icon>
                <ele-Delete />
              </el-icon>
              删除模板
            </el-button>
          </el-form-item>
        </el-form>
      </div>
      <el-table :data="tableData.data" style="width: 100%" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="ID" align="center" prop="id" width="120" />
        <el-table-column label="名称" align="center" prop="name" :show-overflow-tooltip="true" />
        <el-table-column label="分类" align="center" prop="cate.name" :show-overflow-tooltip="true" />
        <el-table-column label="简介" align="center" prop="summary" :show-overflow-tooltip="true" />
        <el-table-column label="详情" align="center" prop="introduction" :show-overflow-tooltip="true" />
        <el-table-column label="logo" align="center" prop="logo" :show-overflow-tooltip="true">
          <template #default="scope">
            <el-image style="width: 40px;" v-if="scope.row.logo" :src="scope.row.logo" alt="string"></el-image>
          </template>
        </el-table-column>
        <el-table-column prop="isEnable" label="模板状态" show-overflow-tooltip>
          <template #default="scope">
            <el-tag type="success" v-if="scope.row.isEnable === 'Y'">启用</el-tag>
            <el-tag type="info" v-else>禁用</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" show-overflow-tooltip width="180"></el-table-column>
        <el-table-column label="操作" width="200">
          <template #default="scope">
            <el-button size="small" text type="primary" @click="onOpenEdit(scope.row)">修改</el-button>
            <el-button size="small" text type="primary" @click="onRowDel(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <pagination v-show="tableData.total > 0" :total="tableData.total" v-model:page="tableData.param.pageNum"
        v-model:limit="tableData.param.pageSize" @pagination="dataList" />
    </el-card>
    <EditTemplate ref="EditTemplateRef" @typeList="dataList" />
  </div>
</template>

<script lang="ts">
import { toRefs, reactive, onMounted, ref, defineComponent } from 'vue';
import { ElMessageBox, ElMessage, FormInstance } from 'element-plus';
import EditTemplate from '/@/views/biz/template/component/editTemplate.vue';
import { deleteTemplate, getTemplateList } from "/@/api/biz/template";
import { getCateParams } from "/@/api/biz/cate";


// 定义接口来定义对象的类型
interface TableDataRow {
  id: number;
  name: string;
  cateId: number;
  isEnable: string;
  summary: string;
  content: string;
  logo: string;
  createdAt: string;
}
interface TableDataState {
  ids: number[];
  tableData: {
    data: Array<TableDataRow>;
    total: number;
    loading: boolean;
    param: {
      pageNum: number;
      pageSize: number;
      keyword: string;
      cateId: number;
      isEnable: string;
    };
  };
}

export default defineComponent({
  name: 'systemDic',
  components: { EditTemplate },
  setup() {
    const addDicRef = ref();
    const EditTemplateRef = ref();
    const queryRef = ref();
    const state = reactive<TableDataState>({
      ids: [],
      tableData: {
        data: [],
        total: 0,
        loading: false,
        param: {
          pageNum: 1,
          pageSize: 10,
          keyword: '',
          isEnable: '',
          cateId: '',
        },
      },
      cates: [],
    });
    // 初始化表格数据
    const initTableData = () => {
      cateList()
      dataList()
    };
    const dataList = () => {
      getTemplateList(state.tableData.param).then((res: any) => {
        state.tableData.data = res.data.templates;
        state.tableData.total = res.data.total;
      });
    };
    const cateList = () => {
      getCateParams({}).then((res: any) => {
        state.cates = res.data.cates;
      });
    };
    // 打开新增字典弹窗
    const onOpenAddDic = () => {
      EditTemplateRef.value.openDialog();
    };
    // 打开修改字典弹窗
    const onOpenEdit = (row: TableDataRow) => {
      EditTemplateRef.value.openDialog(row);
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
          deleteTemplate({ids: ids}).then(() => {
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
      EditTemplateRef,
      queryRef,
      onOpenAddDic,
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
