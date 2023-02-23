import { defineStore } from 'pinia';
import { UnwrapRef, reactive, UnwrapNestedRefs } from 'vue';
import { BaseDirectory, readTextFile, writeTextFile, exists } from '@tauri-apps/api/fs';

const configFileBaseDirectory = BaseDirectory.AppData;
const configFileName = 'config.json';
export interface TimeConfiguration {
  hours: number;
  minutes: number;
  seconds: number;
}

export interface PomodoroConfiguration {
  pomodoroPeriord: TimeConfiguration;
  restPeriord: TimeConfiguration;
}

export const MINUTE_UNIT = 60;
export const HOUR_UNIT = 60 * MINUTE_UNIT;

export default defineStore('pomodoro-config', () => {
  let initialized = false;
  const pomodoroConfig: UnwrapRef<PomodoroConfiguration> = reactive({
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
  });

  const getConfig = async () => {
    if (!initialized && await exists(configFileName, { dir: configFileBaseDirectory })) {
      return readTextFile(configFileName, { dir: configFileBaseDirectory })
        .then(async (configString) => {
          if (configString && configString !== 'undefined') {
            Object.assign(pomodoroConfig, JSON.parse(configString));
          }

          return Promise.resolve(pomodoroConfig)
        })
        .catch(err => {
          console.error(err);
          return Promise.resolve(pomodoroConfig)
        })
        .finally(() => {
          initialized = true;
        });
    }

    return Promise.resolve(pomodoroConfig)
  };

  const saveConfig = (config: UnwrapNestedRefs<PomodoroConfiguration>) => {
    Object.assign(pomodoroConfig, config);

    return writeTextFile(configFileName, JSON.stringify(pomodoroConfig), { dir: configFileBaseDirectory })
  };

  return { getConfig, saveConfig };
});
