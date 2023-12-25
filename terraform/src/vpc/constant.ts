import { Fn } from 'cdktf';

export const VPC_CIDR = '10.0.0.0/16';
const newSubnetBits = 8;

export const PRIVATE_SUBNETS = [
  Fn.cidrsubnet(VPC_CIDR, newSubnetBits, 1),
  Fn.cidrsubnet(VPC_CIDR, newSubnetBits, 3),
  Fn.cidrsubnet(VPC_CIDR, newSubnetBits, 5),
];

export const PUBLIC_SUBNETS = [
  Fn.cidrsubnet(VPC_CIDR, newSubnetBits, 2),
  Fn.cidrsubnet(VPC_CIDR, newSubnetBits, 4),
  Fn.cidrsubnet(VPC_CIDR, newSubnetBits, 6),
];