import { Helm } from "cdk8s";
import { Construct } from "constructs";
// import * as  fs from 'fs';
// import * as path from 'path';
// import * as os from 'os';
import { KubeNamespace } from "../../imports/k8s";
import { AppProject, Application } from "../../imports/argoproj.io";

export class ArgoCD extends Construct {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    // const privateKeyPath = path.join(os.homedir(), '.ssh', 'id_rsa');

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
              // sshPrivateKey: ''
              // sshPrivateKey: fs.readFileSync(privateKeyPath),
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

   const trnProject = new AppProject(this, 'trn', {
    metadata: {
      name: 'trn',
      namespace: argoCDNamespace.name
    },
    spec: {
      sourceRepos: ['git@github.com:dromix/cicd.git'],
      destinations: [{
        server: 'https://kubernetes.default.svc',
        name: 'in-cluster',
        namespace: '*'
      }],
      clusterResourceWhitelist: [
        {
          group: '*',
          kind: '*'
        }
      ],
      namespaceResourceWhitelist: [
        {
          kind: '*',
          group: '*'
        }
      ]
    }
   })

   new Application(this, 'postgres-application', {
    metadata: {
      name: 'postgres',
      namespace: argoCDNamespace.name
    },
    spec: {
      syncPolicy: {
        automated: {
          prune: true,
          selfHeal: true
        },
        syncOptions: ['CreateNamespace=true']
      },
      source: {
        repoUrl: 'git@github.com:dromix/cicd.git',
        targetRevision: 'HEAD',
        path: 'kubernetes/postgres',
      },
      destination: {
        server: 'https://kubernetes.default.svc',
        namespace: 'db'
      },
      project: trnProject.name
    }
   })

  new Application(this, 'redis-application', {
    metadata: {
      name: 'redis',
      namespace: argoCDNamespace.name
    },
    spec: {
      syncPolicy: {
        automated: {
          prune: true,
          selfHeal: true
        },
        syncOptions: ['CreateNamespace=true']
      },
      source: {
        repoUrl: 'git@github.com:dromix/cicd.git',
        targetRevision: 'HEAD',
        path: 'kubernetes/redis',
      },
      destination: {
        server: 'https://kubernetes.default.svc',
        namespace: 'db'
      },
      project: trnProject.name
    }
   })

  new Application(this, 'management-application', {
    metadata: {
      name: 'management',
      namespace: argoCDNamespace.name
    },
    spec: {
      syncPolicy: {
        automated: {
          prune: true,
          selfHeal: true
        },
        syncOptions: ['CreateNamespace=true']
      },
      source: {
        repoUrl: 'git@github.com:dromix/cicd.git',
        targetRevision: 'HEAD',
        path: 'kubernetes/management',
      },
      destination: {
        server: 'https://kubernetes.default.svc',
        namespace: 'application'
      },
      project: trnProject.name
    }
   })
  }
}