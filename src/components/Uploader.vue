<template>
  <div class="uploader">
    <template v-if="!previewHtml && !croppedInfo">
      <div class="el-upload">
        <div class="el-upload-dragger"
             :class="{'is-dragover': dragover}"
             @click="handleClick"
             @drop.prevent="handleDrop"
             @dragover.prevent="handleDragOver"
             @dragleave.prevent="dragover = false"
        >
          <i class="el-icon-upload"></i>
          <div class="el-upload__text">Drop files here or<em data-v-7d622f5c="">click to upload</em></div>
        </div>
        <input ref="input" :accept="accept" type="file" name="file" @change="handleChange" class="el-upload__input">
      </div>
    </template>
    <template v-else-if="!croppedInfo">
      <div class="preview">
        <div v-html="previewHtml"/>
      </div>
    </template>
    <template v-else>
      <div class="preview" :class="{ hover : showPreviewAction }" @mouseover="showPreviewAction = true"
           @mouseout="showPreviewAction = false">
        <div class="show-preview" style="overflow: hidden"
             :style="{ width: croppedInfo.width+'px', height: croppedInfo.height+'px' }">
          <div :style="{ width: croppedInfo.width+'px', height: croppedInfo.height+'px' }">
            <img ref="croppedImage" :src="croppedInfo.url" alt="" @load="onCroppedImageLoaded"/>
            <img ref="croppedImageOriginal" :src="croppedInfo.originUrl" alt="" style="display: none"/>
          </div>
        </div>
        <div class="actions">
          <span class="action" @click="removeCurrentImage">
            <i class="el-icon-delete"></i>
          </span>
        </div>
      </div>
    </template>
    <el-dialog :visible.sync="cropperDialogVisible" title="Crop" append-to-body :close-on-click-modal="false"
               :close-on-press-escape="false" width="600px" :show-close="false" :destroy-on-close="true">
      <cropper ref="cropper" type="64x64" :image="file" @real-time-html="handleRealTimeChange"/>
      <div slot="footer">
        <el-button @click="close">Cancel</el-button>
        <el-button type="primary" @click="submit">Sure</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>

import Cropper from './Cropper'

export default {
  name: 'Uploader',
  components: { Cropper },
  props: {
    accept: {
      type: String,
      required: false,
      default: ''
    }
  },
  data () {
    return {
      disabled: false,
      dragover: false,
      file: null,
      cropperDialogVisible: false,
      cropperType: '1',
      previewHtml: null,
      croppedInfo: null,
      showPreviewAction: false
    }
  },
  watch: {
    file (val) {
      if (val) {
        this.cropperDialogVisible = true
      }
    }
  },
  methods: {
    // ??????
    submit () {
      this.$refs.cropper.crop()
        .then(info => {
          this.croppedInfo = info
          this.file = null
          this.cropperDialogVisible = false
        })
    },
    // ??????
    close () {
      this.cropperDialogVisible = false
      this.croppedInfo = null
      this.file = null
      this.$emit('close')
    },
    adjustCroppedInfoUrl (url) {
      this.croppedInfo.url = url
    },
    // ????????????????????????
    onCroppedImageLoaded () {
      this.$store.dispatch('app/setCroppedImageInfo', {
        el: this.$refs.croppedImage,
        originEl: this.$refs.croppedImageOriginal,
        originUrl: this.croppedInfo.originUrl,
        scaleWidth: this.croppedInfo.width,
        scaleHeight: this.croppedInfo.height,
        width: this.croppedInfo.originWidth,
        height: this.croppedInfo.originHeight
      })
    },
    // ??????????????????
    removeCurrentImage () {
      this.croppedInfo = null
      this.$store.dispatch('app/setCroppedImageInfo', null)
    },
    // ??????????????????
    handleRealTimeChange (html) {
      this.previewHtml = html
    },
    // ??????????????????
    handleFileChange (file) {
      if (file) {
        this.file = URL.createObjectURL(file)
        URL.revokeObjectURL(file)
      } else {
        this.file = null
      }
    },
    // ????????????
    handleClick () {
      if (!this.disabled) {
        this.$refs.input.value = null
        this.$refs.input.click()
      }
    },
    // input value change
    handleChange (e) {
      const files = e.target.files
      if (!files) return
      this.handleFileChange(files[0])
    },
    // ??????
    handleDragOver () {
      if (!this.disabled) {
        this.dragover = true
      }
    },
    // ????????????
    handleDrop (e) {
      this.dragover = false
      if (!this.accept) {
        this.handleFileChange(e.dataTransfer.files[0])
        return
      }
      this.handleFileChange([].slice.call(e.dataTransfer.files).filter(file => {
        const {
          type,
          name
        } = file
        const extension = name.indexOf('.') > -1
          ? `.${name.split('.').pop()}`
          : ''
        const baseType = type.replace(/\/.*$/, '')
        return this.accept.split(',')
          .map(type => type.trim())
          .filter(type => type)
          .some(acceptedType => {
            if (/\..+$/.test(acceptedType)) {
              return extension === acceptedType
            }
            if (/\/\*$/.test(acceptedType)) {
              return baseType === acceptedType.replace(/\/\*$/, '')
            }
            if (/^[^\/]+\/[^\/]+$/.test(acceptedType)) {
              return type === acceptedType
            }
            return false
          })
      })[0])
    }
  }
}
</script>

<style lang="scss" scoped>
.uploader {
  .el-upload {
    width: 100%;

    .el-upload-dragger {
      width: 100%;
    }
  }

  .preview {
    min-height: 192px;
    border: 1px solid rgb(217, 217, 217);
    border-radius: 6px;

    ::v-deep {
      .show-preview {
        margin: 0 auto;

        img {
          width: 100%;
          height: 100%;
        }
      }
    }

    .actions {
      position: absolute;
      width: 100%;
      height: 100%;
      left: 0;
      top: 0;
      cursor: default;
      text-align: center;
      color: #fff;
      border-radius: 6px;
      opacity: 0;
      font-size: 20px;
      background-color: rgba(0, 0, 0, .5);
      transition: opacity .3s;
      display: flex;
      align-items: center;
      justify-content: center;

      .action {
        cursor: pointer;
      }
    }

    &.hover {
      .actions {
        opacity: 1;
      }
    }
  }

}
</style>
