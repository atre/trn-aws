import { AwsProvider } from "@cdktf/provider-aws/lib/provider";
import { Fn, TerraformStack } from "cdktf";
import { Construct } from "constructs";
import { config } from "../../../config";
import { DataAwsRoute53Zone } from "@cdktf/provider-aws/lib/data-aws-route53-zone";
import { IamPolicy } from "@cdktf/provider-aws/lib/iam-policy";
import { IamRole } from "@cdktf/provider-aws/lib/iam-role";
import { DataAwsIamPolicyDocument } from "@cdktf/provider-aws/lib/data-aws-iam-policy-document";
import { DataAwsEksCluster } from "@cdktf/provider-aws/lib/data-aws-eks-cluster";
import { IamOpenidConnectProvider } from "@cdktf/provider-aws/lib/iam-openid-connect-provider";
import { DataTlsCertificate } from "@cdktf/provider-tls/lib/data-tls-certificate";
import { TlsProvider } from "@cdktf/provider-tls/lib/provider";
import { IamRolePolicyAttachment } from "@cdktf/provider-aws/lib/iam-role-policy-attachment";

export class CertManagerIAMUserStack extends TerraformStack {
  constructor(scope: Construct, id: string, props: { hostedZoneName: string, clusterName: string}) {
    super(scope, id);

    new AwsProvider(this, 'Aws', {
      region: config.REGION,
    });

    new TlsProvider(this, 'tls-provider');

    const eksCluster = new DataAwsEksCluster(this, 'eks-cluster', {
      name: props.clusterName,
    });

    const hostedZone = new DataAwsRoute53Zone(this, 'route53-hosted-zone', {
      name: props.hostedZoneName
    })

    const certManagerPolicy = new IamPolicy(this, 'cert-manager-policy', {
      name: 'CertManagerPolicy',
      policy: JSON.stringify({
        Version: '2012-10-17',
        Statement: [
          {
            Effect: 'Allow',
            Action: 'route53:GetChange',
            Resource: 'arn:aws:route53:::change/*',
          },
          {
            Effect: 'Allow',
            Action: [
              'route53:ChangeResourceRecordSets',
              'route53:ListResourceRecordSets',
            ],
            Resource: `arn:aws:route53:::hostedzone/${hostedZone.id}`,
          },
          {
            Effect: 'Allow',
            Action: 'route53:ListHostedZonesByName',
            Resource: '*',
          },
        ],
      }),
    });

    const oidcIssuer = eksCluster.identity.get(0).oidc.get(0).issuer;

    const tlsCertificate = new DataTlsCertificate(this, 'tls-certificate', {
      url: oidcIssuer
    });

    const thumbprint = tlsCertificate.certificates.get(0).sha1Fingerprint;

    // TODO Extract creating OIDC provider
    const cluster = new IamOpenidConnectProvider(this, 'oidc-provider', {
      clientIdList: ['sts.amazonaws.com'],
      url: oidcIssuer,
      thumbprintList: [thumbprint]
    });
    
    const oidcUrl = Fn.replace(cluster.url, 'https://', '');

    const certManagerRole = new IamRole(this, 'cert-manager-role', {
      name: "CertManagerIAMRole",
      assumeRolePolicy: new DataAwsIamPolicyDocument(this, 'assume-role-policy', {
        statement: [{
          actions: ["sts:AssumeRoleWithWebIdentity"],
          principals: [{
            type: "Federated",
            identifiers: [cluster.arn],
          }],
          condition: [{
            test: "StringEquals",
            variable: `${oidcUrl}:sub`,
            values: ["system:serviceaccount:default:cert-manager"],
          }],
        }],
      }).json,
    });

    new IamRolePolicyAttachment(this, 'cert-manager-policy-attachment', {
      policyArn: certManagerPolicy.arn,
      role: certManagerRole.name,
    });
  }
}
