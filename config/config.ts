import { Type, Static } from '@sinclair/typebox';

export const ConfigSchema = Type.Object({
  REGION: Type.String(),
  VPC_CIDR: Type.String(),
});

export type Config = Static<typeof ConfigSchema>