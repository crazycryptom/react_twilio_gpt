import { ConfirmDialog } from '@/components/shared'
import {
    deleteSuccessAgent,
    toggleDeleteConfirmation,
    useAppDispatch,
    useAppSelector,
} from '../store'
import ApiService from '@/services/ApiService'

const AgentDeleteConfirmation = () => {
    const dispatch = useAppDispatch()

    const dialogOpen = useAppSelector(
        (state) => state.agentList.data.deleteConfirmation,
    )
    const selectedAgent = useAppSelector(
        (state) => state.agentList.data.selectedAgent,
    )
    const onDialogClose = () => {
        dispatch(toggleDeleteConfirmation(false))
    }

    const onDelete = async () => {
        dispatch(deleteSuccessAgent(selectedAgent))
        dispatch(toggleDeleteConfirmation(false))
        const response = await ApiService.fetchData<void>({
            url: `/agent/${selectedAgent}`,
            method: 'delete',
        })
    }

    return (
        <ConfirmDialog
            isOpen={dialogOpen}
            type="danger"
            title="Delete Agent"
            confirmButtonColor="red-600"
            onClose={onDialogClose}
            onRequestClose={onDialogClose}
            onCancel={onDialogClose}
            onConfirm={onDelete}
        >
            <p>Are you sure you want to delete this agent?</p>
        </ConfirmDialog>
    )
}

export default AgentDeleteConfirmation
