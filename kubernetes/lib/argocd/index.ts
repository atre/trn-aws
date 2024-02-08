import { Helm } from "cdk8s";
import { Construct } from "constructs";
import * as  fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { KubeNamespace } from "../../imports/k8s";
import { Application } from "../../imports/argoproj.io";

export class ArgoCD extends Construct {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    const privateKeyPath = path.join(os.homedir(), '.ssh', 'id_rsa');

    const argoCDNamespace = new KubeNamespace(this, 'argocd-namespace', {
      metadata: {
        name: 'argocd'
      }
    });

   new Helm(this, 'argocd', {
      chart: 'argo-cd',
      repo: 'https://argoproj.github.io/argo-helm',
      namespace: argoCDNamespace.name,
      values: {
        configs: {
          credentialTemplates: {
            'ssh-creds': {
              url: 'git@github.com:dromix/cicd.git',
              sshPrivateKey: fs.readFileSync(privateKeyPath),
            }
          },
          repositories: {
            'private-repo': {
              url: 'git@github.com:dromix/cicd.git'
            }
          }
        }
      }
   });

   new Application(this, 'argocd-application', {
    metadata: {
      name: 'db',
      namespace:'db'
    },
    spec: {
      syncPolicy: {
        automated: {
          prune: true,
          selfHeal: true
        }
      },
      source: {
        repoUrl: 'git@github.com:dromix/cicd.git',
        targetRevision: 'HEAD',
        path: 'kubernetes',
      },
      destination: {
        server: 'https://kubernetes.default.svc',
        namespace: 'db'
      },
      project: "default"
    }
   })
  }
}