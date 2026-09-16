import type { Env } from './types';

export type AppEnv = {
  Bindings: Env;
  Variables: {
    deviceId: string;
    admin?: { id: number; username: string };
  };
};
