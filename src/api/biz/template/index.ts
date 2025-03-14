import request from '/@/utils/request';

export function getTemplateList(query:Object) {
    return request({
        url: '/api/v1/system/template/list',
        method: 'get',
        params:query
    })
}

export function getTemplate(query:Object) {
    return request({
        url: '/api/v1/system/template/get',
        method: 'get',
        params:query
    })
}

// 添加修改状态的 API
export function updateTemplateStatus(params: any) {
    return request({
    url: '/api/v1/system/template/status',
        method: 'post',
        data: params,
    });
    }


export function addTemplate(data:any) {
    return request({
        url: '/api/v1/system/template/store',
        method: 'post',
        data:data
    })
}

export function editTemplate(data:any) {
    return request({
        url: '/api/v1/system/template/edit',
        method: 'put',
        data:data
    })
}

export function deleteTemplate(data:any) {
    return request({
        url: '/api/v1/system/template/delete',
        method: 'delete',
        data:data
    })
}