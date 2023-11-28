import { Type, Static } from '@sinclair/typebox';

export const ConfigSchema = Type.Object({
  REGION: Type.String(),
  VPC_CIDR: Type.String(),
  SUBSCRIBER_EMAIL_ADDRESSES: Type.String(),
});

export type Config = Static<typeof ConfigSchema>