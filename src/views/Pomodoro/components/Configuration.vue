<template>
  <div class="pomodoro-configuration">
    <a-form :model="pomodoroConfig" :labelCol="formItemLayout.labelCol" :wrapperCol="formItemLayout.wrapperCol"
      class="pomodoro-configuration-form">
      <a-form-item label="番茄钟时长">
        <div class="pomodoro-configuration-form-item">
          <a-select v-model:value="pomodoroConfig.pomodoroPeriord.hours" placeholder="时"
            class="pomodoro-configuration-form-item-input">
            <a-select-option v-for="(_, index) in Hours" :key="index" :value="index">{{ index }}</a-select-option>
          </a-select>
          <span class="spliter">:</span>
          <a-select v-model:value="pomodoroConfig.pomodoroPeriord.minutes" placeholder="分"
            class="pomodoro-configuration-form-item-input">
            <a-select-option v-for="(_, index) in Minutes" :key="index" :value="index">{{ index }}</a-select-option>
          </a-select>
          <span class="spliter">:</span>
          <a-select v-model:value="pomodoroConfig.pomodoroPeriord.seconds" placeholder="秒"
            class="pomodoro-configuration-form-item-input">
            <a-select-option v-for="(_, index) in Seconds" :key="index" :value="index">{{ index }}</a-select-option>
          </a-select>
        </div>
      </a-form-item>
      <a-form-item label="间歇时长">
        <div class="pomodoro-configuration-form-item">
          <a-select v-model:value="pomodoroConfig.restPeriord.hours" placeholder="时"
            class="pomodoro-configuration-form-item-input">
            <a-select-option v-for="(_, index) in Hours" :key="index" :value="index">{{ index }}</a-select-option>
          </a-select>
          <span class="spliter">:</span>
          <a-select v-model:value="pomodoroConfig.restPeriord.minutes" placeholder="分"
            class="pomodoro-configuration-form-item-input">
            <a-select-option v-for="(_, index) in Minutes" :key="index" :value="index">{{ index }}</a-select-option>
          </a-select>
          <span class="spliter">:</span>
          <a-select v-model:value="pomodoroConfig.restPeriord.seconds" placeholder="秒"
            class="pomodoro-configuration-form-item-input">
            <a-select-option v-for="(_, index) in Seconds" :key="index" :value="index">{{ index }}</a-select-option>
          </a-select>
        </div>
      </a-form-item>
      <a-form-item class="form-footer-item" :wrapperCol="formItemLayout.footerWrapperCol">
        <check-circle-filled class="check-icon-button" @click="handleSave" />
      </a-form-item>
    </a-form>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive } from 'vue';
import { CheckCircleFilled } from '@ant-design/icons-vue';
import usePomodoroConfigStore from '../store/config';

const { getConfig, saveConfig } = usePomodoroConfigStore();

const Hours = new Array(24).fill(0);
const Minutes = new Array(60).fill(0);
const Seconds = new Array(60).fill(0);

const pomodoroConfig = reactive({
  pomodoroPeriord: {
    hours: 0,
    minutes: 25,
    seconds: 0,
  },
  restPeriord: {
    hours: 0,
    minutes: 5,
    seconds: 0,
  },
})

onMounted(async () => {
  Object.assign(pomodoroConfig, await getConfig())
})

const formItemLayout = {
  labelCol: { style: 'max-width: 100px; display: inline-block;' },
  wrapperCol: { style: 'max-width: calc(100% - 100px); display: inline-block;' },
  footerWrapperCol: { style: 'max-width: 100%; display: inline-block;' }
}

const emits = defineEmits(['ok'])
const handleSave = () => {
  saveConfig(pomodoroConfig)
  .then(() => {
    emits('ok');
  })
  .catch(console.error)
}
</script>

<style lang="scss" scoped>
.pomodoro-configuration {
  height: 200px;

  .pomodoro-configuration-form {
    padding-left: 10px;
    padding-right: 10px;

    .pomodoro-configuration-form-item {
      display: flex;

      .spliter {
        min-width: 12px;
        text-align: center;
      }

      .pomodoro-configuration-form-item-input {
        flex: 1;
      }
    }

    .form-footer-item {
      text-align: right;

      .check-icon-button {
        color: #F68657;
        font-size: 32px;
        cursor: pointer;
      }
    }

    .play-icon {
      font-size: 32px;
      color: #6bdef8;
      cursor: pointer;

      &:hover {
        color: #18c1ff;
      }
    }
  }
}
</style>