/**
 * Central export file for all configuration
 */

export * from './constants';
export * from './env';
export * from './translation.config';

import * as constants from './constants';
import * as env from './env';
import * as translationConfig from './translation.config';

export const config = {
  constants,
  env,
  translation: translationConfig
};