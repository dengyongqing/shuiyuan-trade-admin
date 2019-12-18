import { stringify } from 'qs';
import request, { requestFile } from '@/utils/request';

export async function queryProjectNotice() {
  return request('/api/project/notice');
}

export async function queryActivities() {
  return request('/api/activities');
}

export async function queryUser(params) {
  return request(`/wlapi/user?${stringify(params)}`);
}

export async function queryOrder(params) {
  return request(`/wlapi/order?${stringify(params)}`);
}

export async function queryOrderCondition(params) {
  return request('/wlapi/order/query', {
    method: 'POST',
    body: {
      ...params,
    },
  });
}

export async function downloadOrder(params) {
  return requestFile(`/wlapi/order/excel`, {
    method: 'POST',
    body: JSON.stringify(params),
  }, new Date().getTime());
}

export async function downloadBill(params) {
  return requestFile(`/wlapi/order/bill-excel`, {
    method: 'POST',
    body: JSON.stringify(params),
  }, new Date().getTime());
}


export async function queryRule(params) {
  return request(`/api/rule?${stringify(params)}`);
}

export async function queryCustomer(params) {
  return request('/wlapi/customer/query', {
    method: 'POST',
    body: {
      ...params,
    },
  });
  // return request(`/api/rule?${stringify(params)}`);
}

export async function queryCompany(params) {
  return request(`/wlapi/company/query?keyword=${params.keyword}`, {
    method: 'POST',
    // body: {
    //   ...params,
    // },f
  });
  // return request(`/api/rule?${stringify(params)}`);
}

export async function downloadCompany(params) {
  return requestFile(`/wlapi/company/excel?keyword=${params.keyword}`, {
    method: 'POST',
    // body: JSON.stringify(params),
  });
}

export async function removeUser(params) {
  return request(`/wlapi/user/${params.id}`, {
    method: 'DELETE',
  });
}

export async function queryOrderDetail(params) {
  return request(`/wlapi/order/${params.id}`, {
    method: 'GET',
  });
}

export async function removeOrder(params) {
  return request(`/wlapi/order/${params.id}`, {
    method: 'delete',
  });
}

export async function removeRule(params) {
  return request('/api/rule', {
    method: 'POST',
    body: {
      ...params,
    },
  });
}

export async function addRule(params) {
  return request('/api/rule', {
    method: 'POST',
    body: {
      ...params,
      method: 'post',
    },
  });
}

export async function addUser(params) {
  return request('/wlapi/user', {
    method: 'POST',
    body: {
      ...params,
    },
  });
}

export async function addOrder(params) {
  return request('/wlapi/order', {
    method: 'POST',
    body: {
      ...params,
    },
  });
}

export async function updateUser(params) {
  return request(`/wlapi/user/${params.id}`, {
    method: 'PUT',
    body: {
      ...params,
    },
  });
}

export async function updateOrder(params) {
  return request(`/wlapi/order/${params.id}`, {
    method: 'PUT',
    body: {
      ...params,
    },
  });
}

export async function updateRule(params) {
  return request('/api/rule', {
    method: 'POST',
    body: {
      ...params,
      method: 'update',
    },
  });
}

export async function fakeSubmitForm(params) {
  return request('/api/forms', {
    method: 'POST',
    body: params,
  });
}

export async function fakeChartData() {
  return request('/api/fake_chart_data');
}

export async function queryTags() {
  return request('/api/tags');
}

export async function queryBasicProfile() {
  return request('/api/profile/basic');
}

export async function queryAdvancedProfile() {
  return request('/api/profile/advanced');
}

export async function queryFakeList(params) {
  return request(`/api/fake_list?${stringify(params)}`);
}

export async function removeFakeList(params) {
  const { count = 5, ...restParams } = params;
  return request(`/api/fake_list?count=${count}`, {
    method: 'POST',
    body: {
      ...restParams,
      method: 'delete',
    },
  });
}

export async function addFakeList(params) {
  const { count = 5, ...restParams } = params;
  return request(`/api/fake_list?count=${count}`, {
    method: 'POST',
    body: {
      ...restParams,
      method: 'post',
    },
  });
}

export async function updateFakeList(params) {
  const { count = 5, ...restParams } = params;
  return request(`/api/fake_list?count=${count}`, {
    method: 'POST',
    body: {
      ...restParams,
      method: 'update',
    },
  });
}

export async function fakeAccountLogin_bak(params) {
  return request('/api/login/account', {
    method: 'POST',
    body: params,
  });
}

export async function fakeAccountLogin(params) {
  return request(`/lgapi/login?${stringify(params)}`, {
    method: 'POST',
  });
}

export async function fakeAccountLogOut() {
  return request(`/lgapi/logout`, {
    method: 'POST',
  });
}

export async function fakeRegister(params) {
  return request('/api/register', {
    method: 'POST',
    body: params,
  });
}

export async function queryNotices() {
  return request('/api/notices');
}

export async function getFakeCaptcha(mobile) {
  return request(`/api/captcha?mobile=${mobile}`);
}
