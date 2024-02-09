import { Helm } from "cdk8s";
import { Construct } from "constructs";
import { config } from 'dotenv';
import { KubeNamespace } from "../../imports/k8s";
import { AppProject, Application } from "../../imports/argoproj.io";

config();

export class ArgoCD extends Construct {
  constructor(scope: Construct, id: string) {
    super(scope, id);

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
              sshPrivateKey: process.env.sshKey ?? ''
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

  new Application(this, 'ui-application', {
    metadata: {
      name: 'ui',
      namespace: argoCDNamespace.name,
    },
    spec: {
      info: [{
        name: 'application',
        value: 'frontend'
      }],
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
        path: 'kubernetes/ui',
      },
      destination: {
        server: 'https://kubernetes.default.svc',
        namespace: 'application'
      },
      project: trnProject.name
    }
   })

  new Application(this, 'entry-application', {
    metadata: {
      name: 'entry',
      namespace: argoCDNamespace.name,
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
        path: 'kubernetes/entry',
      },
      destination: {
        server: 'https://kubernetes.default.svc',
        namespace: 'application'
      },
      project: trnProject.name
    }
   })

  new Application(this, 'rabbitmq-application', {
    metadata: {
      name: 'rabbitmq',
      namespace: argoCDNamespace.name,
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
        path: 'kubernetes/rabbitmq',
      },
      destination: {
        server: 'https://kubernetes.default.svc',
        namespace: 'message-broker'
      },
      project: trnProject.name
    }
   })

  new Application(this, 'logic-application', {
    metadata: {
      name: 'logic',
      namespace: argoCDNamespace.name,
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
        path: 'kubernetes/logic',
      },
      destination: {
        server: 'https://kubernetes.default.svc',
        namespace: 'application'
      },
      project: trnProject.name
    }
   })

  new Application(this, 'storage-application', {
    metadata: {
      name: 'storage',
      namespace: argoCDNamespace.name,
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
        path: 'kubernetes/storage',
      },
      destination: {
        server: 'https://kubernetes.default.svc',
        namespace: 'application'
      },
      project: trnProject.name
    }
   })

  new Application(this, 'prometheus-application', {
    metadata: {
      name: 'prometheus',
      namespace: argoCDNamespace.name,
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
        path: 'kubernetes/prometheus',
      },
      destination: {
        server: 'https://kubernetes.default.svc',
        namespace: 'monitoring'
      },
      project: trnProject.name
    }
   })

  new Application(this, 'grafana-application', {
    metadata: {
      name: 'grafana',
      namespace: argoCDNamespace.name,
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
        path: 'kubernetes/grafana',
      },
      destination: {
        server: 'https://kubernetes.default.svc',
        namespace: 'monitoring'
      },
      project: trnProject.name
    }
   })

  new Application(this, 'traefik-application', {
    metadata: {
      name: 'traefik',
      namespace: argoCDNamespace.name,
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
        path: 'kubernetes/traefik',
      },
      destination: {
        server: 'https://kubernetes.default.svc',
        namespace: 'traefik'
      },
      project: trnProject.name
    }
   })

  new Application(this, 'certificate-application', {
    metadata: {
      name: 'certificate',
      namespace: argoCDNamespace.name,
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
        path: 'kubernetes/certificate',
      },
      destination: {
        server: 'https://kubernetes.default.svc',
        namespace: 'security'
      },
      project: trnProject.name
    }
   })
  }
}