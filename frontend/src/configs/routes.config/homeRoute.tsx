import { lazy } from 'react'
import type { Routes } from '@/@types/routes'
import { USER } from '@/constants/roles.constant'

const homeRoute: Routes = [
    {
        key: 'home.dashboard',
        path: `home/dashboard/*`,
        component: lazy(() => import('@/views/home/Dashboard')),
        authority: [],
    },
    {
        key: 'home.project.agent-list',
        path: `home/project/agent-list/*`,
        component: lazy(() => import('@/views/project/AgentList')),
        authority: [],
    },
    {
        key: 'home.project.agent-new',
        path: `home/project/agent-new/*`,
        component: lazy(() => import('@/views/project/AgentNew')),
        authority: [],
    },
    {
        key: 'home.project.train-agent',
        path: `home/project/train-agent/*`,
        component: lazy(() => import('@/views/project/TrainAgent')),
        authority: [],
    },
    {
        key: 'home.project.call-setting',
        path: `home/project/call-setting/*`,
        component: lazy(() => import('@/views/project/CallSetting')),
        authority: [],
    },
    {
        key: 'home.profile',
        path: `home/profile/*`,
        component: lazy(() => import('@/views/account/KycForm')),
        authority: [],
    },
    {
        key: 'home.payment',
        path: `home/payment/*`,
        component: lazy(() => import('@/views/payment/PricingTables')),
        authority: [],
    },
]

export default homeRoute