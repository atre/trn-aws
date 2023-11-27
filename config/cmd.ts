import { TypeCompiler } from '@sinclair/typebox/compiler';

import { Config, ConfigSchema } from './config';
import 'dotenv/config';

const data = { ...process.env };

const C = TypeCompiler.Compile(ConfigSchema);

if (!C.Check(data)) {
  const errors = [...C.Errors(ConfigSchema)];
  const uniqueErrors: {[key: string]: string[]} = {};

  errors.forEach((error) => {
    const envVariable = error.path.slice(1);
    if (!uniqueErrors[envVariable]) {
      uniqueErrors[envVariable] = [];
    }
    uniqueErrors[envVariable].push(error.message);
  });

  let errorMessage = '';

  Object.entries(uniqueErrors).forEach(([env, errorMessages]) => {
    errorMessage += `${env}: ${errorMessages.join(', ')}; `;
  });

  throw new Error(`Invalid config: ${errorMessage}`);
}

export const config = data as Config;

