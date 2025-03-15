<template>
    <Codemirror :model-value="modelValue" :style="editorConfig.style" :extensions="editorConfig.extensions"
        @change="codeChange"
        @blur="handleBlur"
    />
</template>
<script lang="ts" setup>
import { Codemirror } from "vue-codemirror"
// 语言和主题也需要安装对应的依赖
import { javascript } from "@codemirror/lang-javascript"
import { yaml } from '@codemirror/lang-yaml'
import { oneDark } from "@codemirror/theme-one-dark"

defineProps({
    modelValue: {
        type: String,
        default: ''
    }
})

const emit = defineEmits(['update:modelValue', 'blur'])

// const lang = { javascript, yaml }['yaml']这行代码没有什么深义，只是个新写法，也可以不要
// 然后extensions: [lang(), oneDark]这里 lang()直接写对应的语言yaml()或者javascript()这种就行
const lang = { javascript, yaml }['yaml']
const editorConfig = {
    style: {
        height: '350px',
        width: '100%',
        fontSize: '12px'
    },
    extensions: [lang(), oneDark]
}

const codeChange = (newVal: any) => {
    emit('update:modelValue', newVal)
}

const handleBlur = () => {
    emit('blur')
}
</script>
<style scoped></style>