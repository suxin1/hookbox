import { useEffect, useMemo, useCallback } from "react";
import useState from "react-usestateref";
import { useLocation, useNavigate } from "react-router-dom";

import cache from "./cache";

export type TableDataResponse<T> = {
  data: T[];
  total: number;
};

export type TableAPI = {
  get: <T>(params: any) => Promise<TableDataResponse<T>>;
};

type BlocOptions = {
  idKey?: string;
  selectable?: boolean;
  holdSelection?: boolean;
  selectMode?: "checkbox" | "radio";
  initialization?: boolean;
  showPagination?: boolean;
  api: TableAPI;
  pageSizeList?: number[];
  persistent?: boolean;
  initialParams?: any;
};

function useTableBloc({
  idKey = "id",
  initialization = true,
  selectable = false,
  selectMode = "checkbox",
  showPagination = true,
  holdSelection = false,
  pageSizeList = [10, 20, 30, 50],
  persistent = false,
  initialParams = {},
  ...options
}: BlocOptions) {
  const location = useLocation();
  const [pageState, navigate] = usePageState();
  // 选择使用缓存数据还是页面数据
  const cacheData = persistent ? cache.getItem(location.pathname) : pageState || {};

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any[]>(cacheData?.data || []);
  const [params, setParams, paramsRef] = useState(cacheData?.params || initialParams || {});
  const [fixedParams, setFixedParams, FParams] = useState(cacheData?.fixedParams || {});
  const [pagination, setPagination, pageRef] = useState(
    cacheData?.pagination || {
      current: 1,
      pageSize: 10,
      total: 0,
    },
  );

  const [selected, clearSelection, rowConfig] = useSelection({ idKey, selectable, selectMode, holdSelection });

  useEffect(() => {
    if (initialization) {
      getList();
    }
  }, []);

  useEffect(() => {
    if (persistent) {
      const key = location.pathname;
      cache.setItem(key, {
        data,
        params,
        fixedParams,
        pagination,
      });
    }
  }, [data, params, fixedParams, pagination]);

  async function getList() {
    const { api } = options;
    let newParams = { ...paramsRef.current, ...FParams.current };
    if (showPagination) {
      newParams = {
        ...newParams,
        page: pageRef.current.current,
        size: pageRef.current.pageSize,
      };
    }
    setLoading(true);
    try {
      const { data, total } = await api.get(newParams);
      setData(data);
      setPagination({ ...pageRef.current, total });
    } finally {
      setLoading(false);
    }
  }

  const onPageChange = useCallback((current, pageSize) => {
    setPagination({ ...pagination, current, pageSize });
    getList();
    if (!holdSelection) clearSelection();
  }, [pagination])

  const onFilterReset = useCallback(() => {
    setParams(initialParams || {});
    setPagination({ ...pagination, current: 1 });
    getList();
  }, [pagination]);


  const onSearch = useCallback((params) => {
    setParams(params);
    clearSelection();
    setPagination({ ...pagination, current: 1 });
    getList();
  }, [pagination]);

  const setFixedParamsAndRefresh = useCallback((params) => {
    setFixedParams(params);
    getList();
  }, []);

  const  navigateTo = useCallback((path: string, options?: any) => {
    const state = {
      data,
      params,
      fixedParams,
      pagination,
    };
    navigate(state, path, options);
  }, [data, params, fixedParams, pagination]);

  return {
    tableProps: {
      rowKey: idKey,
      pagination: showPagination && {
        ...pagination,
        onChange: onPageChange,
        pageSizeOptions: pageSizeList,
      },
      rowSelection: rowConfig,
      dataSource: data,
      loading,
    },
    filterProps: {
      onReset: onFilterReset,
      onSubmit: onSearch,
      initialValues: params,
    },
    refresh: getList,
    navigate: navigateTo,
    selected,
    clearSelection,
    setFixedParamsAndRefresh,
  };
}

function useSelection(options): [any[], () => void, any] {
  const [selected, setSelected] = useState<any[]>([]);
  const { idKey, selectable, holdSelection, selectMode } = options;

  function addSelection(item: any) {
    setSelected([...selected, item]);
  }

  function setSelection(arr: any[]) {
    setSelected([...arr]);
  }

  function deleteSelection(arr: any[]) {
    const idDict = arr.reduce((acc, item) => {
      acc[item[idKey]] = true;
      return acc;
    }, {});
    setSelected(selected.filter((item) => !idDict[item[idKey]]));
  }

  function onSelectAll(status, selected, changed) {
    if (holdSelection) {
      if (status) {
        addSelection(changed);
      } else deleteSelection(changed);
    } else {
      setSelection(selected);
    }
  }

  function onSelect(changed, status, all) {
    if (holdSelection) {
      if (status) {
        addSelection(changed);
      } else deleteSelection(changed);
    } else {
      setSelection(all);
    }
  }

  function clearSelection() {
    setSelected([]);
  }

  let rowConfig: any = null;
  if (selectable) {
    rowConfig = {
      onSelect,
      onSelectAll,
      selectedRowKeys: selected.map((item) => item[idKey]),
      type: selectMode,
    };
  }

  return [selected, clearSelection, rowConfig];
}

const STATE_KEY = "PAGE_STATE";

function usePageState() {
  const location = useLocation();
  const navigate = useNavigate();

  function push(data, path, options) {
    navigate(location.pathname, { state: { [STATE_KEY]: data }, replace: true });
    navigate(path, options);
  }

  const pageState = useMemo(() => {
    if (location.state && location.state[STATE_KEY]) {
      return location.state[STATE_KEY];
    }
    return null;
  }, [location]);

  return [pageState, push];
}

export default useTableBloc;
