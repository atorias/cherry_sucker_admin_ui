<template>
  <div class="system-edit-dic-container">
    <el-dialog :title="(ruleForm.id !== 0 ? '修改' : '添加') + '模板'" v-model="isShowDialog" width="70%">
      <el-form :model="ruleForm" ref="formRef" :rules="rules" size="default" label-width="90px" class="template-form">
        <!-- 第一行：项目名称和分类 -->
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="项目名称:" prop="name">
              <el-input v-model="ruleForm.name" placeholder="请输入项目名称" style="width: 400px" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="项目分类:" prop="cateId">
              <el-select v-model="ruleForm.cateId" placeholder="分类" clearable size="default" style="width: 240px">
                <el-option v-for="(v, k) in cates" :key="k" :label="v.name" :value="v.id" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 第二行：版本和状态 -->
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="版本:" prop="version">
              <el-input v-model="ruleForm.version" placeholder="请输入版本号" style="width: 200px" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="项目主页:" prop="homepage">
              <el-input v-model="ruleForm.homepage" placeholder="请输入项目主页" style="width: 400px" />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 第三行：项目logo和封面 -->
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="项目logo:" prop="logo">
              <div class="logo-container">
                <el-upload class="h100 personal-user-left-upload avatar-uploader"
                  :action="baseURL + '/api/v1/system/file/upload'" 
                  :show-file-list="false" 
                  :on-success="handleAvatarSuccess"
                  :data="dataParam">
                  <img v-if="ruleForm.logo" :src="proxy.getUpFileUrl(ruleForm.logo)" class="avatar" />
                  <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
                </el-upload>
                <el-button 
                  v-if="ruleForm.logo" 
                  type="danger" 
                  :icon="Delete" 
                  circle 
                  class="delete-btn"
                  @click="handleDeleteLogo"
                />
              </div>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="项目封面:" prop="project_screenshots">
              <div class="logo-container">
                <el-upload class="h100 personal-user-left-upload avatar-uploader"
                  :action="baseURL + '/api/v1/system/file/upload'" 
                  :show-file-list="false" 
                  :on-success="handleProjectScreenshotsSuccess"
                  :data="dataParam">
                  <img v-if="ruleForm.project_screenshots" :src="proxy.getUpFileUrl(ruleForm.project_screenshots)" class="avatar" />
                  <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
                </el-upload>
                <el-button 
                  v-if="ruleForm.project_screenshots" 
                  type="danger" 
                  :icon="Delete" 
                  circle 
                  class="delete-btn"
                  @click="handleDeleteProjectScreenShots"
                />
              </div>
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 第四行：项目描述和项目详情 -->
        <el-form-item label="项目描述:" prop="desc">
          <el-input 
            v-model="ruleForm.desc" 
            type="textarea" 
            placeholder="请输入项目描述"
            :rows="3"
            style="width: 100%"
          ></el-input>
        </el-form-item>
        <el-form-item label="项目详情:" prop="introduction">
          <el-input 
            v-model="ruleForm.introduction" 
            type="textarea" 
            placeholder="请输入项目详情"
            :rows="3"
            style="width: 100%"
          ></el-input>
        </el-form-item>

        <!-- 最后一行：yaml配置 -->
        <el-form-item label="yaml配置" prop="content">
          <div class="editor-container">
            <!-- 修改 yaml-editor 组件，移除 @blur 事件 -->
            <yaml-editor 
              v-model="ruleForm.content" 
              :style="{ height: '800px' }"
            />
          </div>
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
import jsyaml from 'js-yaml';
import YamlEditor from '/@/components/YamlEditor/index.vue';

import { javascript } from '@codemirror/lang-javascript'
import { oneDark } from '@codemirror/theme-one-dark'

import type { UploadProps } from 'element-plus'
import { getToken } from "/@/utils/gfast"
import { getCateParams } from "/@/api/biz/cate"
import { Plus, Delete } from '@element-plus/icons-vue'
// import { Plus } from '@element-plus/icons-vue'

interface CateRow {
  id: number;
  name: string;
}

// 1. 在 interface RuleFormState 中添加封面字段
interface RuleFormState {
  id: number;
  name: string;
  desc: string;
  logo: string;
  cateId: number | null;
  content: string;
  version: string;
  introduction: string;
  project_screenshots: string;
  homepage: string;
}
interface DicState {
  isShowDialog: boolean;
  ruleForm: RuleFormState;
  rules: {};
  cates: Array<CateRow> | null
}

export default defineComponent({
  name: 'bizEditTemplate',
  components: {
    YamlEditor,
    Plus,
  },
  setup(props, { emit }) {  // 添加 emit 参数
    const extensions = [javascript(), oneDark]

    // Codemirror EditorView instance ref
    const view = shallowRef()
    const handleReady = (payload: { view: any; }) => {
      view.value = payload.view
    }

    const formRef = ref<HTMLElement | null>(null);
    const { proxy } = <any>getCurrentInstance();
    const baseURL: string | undefined | boolean = import.meta.env.VITE_API_URL
    const maxSize = 1024 * 1024
    const state = reactive<DicState>({
      cates: null,
      isShowDialog: false,
      ruleForm: {
        id: 0,
        name: '',
        desc: '',
        logo: '',
        cateId: null,
        content: '',
        version: '',
        project_screenshots: '',
        introduction: '',
        homepage: ''
      },
      // 修改 state 中的 rules 部分
      rules: {
        name: [
          { required: true, message: "项目名称不能为空" }
        ],
        cateId: [
          { required: true, message: "项目分类不能为空" }
        ],
        version: [
          { required: false, message: "版本号不能为空" }
        ],
        homepage: [
          { required: false, message: "项目主页不能为空" }
        ],
        desc: [
          { required: false, message: "项目描述不能为空" }
        ],
        introduction: [
          { required: false, message: "项目详情不能为空" }
        ],
        content: [
          { required: true, message: "yaml配置不能为空" }
        ],
      },

    });
    const cateList = () => {
      getCateParams({}).then((res: any) => {
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
        desc: '',
        logo: '',
        cateId: null,
        content: '',
        version: '',
        project_screenshots: '',
        introduction: '',
        homepage: ''
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
    // 修改 onSubmit 方法
    const onSubmit = () => {
      const formWrap = unref(formRef) as any;
      if (!formWrap) return;
    
      formWrap.validate((valid: boolean) => {
        if (!valid) {
          ElMessage.error('请填写必填项');
          return;
        }
        
        try {
          if (!state.ruleForm.content) {
            ElMessage.error('yaml配置不能为空');
            return;
          }
          jsyaml.load(state.ruleForm.content);
        } catch (error: any) {
          ElMessage.error('YAML 格式错误: ' + error.message);
          return;
        }
    
        if (state.ruleForm.id !== 0) {
          editTemplate(state.ruleForm).then(() => {
            ElMessage.success('修改成功');
            closeDialog();
            emit('typeList')
          })
        } else {
          addTemplate(state.ruleForm).then(() => {
            ElMessage.success('添加成功');
            closeDialog();
            emit('typeList')
          })
        }
      });
    };

    const handleAvatarSuccess: UploadProps['onSuccess'] = (
      response: any
    ) => {
      if (response.code !== 0) {
        ElMessage.error(response.msg)
        return
      }
      state.ruleForm.logo = response.data.file[0].url
    }
    const handleProjectScreenshotsSuccess: UploadProps['onSuccess'] = (
      response: any
    ) => {
      if (response.code !== 0) {
        ElMessage.error(response.msg)
        return
      }
      state.ruleForm.project_screenshots = response.data.file[0].url
    }

    const beforeAvatarUpload: UploadProps['beforeUpload'] = (rawFile: any) => {
      if (rawFile.size > maxSize) {
        ElMessage.error('Avatar picture size can not exceed ' + maxSize + 'b!')
        return false
      }
      return true
    }


    // 添加 YAML 校验方法
    const validateYaml = () => {
      try {
        if (!state.ruleForm.content) return;
        jsyaml.load(state.ruleForm.content);
        ElMessage.success('YAML 格式正确');
      } catch (error: any) {
        ElMessage.error('YAML 格式错误: ' + error.message);
      }
    };

    // 添加删除 logo 方法
    const handleDeleteLogo = () => {
      state.ruleForm.logo = '';
    };
    // 添加删除 logo 方法
    const handleDeleteProjectScreenShots = () => {
      state.ruleForm.project_screenshots = '';
    };

    return {
      handleAvatarSuccess,
      handleProjectScreenshotsSuccess,
      beforeAvatarUpload,
      openDialog,
      closeDialog,
      onCancel,
      onSubmit,
      handleDeleteLogo,
      handleDeleteProjectScreenShots,
      formRef,
      proxy,
      dataParam,
      baseURL,
      extensions,
      handleReady,
      validateYaml,
      view,
      Delete,
      Plus,  // 添加这行
      defineComponent,
      ...toRefs(state),
    };
  },
});
</script>
<style scoped>
.template-form {
  padding: 20px;
}

.template-form :deep(.el-form-item) {
  margin-bottom: 25px;
}

.template-form :deep(.el-row) {
  margin-bottom: 15px;
}

.avatar-uploader .avatar {
  width: 120px;
  height: 120px;
  display: block;
  object-fit: cover;
}

.logo-container {
  position: relative;
  display: inline-block;
  margin: 10px 0;
}

.avatar-uploader :deep(.el-upload) {
  width: 120px;
  height: 120px;
  border: 2px dashed var(--el-border-color);
  border-radius: 8px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-uploader :deep(.el-upload:hover) {
  border-color: var(--el-color-primary);
}

.el-icon.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 120px;
  height: 120px;
  text-align: center;
  line-height: 120px;
}

.delete-btn {
  position: absolute;
  top: -12px;
  right: -12px;
  padding: 6px;
}

.delete-btn :deep(.el-icon) {
  font-size: 16px;
}

.editor-container {
  width: 100%;
  margin-top: 10px;
}

.editor-container :deep(.cm-editor) {
  width: 100% !important;
  border-radius: 4px;
}

.editor-container :deep(.cm-scroller) {
  width: 100% !important;
}
</style>

.logo-container {
  position: relative;
  display: inline-block;
}

.delete-btn {
  position: absolute;
  top: -10px;
  right: -10px;
  padding: 4px;
}

.delete-btn :deep(.el-icon) {
  font-size: 14px;
}

// 3. 在 setup 中添加相关方法
setup() {
  // ... 其他代码保持不变 ...

  // 重置表单时增加 cover 字段
  const resetForm = () => {
    state.ruleForm = {
      id: 0,
      name: '',
      logo: '',
      project_screenshots: '',  // 新增封面字段
      cateId: null,
      desc: '',
      content: '',
      introduction: '',
      version: '',
      homepage: ''
    }
  };

  // 添加封面上传成功处理方法
  const handleProjectScreenShotsSuccess: UploadProps['onSuccess'] = (
    response: any
  ) => {
    if (response.code !== 0) {
      ElMessage.error(response.msg)
      return
    }
    state.ruleForm.project_screenshots = response.data.file[0].url
  }

  // 添加删除封面方法
  const handleDeleteProjectScreenShots = () => {
    state.ruleForm.project_screenshots = '';
  };

  return {
    // ... 其他返回值保持不变 ...
    // 删除 validateYaml
  };
}