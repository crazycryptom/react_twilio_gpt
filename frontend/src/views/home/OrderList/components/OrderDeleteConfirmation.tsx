import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import ConfirmDialog from '@/components/shared/ConfirmDialog'
import {
    setDeleteMode,
    setSelectedRow,
    setSelectedRows,
    deleteOrders,
    getOrders,
    useAppDispatch,
    useAppSelector,
} from '../store'

const OrderDeleteConfirmation = () => {
    const dispatch = useAppDispatch()
    const selectedRows = useAppSelector(
        (state) => state.salesOrderList.data.selectedRows
    )
    const selectedRow = useAppSelector(
        (state) => state.salesOrderList.data.selectedRow
    )
    const deleteMode = useAppSelector(
        (state) => state.salesOrderList.data.deleteMode
    )
    const tableData = useAppSelector(
        (state) => state.salesOrderList.data.tableData
    )

    const onDialogClose = () => {
        dispatch(setDeleteMode(''))

        if (deleteMode === 'single') {
            dispatch(setSelectedRow([]))
        }
    }

    const onDelete = async () => {
        dispatch(setDeleteMode(''))

        if (deleteMode === 'single') {
            try {
                await deleteOrders({ id: selectedRow })
                deleteSucceed(true)
                dispatch(setSelectedRow([]))
            } catch (error) {
                console.log(error)
            }
        }

        if (deleteMode === 'batch') {
            try {
                await deleteOrders({ id: selectedRows })
                deleteSucceed(true, selectedRows.length)
                dispatch(setSelectedRows([]))
                
            } catch (error) {
                console.log(error)
            }
        }
    }

    const deleteSucceed = (success: boolean, orders = 0) => {
        if (success) {
            console.log('success')
            dispatch(getOrders(tableData))
            toast.push(
                <Notification
                    title={'Successfuly Deleted'}
                    type="success"
                    duration={2500}
                >
                    {deleteMode === 'single' && 'Order '}
                    {deleteMode === 'batch' && `${orders} orders `}
                    successfuly deleted
                </Notification>,
                {
                    placement: 'top-center',
                }
            )
        }
    }

    return (
        <ConfirmDialog
            isOpen={deleteMode === 'single' || deleteMode === 'batch'}
            type="danger"
            title="Delete product"
            confirmButtonColor="red-600"
            onClose={onDialogClose}
            onRequestClose={onDialogClose}
            onCancel={onDialogClose}
            onConfirm={onDelete}
        >
            <p>
                Are you sure you want to delete this log? 
            </p>
        </ConfirmDialog>
    )
}

export default OrderDeleteConfirmation
