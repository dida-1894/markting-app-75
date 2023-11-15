import { message } from 'antd';

const isdev = process.env.NODE_ENV === 'development';

const jumpToLogin = () => {
  if (isdev) return message.info({ content: '授权超时，开发状态自己处理一下...' });

  message.info({ content: '授权超时，正在为你跳转登录...' });
  setTimeout(() => {
    localStorage.clear();
    const a = document.createElement('a');
    a.href = 'http://www.itjevon.cn/';
    a.click();
  }, 2 * 1000);
};

const Authorization = `Bearer ${localStorage.getItem('token')}`;

const getQueryString = (params: Record<string, string | number>): string => {
  let string = '';
  Object.keys(params).map((k) => {
    if (!params[k]) return '';

    if (string.length === 0) string = `${k}=${params[k]}`;
    else string += `&${k}=${params[k]}`;
    return string;
  });
  return string;
};

export class Api {
  static urlPrefix = '/api/';
  static get<T>(
    url: string,
    queryParams?: Record<string, string>,
    config: RequestInit = {},
  ): Promise<T> {
    let _url = this.urlPrefix + url;
    if (queryParams) _url += `?${getQueryString(queryParams)}`;

    return fetch(_url, {
      method: 'GET',
      headers: {
        Authorization,
      },
      ...config,
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.code === 401) jumpToLogin();
        return res;
      });
  }

  static post<T>(url: string, body?: any, config: RequestInit = {}): Promise<T> {
    return fetch(`${this.urlPrefix}${url}`, {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        Authorization,
        'Content-Type': 'application/json;charset=UTF-8',
      },
      ...config,
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.code === 401) jumpToLogin();
        return res;
      });
  }

  // static put<T>(
  //   url: string,
  //   body?: any,
  //   queryParams?: any,
  //   config: Partial<AxiosRequestConfig> = {},
  // ): Promise<T> {
  //   return axiosInstance
  //     .put(url + convertObjectToQueryParams(queryParams), body, {
  //       baseURL: devtools.config.API_BASE_URL,
  //       ...apiRequestConfig,
  //       ...config,
  //     })
  //     .then((res) => {
  //       console.log('put res', res);
  //       return res.data;
  //     });
  // }

  // static delete<T>(
  //   url: string,
  //   queryParams?: any,
  //   config: Partial<AxiosRequestConfig> = {},
  // ): Promise<T> {
  //   return axiosInstance
  //     .delete(url + convertObjectToQueryParams(queryParams), {
  //       baseURL: devtools.config.API_BASE_URL,
  //       ...apiRequestConfig,
  //       ...config,
  //     })
  //     .then((res) => res.data);
  // }
}
