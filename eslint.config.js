module.exports = [
  {
    files: ['js/**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'script',
      globals: {
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        console: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        fetch: 'readonly',
        AbortController: 'readonly',
        Intl: 'readonly',
        CONFIG: 'readonly',
        TIME_MS: 'readonly',
        AI_ERROR: 'readonly',
        DEMO: 'readonly',
        GeminiClient: 'readonly',
        UIHelpers: 'readonly',
        EventData: 'readonly',
        Planner: 'readonly',
        BudgetMgr: 'readonly'
      }
    },
    linterOptions: {
      reportUnusedDisableDirectives: 'off'
    },
    rules: {
      'strict': ['error', 'global'],
      'no-var': 'error',
      'prefer-const': 'error',
      'eqeqeq': ['error', 'always'],
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',
      'no-console': ['warn', { allow: ['warn', 'error', 'info'] }],
      'no-unused-vars': ['error', { vars: 'local', args: 'after-used' }],
      'max-lines-per-function': ['error', { max: 65, skipBlankLines: true, skipComments: true }],
      'curly': 'error',
      'no-throw-literal': 'error',
      'prefer-template': 'error',
      'no-param-reassign': ['error', { props: false }],
      'consistent-return': 'error'
    }
  },
  {
    files: ['tests/**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'script',
      globals: {
        console: 'readonly',
        process: 'readonly',
        require: 'readonly',
        Intl: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly'
      }
    },
    rules: {
      'strict': ['error', 'global'],
      'no-var': 'error',
      'prefer-const': 'error',
      'eqeqeq': ['error', 'always'],
      'curly': 'error',
      'prefer-template': 'error'
    }
  }
];
