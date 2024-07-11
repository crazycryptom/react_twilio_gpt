import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import {
    apiGetProducts,
    apiGetChats,
} from '@/services/AgentService'
import ApiService from '@/services/ApiService'
import { QA } from '@/@types/gpt'


export type AgentInformation = {
    _id: string
    name: string
    organizationName: string
    description: string
    qaList: QA[]
    context: string
    siteUrls: string
    rules: string
    businessInfo: string
    uploadedFileName: string
    
}

type ChatInformation = {
    email: string
    direction: string
    content: string
}
// type FormData = {
//     agentInformation: AgentInformation
// }
type GetAgentsResponse = {
    status: string 
    data: AgentInformation[]
}


type GetChatsResponse = {
    status: string 
    data: ChatInformation[]
}

export type AgentState = {
    // formData: FormData,
    agents: AgentInformation[],
    newDialog: boolean,
    trainDialog: boolean,
    deleteConfirmation: boolean,
    selectedAgent: string

}

export const SLICE_NAME = 'agentList'

export const getAgents = createAsyncThunk(
    SLICE_NAME + '/getAgents',
    async () => {
        const response = await apiGetProducts<GetAgentsResponse>()
        
        return response.data
    }
)
export const getChats = createAsyncThunk(
    SLICE_NAME + '/getChats',
    async () => {
        const response = await apiGetChats<GetChatsResponse>()
        return response.data
    }
)

export const deleteAgent = async (id: string) => {
    const response = await ApiService.fetchData<void>({
        url: `/agent/${id}`, 
        method: 'delete',
    });
    return response.data
}

const initialState: AgentState = {
    agents: [],
    newDialog: false,
    trainDialog: false,
    deleteConfirmation: false,
    selectedAgent: ''

}

const agentListSlice = createSlice({
    name: `${SLICE_NAME}/state`,
    initialState,
    reducers: {
        // setFormData: (state, action) => {
        //     state.formData = { ...state.formData, ...action.payload }
        // },
        setAgents: (state, action) => {
            state = {
                ...state,
                agents: action.payload
            }
        },
        toggleNewDialog: (state, action) => {
            state.newDialog = action.payload
        },
        toggleTrainDialog: (state, action) => {
            state.trainDialog = action.payload
        },
        toggleDeleteConfirmation: (state, action) => {
            state.deleteConfirmation = action.payload
        },
        deleteSuccessAgent: (state, action) => {
            return {
                ...state,
                agents: state.agents.filter(agent => agent._id !== action.payload)
            }
        },
        setSelectedAgent : (state, action) => {
            state.selectedAgent = action.payload
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(getAgents.fulfilled, (state, action) => {
                state.agents = action.payload.data
            })
    },
})

export const {
    // setFormData,
    setAgents,
    toggleNewDialog,
    toggleTrainDialog,
    deleteSuccessAgent,
    toggleDeleteConfirmation,
    setSelectedAgent
} = agentListSlice.actions

export default agentListSlice.reducer
