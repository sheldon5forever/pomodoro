<template>
  <div class="pomodoro-configuration">
    <a-form :model="pomodoroConfig" :labelCol="formItemLayout.labelCol" :wrapperCol="formItemLayout.wrapperCol" class="pomodoro-configuration-form">
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
    </a-form>
  </div>
</template>

<script setup lang="ts">
import usePomodoroConfigStore from '../store/config';

const { pomodoroConfig } = usePomodoroConfigStore();

const Hours = new Array(24).fill(0);
const Minutes = new Array(60).fill(0);
const Seconds = new Array(60).fill(0);

const formItemLayout = {
  labelCol: { style: 'max-width: 100px; display: inline-block;' },
  wrapperCol: { style: 'max-width: calc(100% - 100px); display: inline-block;' },
}
</script>

<style lang="scss" scoped>
.pomodoro-configuration {
  height: 150px;

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