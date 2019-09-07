const { resolve, normalize, join, parse } = require('path');
const transformer = require('./transformer');
const babel = require('rollup-plugin-babel');

const getPlugins = ({
  path,
  production,
  targets,
}) => {
  return [
    transformer(targets),
    babel({
      exclude: 'node_modules/**',
      extensions: [ '.js', '.ts', '.jsx', '.tsx' ],
      presets: [
        [ '@babel/preset-typescript', { isTSX: true, allExtensions: true } ],
        [ '@babel/preset-env', { targets } ],
        '@babel/preset-react',
      ], 
    })
  ]
};

const plugin = ({
  input,
  production,
}) => {
  const path = parse(normalize(input));

  const replaceOptions = {
    'OFC_REACT_ASSET': production ? join(path.dir, path.name + '.js') : input,
    'OFC_REACT_APP': process.env.OFC_REACT_APP || '_ofc_app',
    'OFC_REACT_PROPS': process.env.OFC_REACT_PROPS || '_ofc_props',
  };

  const namedExportOptions = {
    'node_modules/react/index.js': [
      'createRef', 'Component', 'PureComponent', 'createContext',
      'forwardRef', 'lazy', 'memo',
      'useCallback', 'useContext', 'useEffect', 'useImperativeHandle',
      'useDebugValue', 'useLayoutEffect', 'useMemo', 'useReducer',
      'useRef', 'useState',
      'Fragment', 'Profiler', 'StrictMode', 'Suspense', 'unstable_SuspenseList',
      'createElement', 'cloneElement', 'createFactory', 'isValidElement',
    ],
    'node_modules/react-is/index.js': [
      'isElement', 'isValidElementType', 'ForwardRef',
    ]
  };

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
      replaceOptions,
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
      namedExportOptions,
      isEndpoint: false,
    }
  ];
};

module.exports = plugin;
