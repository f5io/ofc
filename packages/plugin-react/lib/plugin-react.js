const { resolve, normalize, join, parse } = require('path');
const transformer = require('./transformer');
const babel = require('rollup-plugin-babel');

const getPlugins = ({ targets, path }) => {
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

const plugin = input => {
  const path = parse(normalize(input));

  const replaceOptions = {
    'OFC_REACT_ASSET': join(path.dir, path.name),
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
    ]
  };

  return [
    {
      input,
      plugins: getPlugins({
        path,
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
      plugins: getPlugins({
        path,
        targets: { esmodules: true },
      }),
      outputOptions: {
        dir: resolve('./.ofc/assets'),
        format: 'esm',
        sourcemap: process.env.NODE_ENV !== 'production',
      },
      replaceOptions,
      namedExportOptions,
    }
  ];
};

module.exports = plugin;
