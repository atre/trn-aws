import { Fn, TerraformStack } from "cdktf";
import { Construct } from "constructs";
import { config } from "../../../config";
import { DataAwsEksCluster } from "@cdktf/provider-aws/lib/data-aws-eks-cluster";
import { AwsProvider } from "@cdktf/provider-aws/lib/provider";
import { IamPolicy } from "@cdktf/provider-aws/lib/iam-policy";
import { IamRole } from "@cdktf/provider-aws/lib/iam-role";
import { DataAwsIamPolicyDocument } from "@cdktf/provider-aws/lib/data-aws-iam-policy-document";
import { IamRolePolicyAttachment } from "@cdktf/provider-aws/lib/iam-role-policy-attachment";
import { TlsProvider } from "@cdktf/provider-tls/lib/provider";
import { DataAwsIamOpenidConnectProvider } from "@cdktf/provider-aws/lib/data-aws-iam-openid-connect-provider";

export class ExternalDnsIAMRoleStack extends TerraformStack {
  constructor(scope: Construct, id: string, props: { clusterName: string }) {
    super(scope, id);

    new AwsProvider(this, 'Aws', {
      region: config.REGION,
    });

    new TlsProvider(this, 'tls-provider');

    const eksCluster = new DataAwsEksCluster(this, 'eks-cluster', {
      name: props.clusterName,
    });

    const oidcIssuer = eksCluster.identity.get(0).oidc.get(0).issuer;

    const oidcProvider = new DataAwsIamOpenidConnectProvider(this, 'oidc-provider', {
      url: oidcIssuer
    })

    const oidcUrl = Fn.replace(oidcProvider.url, 'https://', '');

    // ExternalDNS IAM Policy
    const externalDnsPolicy = new IamPolicy(this, 'external-dns-policy', {
      name: 'ExternalDNSPolicy',
      policy: JSON.stringify({
        Version: "2012-10-17",
        Statement: [{
          Effect: "Allow",
          Action: [
            "route53:ChangeResourceRecordSets",
            "route53:ListResourceRecordSets",
            "route53:ListHostedZones",
            "route53:ListHostedZonesByName"
          ],
          Resource: [
            "arn:aws:route53:::hostedzone/*"
          ]
        }]
      }),
    });

    // ExternalDNS IAM Role
    const externalDnsRole = new IamRole(this, 'external-dns-role', {
      name: "ExternalDnsRole",
      assumeRolePolicy: new DataAwsIamPolicyDocument(this, 'external-dns-assume-role-policy', {
        statement: [{
          actions: ["sts:AssumeRoleWithWebIdentity"],
          principals: [{
            type: "Federated",
            identifiers: [oidcProvider.arn],
          }],
          condition: [{
            test: "StringEquals",
            variable: `${oidcUrl}:sub`,
            values: ["system:serviceaccount:kube-system:external-dns"],
          },
          {
            test: "StringEquals",
            variable: `${oidcUrl}:aud`,
            values: ["sts.amazonaws.com"],
          }],
        }],
      }).json,
    });

    new IamRolePolicyAttachment(this, 'external-dns-policy-attachment', {
      policyArn: externalDnsPolicy.arn,
      role: externalDnsRole.name,
    });
  }
}
