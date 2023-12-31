<h2 align="center">Easy to use hooks</h2>

## Install

```bash
npm install hookbox
# or 
yarn add hookbox
```

## useCache

useCache is helpful to improve user experience.
One is when api is slow, we can show cached data first, and update it when api returns.
useCache parameter:

1. cacheName(required): unique name for identifying data.
2. getter(required): function to get data, <T>() => Promise<T>.
3. level: 1 for memory cache, 2 for sessionStorage, 3 for localStorage, default is `1`.
4. expireIn: for how many time will be expired, count in second.
5. forceUpdate: update every time when mounted or dependency changed, default is `false`.
6. dependencies: dependencies, default is `[]`.

```javascript
import {useCache} from "ease-hooks";

function Component() {
  const [data, clear, update ] = useCache("CACHE_NAME", () => {
    return Promise.resolve(SomeData)
  }, 0, 30);

  clear() // clear saved data, at next time it runs, data will be reloaded.
  update(data) // update saved data. 

  // some other code
}
```

## usePageBloc

usePageBloc is a hook for managing page state, it's supposed to be use with [Ant design](https://ant.design/index-cn)'s
`Table` component or  `ProTable` component in [ProComponents](https://procomponents.ant.design/). But it can be used in
other situation's alike, just make a wrapper component as an api adapter.

#### options for usePageBloc:
```typescript
type ResponseData<T> = {
  data: T[];
  total: number;
};

type API = {
  // get page data
  get: <T>(params: any) => Promise<TableDataResponse<T>>;
};

type BlocOptions = {
  // key for identifying data, default is 'id'
  idKey?: string;
  selectable?: boolean;
  // if true, selection will be kept when page change.
  holdSelection?: boolean;
  selectMode?: "checkbox" | "radio";
  // if true, data will be loaded when component mounted.
  initialization?: boolean;
  // show pagination or not
  showPagination?: boolean;
  api: API;
  pageSizeList?: number[];
  // state will be persaved in memory.
  persistent?: boolean;
  // initial params for api.get
  initialParams?: any;
};
```

#### usePageBloc return value:
```typescript
type usePageBlocReturnValue = {
    tableProps: {
      rowKey: 'string',
      // paination will be false if showPagination is false
      pagination: {
        current: number;
        pageSize: number;
        total: number;
        onChange: ({curent: nubmer, pageSize: number}) => void,
        pageSizeOptions: number[],
      },
      rowSelection: rowConfig,
      dataSource: any[],
      loading: boolean,
    },
    filterProps: {
      onReset: () => void;
      onSubmit: (any) => {};
      initialValues: any;
    },
    refresh: () => void;
    navigate: (data: any) => void;
    selected: any[];
    clearSelection: () => void;
    setFixedParamsAndRefresh: (params: any) => void;
  }
```


