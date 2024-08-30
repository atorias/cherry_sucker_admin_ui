<template>
  <div class="system-edit-dic-container">
    <el-dialog :title="(ruleForm.id !== 0 ? '修改' : '添加') + '模板'" v-model="isShowDialog" width="769px">
      <el-form :model="ruleForm" ref="formRef" :rules="rules" size="default" label-width="90px">
        <el-form-item label="模板名称" prop="name">
          <el-input v-model="ruleForm.name" placeholder="请输入模板名称" />
        </el-form-item>
        <el-form-item label="模板分类" prop="cateId">
          <el-select v-model="ruleForm.cateId" placeholder="分类" clearable size="default" style="width: 240px">
            <el-option v-for="(v, k) in cates" :key="k" :label="v.name" :value="v.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="模板简介" prop="summary">
          <el-input v-model="ruleForm.summary" type="textarea" placeholder="请输入内容"></el-input>
        </el-form-item>
        <el-form-item label="模板logo" prop="logo">
          <el-upload class=" h100 personal-user-left-upload avatar-uploader"
            :action="baseURL + '/api/v1/system/file/upload'" :show-file-list="false" :on-success="handleAvatarSuccess"
            :data="dataParam">
            <img v-if="ruleForm.logo" :src="proxy.getUpFileUrl(ruleForm.logo)" class="avatar" />
            <el-icon v-else class="avatar-uploader-icon"><ele-Plus /></el-icon>

          </el-upload>
        </el-form-item>

        <el-form-item label="详情" prop="introduction">
          <el-input v-model="ruleForm.introduction" type="textarea" placeholder="请输入内容"></el-input>
        </el-form-item>
        <el-form-item label="状态" prop="isEnable">
          <el-radio-group v-model="ruleForm.isEnable">
            <el-radio :label="'Y'">启用</el-radio>
            <el-radio :label="'N'">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="模板内容" prop="content">
          <codemirror v-model="ruleForm.content" placeholder="Code goes here..."
            :style="{ height: '800px', width: '600px' }" :autofocus="true" :indent-with-tab="true" :tab-size="2"
            :extensions="extensions" @ready="handleReady" 
             />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="onCancel" size="default">取 消</el-button>
          <el-button type="primary" @click="onSubmit" size="default">{{ ruleForm.id !== 0 ? '修 改' : '添 加'
            }}</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts">
import { reactive, toRefs, defineComponent, ref, unref, getCurrentInstance, shallowRef } from 'vue';
import { getTemplate, addTemplate, editTemplate } from '/@/api/biz/template';
import { ElMessage } from "element-plus";
import { Codemirror } from 'vue-codemirror'
import { javascript } from '@codemirror/lang-javascript'
import { oneDark } from '@codemirror/theme-one-dark'

import type { UploadProps } from 'element-plus'
import { getToken } from "/@/utils/gfast"
import { getCateParams } from "/@/api/biz/cate";
// import { Plus } from '@element-plus/icons-vue'


interface RuleFormState {
  id: number;
  name: string;
  summary: string;
  logo: string;
  cateId: number;
  content: string;
  introduction: string;
  isEnable: string;
}
interface DicState {
  isShowDialog: boolean;
  ruleForm: RuleFormState;
  rules: {}
}

export default defineComponent({
  name: 'bizEditTemplate',
  components: {
    Codemirror
  },
  setup(prop, { emit }) {
    const extensions = [javascript(), oneDark]

    // Codemirror EditorView instance ref
    const view = shallowRef()
    const handleReady = (payload) => {
      view.value = payload.view
    }

    const formRef = ref<HTMLElement | null>(null);
    const { proxy } = <any>getCurrentInstance();
    const baseURL: string | undefined | boolean = import.meta.env.VITE_API_URL
    const maxSize = 1024 * 1024
    const state = reactive<DicState>({
      cates: [],
      isShowDialog: false,
      ruleForm: {
        id: 0,
        name: '',
        summary: '',
        logo: '',
        cateId: '',
        content: '',
        introduction: '',
        isEnable: ''
      },
      rules: {
        name: [
          { required: true, message: "名称不能为空", trigger: "blur" }
        ],
        summary: [
          { required: true, message: "简介不能为空", trigger: "blur" }
        ],
        cateId: [
          { required: true, message: "类型不能为空", trigger: "blur" }
        ],
        content: [
          { required: true, message: "内容不能为空", trigger: "blur" }
        ],
        introduction: [
          { required: true, message: "详情不能为空", trigger: "blur" }
        ],
        isEnable: [
          { required: true, message: "分类必须选择", trigger: "blur" }
        ],
      },

    });
    const cateList = () => {
      getCateParams().then((res: any) => {
        state.cates = res.data.cates;
      });
    };

    const dataParam = reactive({
      token: getToken(),
      AllowedTypes: JSON.stringify(['jpg', 'jpeg', 'png']),
      MaxSize: 1024 * 1024,
    })
    // 打开弹窗
    const openDialog = (row: RuleFormState | null) => {
      resetForm();
      cateList();
      if (row) {
        getTemplate({ id: row.id }).then((res: any) => {
          state.ruleForm = res.data.item
        })
        state.ruleForm = row;
      }
      state.isShowDialog = true;
    };
    const resetForm = () => {
      state.ruleForm = {
        id: 0,
        name: '',
        summary: '',
        logo: '',
        cateId: '',
        content: '',
        introduction: '',
        isEnable: ''
      }
    };
    // 关闭弹窗
    const closeDialog = () => {
      state.isShowDialog = false;
    };
    // 取消
    const onCancel = () => {
      closeDialog();
    };
    // 新增
    const onSubmit = () => {
      const formWrap = unref(formRef) as any;
      if (!formWrap) return;
      formWrap.validate((valid: boolean) => {
        if (valid) {
          if (state.ruleForm.id !== 0) {
            //修改
            editTemplate(state.ruleForm).then(() => {
              ElMessage.success('修改成功');
              closeDialog(); // 关闭弹窗
              emit('typeList')
            })
          } else {
            //添加
            addTemplate(state.ruleForm).then(() => {
              ElMessage.success('添加成功');
              closeDialog(); // 关闭弹窗
              emit('typeList')
            })
          }
        }
      });
    };

    const handleAvatarSuccess: UploadProps['onSuccess'] = (
      response
    ) => {

      state.ruleForm.logo = response.data.file[0].url
    }

    const beforeAvatarUpload: UploadProps['beforeUpload'] = (rawFile) => {
      if (rawFile.size > maxSize) {
        ElMessage.error('Avatar picture size can not exceed ' + maxSize + 'b!')
        return false
      }
      return true
    }


    return {
      handleAvatarSuccess,
      beforeAvatarUpload,
      openDialog,
      closeDialog,
      onCancel,
      onSubmit,
      formRef,
      proxy,
      dataParam,
      baseURL,
      extensions,
      handleReady,
      ...toRefs(state),
    };
  },
});
</script>
<style scoped>
.avatar-uploader .avatar {
  width: 80px;
  height: 80px;
  display: block;
}
</style>

<style>
.avatar-uploader .el-upload {
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
}

.avatar-uploader .el-upload:hover {
  border-color: var(--el-color-primary);
}

.el-icon.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  text-align: center;
}
</style>