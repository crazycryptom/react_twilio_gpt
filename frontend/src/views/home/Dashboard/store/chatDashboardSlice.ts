import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import dayjs from 'dayjs'
import { apiGetDashboardData, apiGetTotalList } from '@/services/SalesService'
import { ChatLogType } from '../components/ConversationList'
import { GetSalesOrdersResponse } from '../../OrderList/store'



type DashboardDataResponse = ChatLogType

export type DashboardState = {
    startDate: number
    endDate: number
    loading: boolean
    dashboardData: ChatLogType[]
    totalList: ChatLogType[]
}

export const SLICE_NAME = 'Dashboard'

export const getDashboardData = createAsyncThunk(
    SLICE_NAME + '/getDashboardData',
    async () => {
        const response = await apiGetDashboardData<DashboardDataResponse>()
        
        return response.data
    }
)

export const getTotalList = createAsyncThunk(
    SLICE_NAME + '/getTotalList',
    async () => {
        const response = await apiGetTotalList<
            GetSalesOrdersResponse
        >()
        
        return response.data
    }
)

const initialState: DashboardState = {
    startDate: dayjs(
        dayjs().subtract(3, 'month').format('DD-MMM-YYYY, hh:mm A')
    ).unix(),
    endDate: dayjs(new Date()).unix(),
    loading: true,
    dashboardData: [],
    totalList: []
}

const DashboardSlice = createSlice({
    name: `${SLICE_NAME}/state`,
    initialState,
    reducers: {
        setStartDate: (state, action: PayloadAction<number>) => {
            state.startDate = action.payload
        },
        setEndDate: (state, action: PayloadAction<number>) => {
            state.endDate = action.payload
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(getTotalList.fulfilled, (state, action) => {
                state.totalList = action.payload.data
                state.loading = false
            })
            .addCase(getTotalList.pending, (state) => {
                state.loading = true
            })
    },
})

export const { setStartDate, setEndDate } = DashboardSlice.actions

export default DashboardSlice.reducer
