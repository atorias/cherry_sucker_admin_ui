import request from '/@/utils/request';

export function getCateParams(query:Object) {
    return request({
        url: '/api/v1/system/cate/params',
        method: 'get',
        params:query
    })
}
export function getCateList(query:Object) {
    return request({
        url: '/api/v1/system/cate/list',
        method: 'get',
        params:query
    })
}


export function getCate(query:Object) {
    return request({
        url: '/api/v1/system/cate/get',
        method: 'get',
        params:query
    })
}


export function addCate(data:any) {
    return request({
        url: '/api/v1/system/cate/store',
        method: 'post',
        data
    })
}

export function editCate(data:any) {
    return request({
        url: '/api/v1/system/cate/edit',
        method: 'put',
        data
    })
}

export function deleteCate(data:any) {
    return request({
        url: '/api/v1/system/cate/delete',
        method: 'delete',
        data
    })
}