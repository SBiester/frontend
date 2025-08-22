import de from '@vueform/vueform/locales/de';
import vueformTheme from '@vueform/vueform/dist/vueform';
import { defineConfig } from '@vueform/vueform';

import '@vueform/vueform/dist/vueform.css';
import './src/assets/custom-toggle.css';

export default defineConfig({
  theme: vueformTheme,
  clearable: true,
  locales: { de },
  locale: 'de',
})
