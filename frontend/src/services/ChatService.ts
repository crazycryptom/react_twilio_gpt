import ApiService from './ApiService'
export async function apiGetChats<T>() {
    return ApiService.fetchData<T>({
        url: '/chat',
        method: 'get',
    })
}