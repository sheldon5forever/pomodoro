<template>
  <div class="pomodoro-container">
    <div class="pomodoro-header">
      <setting-filled class="pomodoro-setting-icon" @click="handleOpenConfigDrawer" />
      <a-drawer title="番茄钟配置" placement="right" :closable="false" :visible="configDrawerVisible"
        @close="handleCloseConfigDrawer">
        <Configuration @ok="handleCloseConfigDrawer" />
      </a-drawer>
    </div>
    <div class="pomodoro-body">
      <div class="clock-container">
        <div class="clock">
          <div class="middle"></div>
          <div class="middle1"></div>
          <div ref="hourRef" class="hour"></div>
          <div ref="minuteRef" class="minute"></div>
          <div ref="secondRef" class="second"></div>
        </div>
      </div>
      <div class="pomodoro-menubar">
        <a-button v-if="!runningState.isClockRunning" type="primary" @click="handleRunPomodoroClock">开始</a-button>
        <a-button v-else type="danger" @click="handleStopPomodoroClock">结束</a-button>
      </div>
    </div>
    <div class="pomodoro-footer">
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, reactive, Ref, ref, watch } from 'vue';
import Configuration from './components/Configuration.vue';
import { SettingFilled } from '@ant-design/icons-vue';
import useConfigurationStore, { HOUR_UNIT, MINUTE_UNIT, TimeConfiguration } from './store/config';
import { isPermissionGranted, requestPermission, sendNotification } from '@tauri-apps/api/notification';
let permissionGranted: boolean;

isPermissionGranted().then(() => {
  if (!permissionGranted) {
    requestPermission().then((permission) => {
      permissionGranted = permission === 'granted';
    })
  }
});

enum PeriodType {
  Pomodoro,
  Rest,
}

interface PomodoroRunningState {
  periodType: PeriodType;
  isClockRunning: boolean;
  timer: NodeJS.Timer
}

const configDrawerVisible: Ref<boolean> = ref<boolean>(false);
const { pomodoroConfig } = useConfigurationStore();

const handleCloseConfigDrawer = () => {
  configDrawerVisible.value = false
}

const handleOpenConfigDrawer = () => {
  configDrawerVisible.value = true
}

const hourRef = ref<HTMLElement>()
const minuteRef = ref<HTMLElement>()
const secondRef = ref<HTMLElement>()

onMounted(() => {
  setTime(pomodoroConfig.pomodoroPeriord);
})

/**
 * 修改配置后：
 * 1、停止番茄钟
 * 2、将番茄钟更新至新配置
 */
watch(pomodoroConfig, () => {
  handleStopPomodoroClock();
  setTime(pomodoroConfig.pomodoroPeriord);
})

const setTime = (timeConfig: TimeConfiguration) => {
  const { hours = 0, minutes = 0, seconds = 0 } = timeConfig;

  var hour = Math.max(30 * hours + 6 * minutes / HOUR_UNIT, 0);
  var minute = Math.max(6 * (minutes + seconds / MINUTE_UNIT), 0);
  var second = Math.max(6 * seconds, 0);

  if (hourRef.value && minuteRef.value && secondRef.value) {
    hourRef.value.style.transform = 'rotate(' + hour + 'deg)';
    minuteRef.value.style.transform = 'rotate(' + minute + 'deg)';
    secondRef.value.style.transform = 'rotate(' + second + 'deg)';
  }
}

const runningState = reactive<PomodoroRunningState>({
  periodType: PeriodType.Pomodoro,
  isClockRunning: false,
  timer: setTimeout(() => {}, 0)
});

const tick = (period: TimeConfiguration, timer: NodeJS.Timer) => {
  if (period.seconds === 0) {
    if (period.minutes === 0) {
      if (period.hours === 0) {
        // 倒计时结束
        if (permissionGranted) {
          sendNotification('计时结束');
        }
        return;
      }

      period.hours--;
      period.minutes = 59;
      period.seconds = 59;
    } else {
      period.minutes--;
      period.seconds = 59;
    }
  } else {
    period.seconds--;
  }

  setTime(period)
  
  timer = setTimeout(() => {
    tick(period, timer)
  }, 1000)
}

const run = () => {
  const runningConfig = Object.assign({}, pomodoroConfig);

  const period =
    runningState.periodType === PeriodType.Pomodoro
      ? runningConfig.pomodoroPeriord
      : runningConfig.restPeriord;

  runningState.timer = setTimeout(() => {
    tick(period, runningState.timer)
  }, 1000);
};

const stop = () => {
  if (runningState.timer) {
    clearInterval(runningState.timer)
  }
}

const handleRunPomodoroClock = () => {
  run()
}

const handleStopPomodoroClock = () => {
  stop()
}
</script>

<style lang="scss" scoped>
$orange: #F68657;
$green: #70bd63;
$bg: #f8c985;

.pomodoro-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;

  .pomodoro-header {
    height: 32px;
  }

  .pomodoro-body {
    flex: 1;
  }

  .pomodoro-footer {
    height: 32px;
  }

  .pomodoro-setting-icon {
    font-size: 32px;
    cursor: pointer;
  }

  .clock-container {
    display: flex;
    justify-content: center;
    align-items: center;

    .clock {
      background: $orange;
      width: 50vmin;
      height: 50vmin;
      border-radius: 50%;
      position: relative;

      &:before {
        content: '';
        position: absolute;
        margin: auto;
        width: 3%;
        height: 12%;
        background: $green;
        left: 0;
        right: 0;
        top: -10%;
        z-index: -1;
        transform: rotate(10deg);
      }

      &:after {
        content: '';
        position: absolute;
        margin: auto;
        width: 8%;
        height: 16%;
        background: $green;
        left: 0;
        right: 15%;
        top: -10%;
        z-index: -1;
        transform: rotate(-40deg);
        border-radius: 100% 30% 50% 0;
      }

      .middle1 {
        position: absolute;
        margin: auto;
        left: 0;
        right: 0;
        top: 0;
        bottom: 0;
        width: 5%;
        height: 5%;
        background: darken($orange, 8);
        border-radius: 50%;
        z-index: 1;
      }

      .middle {
        position: absolute;
        margin: auto;
        left: 0;
        right: 0;
        top: 0;
        bottom: 0;
        width: 5%;
        height: 5%;
        background: darken($orange, 10);
        border-radius: 50%;


        &:before {
          content: '';
          position: absolute;
          background: darken($orange, 3);
          width: 80%;
          height: 80%;
          border-radius: 50%;
          left: 400%;
          top: 150%;
          box-shadow: -20vmin -10vmin 0 0 darken($orange, 3),
            -10vmin -24vmin 0 0 darken($orange, 3),
            4vmin 10vmin 0 0 darken($orange, 3),
            -20vmin 14vmin 0 0 darken($orange, 3),
            -30vmin 4vmin 0 0 darken($orange, 3);
        }

        &:after {
          content: '';
          position: absolute;
          background: darken($orange, 3);
          width: 90%;
          height: 90%;
          border-radius: 50%;
          left: 400%;
          top: 150%;
          box-shadow: -26vmin -16vmin 0 0 darken($orange, 3),
            6vmin -14vmin 0 0 darken($orange, 3),
            -10vmin 8vmin 0 0 darken($orange, 3),
            -4vmin 18vmin 0 0 darken($orange, 3),
            12vmin -5vmin 0 0 darken($orange, 3);
        }
      }

      .hour {
        position: absolute;
        margin: auto;
        left: 49%;
        bottom: 50%;
        background: darken($orange, 30);
        width: 2%;
        height: 40%;
        transform: rotate(0);
        transform-origin: 50% 100%;
      }

      .minute {
        @extend .hour;
        transform: rotate(0);
        height: 48%;
        background: darken($orange, 20);
      }

      .second {
        @extend .hour;
        background: lighten($orange, 10);
        width: 1%;
        left: 49.5%;
        transform: rotate(0);
        height: 48%;
      }
    }
  }
}
</style>