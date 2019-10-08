const { resolve, normalize, join, parse } = require('path');
const mdx = require('./transformer');
const react = require('@ofc/transform-react');
const babel = require('rollup-plugin-babel');

const getPlugins = ({ targets }) => {
  return [
    mdx(),
    react(targets),
    babel({
      exclude: 'node_modules/**',
      extensions: ['.md', '.mdx', '.js', '.ts', '.jsx', '.tsx'],
      presets: [
        ['@babel/preset-typescript', { isTSX: true, allExtensions: true }],
        ['@babel/preset-env', { targets }],
        '@babel/preset-react',
      ],
    }),
  ]
}

const plugin = ({ input, production }) => {
  const path = parse(normalize(input))

  const replaceOptions = {
    OFC_REACT_INPUT: input,
    OFC_REACT_ASSET: join(path.dir, path.name + '.js'),
    OFC_REACT_APP: process.env.OFC_REACT_APP || '_ofc_app',
    OFC_REACT_PROPS: process.env.OFC_REACT_PROPS || '_ofc_props',
  }

  const namedExportOptions = {
    'node_modules/react/index.js': [
      'createRef',
      'Component',
      'PureComponent',
      'createContext',
      'forwardRef',
      'lazy',
      'memo',
      'useCallback',
      'useContext',
      'useEffect',
      'useImperativeHandle',
      'useDebugValue',
      'useLayoutEffect',
      'useMemo',
      'useReducer',
      'useRef',
      'useState',
      'Fragment',
      'Profiler',
      'StrictMode',
      'Suspense',
      'unstable_SuspenseList',
      'createElement',
      'cloneElement',
      'createFactory',
      'isValidElement',
    ],
    'node_modules/react-is/index.js': ['isElement', 'isValidElementType', 'ForwardRef'],
  }

  return [
    {
      input,
      production,
      plugins: getPlugins({
        path,
        production,
        targets: { node: true },
      }),
      outputOptions: {
        dir: resolve('./.ofc/server'),
        format: 'cjs',
      },
      replaceOptions: {
        ...replaceOptions,
        'process.browser': 'false',
      },
      resolveOptions: {
        mainFields: ['main'],
        dedupe: ['react', 'react-dom', 'styled-components'],
        extensions: ['.js', '.json', '.node'],
      },
      namedExportOptions,
    },
    {
      input,
      production,
      plugins: getPlugins({
        path,
        production,
        targets: { esmodules: true },
      }),
      outputOptions: {
        dir: resolve('./.ofc/assets'),
        format: 'esm',
        sourcemap: !production,
      },
      replaceOptions: {
        ...replaceOptions,
        'process.browser': 'true',
      },
      resolveOptions: {
        mainFields: ['module', 'main', 'browser'],
        dedupe: ['react', 'react-dom', 'styled-components'],
      },
      namedExportOptions,
      isEndpoint: false,
    },
  ]
}

module.exports = plugin
