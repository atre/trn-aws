import { Type, Static } from '@sinclair/typebox';

export const ConfigSchema = Type.Object({
  REGION: Type.String(),
  VPC_CIDR: Type.String(),
  SUBSCRIBER_EMAIL_ADDRESSES: Type.String(),
  REMOTE_BACKEND_NAME: Type.String(),
  REMOTE_BACKEND_LOCK_NAME: Type.String(),
  VAULT_TOKEN: Type.String(),
  // GPG_KEY: Type.String(),
});

export type Config = Static<typeof ConfigSchema>