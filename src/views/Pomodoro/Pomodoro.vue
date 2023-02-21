<template>
  <div class="pomodoro-container">
    <div class="pomodoro-header">
      <setting-filled class="pomodoro-setting-icon" @click="handleOpenConfigDrawer" />
      <a-drawer
        title="番茄钟配置"
        placement="top"
        height="256"
        headerStyle="background-color: #fae9be; border-bottom-color: #F68657;"
        :drawerStyle="drawerStyle"
        :closable="false"
        :visible="configDrawerVisible"
        @close="handleCloseConfigDrawer"
      >
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
    </div>
    <div class="pomodoro-footer">
      <div class="pomodoro-menubar">
        <play-circle-filled v-if="runningState.clockState === ClockState.STOPPED" class="operation-buttons primary" @click="handleRunPomodoroClock" />
        <pause-circle-filled v-if="runningState.clockState === ClockState.RUNNING" class="operation-buttons default" @click="handlePausePomodoroClock" />
        <play-circle-filled v-if="runningState.clockState === ClockState.PAUSED" class="operation-buttons primary" @click="handleRestorePomodoroClock" />
        <span class="anticon operation-buttons primary"><StopSVG v-if="runningState.clockState !== ClockState.STOPPED" @click="handleStopPomodoroClock" /></span>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, reactive, Ref, ref } from 'vue';
import Configuration from './components/Configuration.vue';
import { SettingFilled, PlayCircleFilled, PauseCircleFilled } from '@ant-design/icons-vue';
import useConfigurationStore, { HOUR_UNIT, MINUTE_UNIT, PomodoroConfiguration, TimeConfiguration } from './store/config';
import { isPermissionGranted, requestPermission, sendNotification } from '@tauri-apps/api/notification';

import StopSVG from '@/assets/stop-recording-fill.svg';
import NotificationIcon from '@/assets/alarm-clock-alarm-clock-that-sounds-loudly-morning-wake-up-from-bed_68708-935.png';

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

enum ClockState {
  STOPPED,
  RUNNING,
  PAUSED
}

interface PomodoroRunningState {
  periodType: PeriodType;
  clockState: ClockState;
  timer: NodeJS.Timer
}

const configDrawerVisible: Ref<boolean> = ref<boolean>(false);
const { getConfig } = useConfigurationStore();
let period: TimeConfiguration
const drawerStyle = {
  backgroundColor: '#fae9be'
}

const handleCloseConfigDrawer = () => {
  configDrawerVisible.value = false
}

const handleOpenConfigDrawer = () => {
  configDrawerVisible.value = true
}

let pomodoroConfig: PomodoroConfiguration;
onMounted(() => {
  getConfig().then((config: PomodoroConfiguration) => {
    pomodoroConfig = config;
    setTime(pomodoroConfig.pomodoroPeriord);
  })
})

const hourRef = ref<HTMLElement>()
const minuteRef = ref<HTMLElement>()
const secondRef = ref<HTMLElement>()
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
  clockState: ClockState.STOPPED,
  timer: setTimeout(() => { }, 0)
});

const nextPeriod = () => {
  if (runningState.periodType === PeriodType.Pomodoro) {
    runningState.periodType = PeriodType.Rest
  } else {
    runningState.periodType = PeriodType.Pomodoro
  }

  runningState.clockState = ClockState.STOPPED;

  const runningConfig = JSON.parse(JSON.stringify(pomodoroConfig));
  period =
    runningState.periodType === PeriodType.Pomodoro
      ? runningConfig.pomodoroPeriord
      : runningConfig.restPeriord;

  if (runningState.timer) {
    clearTimeout(runningState.timer)
  }
  setTimeout(() => {
    setTime(period)
  }, 1000)
}

const countDown = (period: TimeConfiguration) => {
  if (period.seconds === 0) {
    if (period.minutes === 0) {
      if (period.hours === 0) {
        // 倒计时结束
        if (permissionGranted) {
          sendNotification({
            icon: NotificationIcon,
            body: runningState.periodType === PeriodType.Pomodoro ? '番茄钟时间结束，开始休息' : '休息结束',
            title: '时间到'
          });
        }

        nextPeriod();
        return false;
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

  return true;
}

const tick = (period: TimeConfiguration, timer: NodeJS.Timer) => {
  if (runningState.clockState !== ClockState.RUNNING) {
    if (timer) {
      clearTimeout(timer);
    }
    return;
  }
  const timeLeft = countDown(period);

  setTime(period);

  if (timeLeft) {
    timer = setTimeout(() => {
      tick(period, timer)
    }, 1000)
  }
}

const handleRunPomodoroClock = () => {
  const runningConfig = JSON.parse(JSON.stringify(pomodoroConfig));

  period =
    runningState.periodType === PeriodType.Pomodoro
      ? runningConfig.pomodoroPeriord
      : runningConfig.restPeriord;

  runningState.timer = setTimeout(() => {
    tick(period, runningState.timer)
  }, 1000);

  runningState.clockState = ClockState.RUNNING
};

const handlePausePomodoroClock = () => {
  if (runningState.timer) {
    clearTimeout(runningState.timer)
  }

  runningState.clockState = ClockState.PAUSED
}

const handleRestorePomodoroClock = () => {
  runningState.clockState = ClockState.RUNNING;

  if (period) {
    runningState.timer = setTimeout(() => {
      tick(period, runningState.timer)
    }, 1000);
  }
}

const reset = () => {
  Object.assign(runningState, {
    periodType: PeriodType.Pomodoro,
    clockState: ClockState.STOPPED,
    timer: setTimeout(() => { }, 0)
  })

  setTime(pomodoroConfig.pomodoroPeriord);
}

const handleStopPomodoroClock = () => {
  if (runningState.timer) {
    clearTimeout(runningState.timer)
  }

  reset();
}
</script>

<style lang="scss" scoped>
$orange: #F68657;
$green: #70bd63;
$bg: #fae9be;

.pomodoro-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;

  .pomodoro-header {
    height: 48px;
    position: relative;
  }

  .pomodoro-body {
    flex: 1;
    max-height: 300px;
  }

  .pomodoro-footer {
    height: 48px;
  }

  .pomodoro-setting-icon {
    font-size: 24px;
    cursor: pointer;
    position: absolute;
    right: 10px;
    top: 12px;
    color: $orange;
  }

  .clock-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;

    .clock {
      background: $orange;
      width: 60vmin;
      height: 60vmin;
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

  .pomodoro-menubar {
    .operation-buttons {
      margin: 6px;
      font-size: 36px;
      cursor: pointer;
      vertical-align: middle;

      &.primary {
        color: $orange;
      }

      &.default {
        color: $green;
      }
    }
  }
}</style>