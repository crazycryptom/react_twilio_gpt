import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { SLICE_BASE_NAME } from './constants'

export type UserState = {
    avatar?: string
    firstName?: string
    lastName?: string
    email?: string
    phone?: string
    authority?: string[]
}

const initialState: UserState = {
    avatar: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    authority: [],
}

const userSlice = createSlice({
    name: `${SLICE_BASE_NAME}/user`,
    initialState,
    reducers: {
        setUser(state, action: PayloadAction<UserState>) {
            state.avatar = action.payload?.avatar
            state.email = action.payload?.email
            state.firstName = action.payload?.firstName
            state.lastName = action.payload?.lastName
            state.authority = action.payload?.authority
            state.phone = action.payload?.phone
        },
    },
})

export const { setUser } = userSlice.actions
export default userSlice.reducer
