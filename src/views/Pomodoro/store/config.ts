import { defineStore } from 'pinia';
import { UnwrapRef, reactive, UnwrapNestedRefs } from 'vue';

export interface TimeConfiguration {
  hours: number
  minutes: number
  seconds: number
}

export interface PomodoroConfiguration {
  pomodoroPeriord: TimeConfiguration
  restPeriord: TimeConfiguration
}

export const MINUTE_UNIT = 60;
export const HOUR_UNIT = 60 * MINUTE_UNIT;

export default defineStore('pomodoro-config', () => {
  const pomodoroConfig: UnwrapRef<PomodoroConfiguration> = reactive({
    pomodoroPeriord: {
      hours: 0,
      minutes: 25,
      seconds: 0
    },
    restPeriord: {
      hours: 0,
      minutes: 5,
      seconds: 0
    }
  });

  const saveConfig = (config: UnwrapNestedRefs<PomodoroConfiguration>) => {
    Object.assign(pomodoroConfig, config)
  }

  return { pomodoroConfig, saveConfig }
})