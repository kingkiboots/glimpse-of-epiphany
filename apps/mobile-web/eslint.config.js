// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from "eslint-plugin-storybook";

import { defineConfig } from "eslint/config";
import sharedConfig from "@packages/config/eslint";

export default defineConfig([...sharedConfig, ...storybook.configs["flat/recommended"]]);
