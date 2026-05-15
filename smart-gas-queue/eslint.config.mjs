import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';

/** @type {import('eslint').Linter.Config[]} */
const eslintConfig = [
  { ignores: ['.next/**', 'node_modules/**', 'out/**'] },
  ...nextCoreWebVitals,
  {
    rules: {
      // React 19 / Compiler rules — too noisy for this codebase; keep classic hooks checks only.
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/static-components': 'off',
      'react-hooks/immutability': 'off',
      'react-hooks/incompatible-library': 'off',
    },
  },
];

export default eslintConfig;
