<center><h1>ofc!</h1></center>
<hr/>

A zero-config framework for writing modern `koa` middleware serverless functions with `React` views.

- Modern `async/await` middleware pattern
- Leverage the `koa` middleware eco-system
- Write views in `React`
- Tree-shaken and `rollup`'d output
- Single run-time dependency (`koa`)
- Works with `now` including `now dev`
- File-system based routing
- Relative `fetch` on the server-side
- Typescript support out-of-the-box
- Default plugins for `.{ts,js,tsx,jsx,md,mdx}`

## Usage

```
$ npm i -g @ofc/cli
```

Open your project directory and:

```
$ ofc build <env> // default 'develop'
$ ofc watch <env> // default 'develop'
```

### Working with `now`

Make sure you have `now` cli installed and you are logged in.

```
$ npm i -g now
```

Build the project and run `now`, the `now.ofc.json` will be generated for you based on your file-system.

```
$ ofc build && now -A now.ofc.json
```

In dev mode it may be worth having a watch running.

```
$ ofc watch // wait until 'done' appears...
$ now dev -A now.ofc.json // in another terminal
```


