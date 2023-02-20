import { createApp } from 'vue';
import { createPinia } from 'pinia';
import './style.css';
import App from './App.vue';
import AntV from 'ant-design-vue';
import 'ant-design-vue/dist/antd.css';

import './main.scss';

const app = createApp(App);

app.use(AntV).use(createPinia()).mount('#app');
