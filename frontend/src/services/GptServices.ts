import ApiService from './ApiService'
import type {
    BusinessInfo,
    QA,
    Question,
    Reply,
    SiteUrls,
} from '@/@types/gpt'

export async function apiGetAnswerFromTunedModel(data: Question) {
    return await ApiService.fetchData<Reply>({
        url: '/gpt/gpt-tuned-reply',
        method: 'post',
        data,
    })
}
export async function apiGetAnswerFromGPT(data: Question) {
    return await ApiService.fetchData<Reply>({
        url: '/gpt/gpt-pure-reply',
        method: 'post',
        data,
    })
}

export async function apiGetQAList(data: BusinessInfo | SiteUrls, flag: string) {
    return await ApiService.fetchData<{qaList: string, status: boolean | string}>({
        url: `/gpt/get-qalist/${flag}`,
        method: 'post',
        data
    })
}