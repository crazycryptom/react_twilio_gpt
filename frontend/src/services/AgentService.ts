import { QA } from '@/@types/gpt'
import ApiService from './ApiService'

//create agent
export async function apiCreateAgent<T, U extends Record<string, unknown>>(
    data: U,
) {
    return ApiService.fetchData<T>({
        url: '/agent',
        method: 'post',
        data,
    })
}

// update agent
export async function apiTrainAgent(
    agentId: string,
    data: { businessInfo: string; siteUrls: string; qaList: QA[] },
) {
    return ApiService.fetchData({
        url: `/agent/${agentId}/qalist`,
        method: 'post',
        data,
    })
}

export async function apiUpdateAgent(agentId: string, updatedData: any) {
    return ApiService.fetchData({
        url: `/agent/${agentId}`,
        method: 'put',
        data: updatedData,
    })
}

export async function apiGetProducts<T>() {
    return ApiService.fetchData<T>({
        url: '/agent',
        method: 'get',
    })
}
export async function apiGetChats<T>() {
    return ApiService.fetchData<T>({
        url: '/chat',
        method: 'get',
    })
}

export async function apiDeleteSalesProducts<
    T,
    U extends Record<string, unknown>,
>(data: U) {
    return ApiService.fetchData<T>({
        url: '/agent',
        method: 'delete',
        data,
    })
}

export async function apiGetSalesProduct<T, U extends Record<string, unknown>>(
    params: U,
) {
    return ApiService.fetchData<T>({
        url: '/sales/product',
        method: 'get',
        params,
    })
}

export async function apiPutSalesProduct<T, U extends Record<string, unknown>>(
    data: U,
) {
    return ApiService.fetchData<T>({
        url: '/sales/products/update',
        method: 'put',
        data,
    })
}
