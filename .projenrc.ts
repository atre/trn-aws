import { cdktf } from 'projen';
const project = new cdktf.ConstructLibraryCdktf({
  author: 'Serhii Kaliuzhnyi',
  authorAddress: 'kayuzhni.sergei@gmail.com',
  cdktfVersion: '^0.13.0',
  defaultReleaseBranch: 'main',
  jsiiVersion: '~5.0.0',
  name: 'trn-aws',
  projenrcTs: true,
  repositoryUrl: 'git@github.com:atre/trn-aws.git',

  // deps: [],                /* Runtime dependencies of this module. */
  // description: undefined,  /* The description is just a string that helps people understand the purpose of the package. */
  // devDeps: [],             /* Build dependencies for this module. */
  // packageName: undefined,  /* The "name" in package.json. */
});
project.synth();