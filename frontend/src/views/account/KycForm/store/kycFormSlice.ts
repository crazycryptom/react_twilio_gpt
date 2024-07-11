import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { apiGetAccountFormData } from '@/services/AccountServices'

export type PersonalInformation = {
    firstName: string
    lastName: string
    email: string
    dialCode: string
    phoneNumber: string
    country: string
    addressLine1: string
    addressLine2: string
    city: string
    state: string
    zipCode: string
}


export type KycFormState = {
    personalInformation: PersonalInformation
}

export const SLICE_NAME = 'accountDetailForm'

export const getForm = createAsyncThunk(SLICE_NAME + '/getForm', async () => {
    const response = await apiGetAccountFormData<any>()
    return response.data.personalInformation
})

export const initialState: KycFormState = {
    personalInformation: {
        firstName: '',
        lastName: '',
        email: '',
        dialCode: '',
        phoneNumber: '',
        country: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        zipCode: '',
    },
}

const kycFormSlice = createSlice({
    name: `${SLICE_NAME}/state`,
    initialState,
    reducers: {
        setPerson: (state, action) => {
            state.personalInformation = { ...state.personalInformation, ...action.payload }
        },
    },
    extraReducers: (builder) => {
        builder.addCase(getForm.fulfilled, (state, action) => {
            state.personalInformation = action.payload 
        })
    },
})

export const { setPerson } = kycFormSlice.actions

export default kycFormSlice.reducer
