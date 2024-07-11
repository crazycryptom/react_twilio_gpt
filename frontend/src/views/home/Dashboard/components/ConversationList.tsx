import { useCallback } from 'react'
import Card from '@/components/ui/Card'
import Table from '@/components/ui/Table'
import useThemeClass from '@/utils/hooks/useThemeClass'
import {
    useReactTable,
    getCoreRowModel,
    flexRender,
    createColumnHelper,
} from '@tanstack/react-table'
import { useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'
import ApiService from '@/services/ApiService'
import { Notification, Tooltip, toast } from '@/components/ui'
import { HiOutlineEye, HiOutlineTrash } from 'react-icons/hi'

export type message = {
    in: string
    out: string
}

export type ChatLogType = {
    _id: string
    customerNumber: string
    twilioNumber: string
    messages: message[]
    date: number
    action?: string
}

type ChatColumnProps = {
    row: ChatLogType
}

const { Tr, Td, TBody, THead, Th } = Table

const OrderColumn = ({ row }: ChatColumnProps) => {
    const { textTheme } = useThemeClass()
    const navigate = useNavigate()

    const onView = useCallback(() => {
        navigate(`/home/dashboard?id=${row._id}`)
    }, [navigate, row])

    return (
        <Tooltip title="Chat with agent">
            <span
                className="cursor-pointer p-2 hover:text-cyan-500"
                onClick={onView}
            >
                <HiOutlineEye />
            </span>
        </Tooltip>
    )
}

type ConversationListProps = {
    data?: ChatLogType[]
    className?: string
    setIdToDelete: (id: string) => void
}

const ConversationList = ({
    data = [],
    className,
    setIdToDelete,
}: ConversationListProps) => {
    const ActionColumn = ({ row }: ChatColumnProps) => {
        const { textTheme } = useThemeClass()
        const navigate = useNavigate()

        const onView = useCallback(() => {
            navigate(`/home/dashboard?id=${row._id}`)
        }, [navigate, row])

        const deleteChat = async () => {
            try {
                await ApiService.fetchData<any>({
                    url: `/chat/${row._id}`,
                    method: 'delete',
                })

                setIdToDelete(row._id)
                toast.push(
                    <Notification
                        title={'Successfully removed'}
                        type="success"
                        duration={2500}
                    >
                        Chat log successfully removed
                    </Notification>,
                    {
                        placement: 'top-center',
                    },
                )
            } catch (error) {
                console.log(error)
            }
        }
        return (
            <>
                <Tooltip title="View Chat">
                    <span
                        className="cursor-pointer p-2 hover:text-cyan-500 text-lg"
                        onClick={onView}
                    >
                        <HiOutlineEye />
                    </span>
                </Tooltip>
                <Tooltip title="Delete Chat">
                    <span
                        className="cursor-pointer p-2 hover:text-red-500 text-lg"
                        onClick={deleteChat}
                    >
                        <HiOutlineTrash />
                    </span>
                </Tooltip>
            </>
        )
    }
    const columnHelper = createColumnHelper<ChatLogType>()

    const columns = [
        columnHelper.accessor('date', {
            header: 'Date',
            cell: (props) => {
                const row = props.row.original
                return <span>{dayjs(row.date).format('DD/MM/YYYY')}</span>
            },
        }),
        columnHelper.accessor('customerNumber', {
            header: 'Customer Number',
        }),

        columnHelper.accessor('twilioNumber', {
            header: 'Twilio Number',
        }),
        columnHelper.accessor('action', {
            header: 'Action',
            cell: (props) => <ActionColumn row={props.row.original} />,
        }),
    ]

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
    })

    return (
        <Card className={`${className} overflow-auto max-h-[700px]`}>
            <div className="flex items-center justify-between mb-6">
                <h4>Chat List</h4>
            </div>

            <Table>
                <THead>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <Tr key={headerGroup.id}>
                            {headerGroup.headers.map((header) => {
                                return (
                                    <Th
                                        key={header.id}
                                        colSpan={header.colSpan}
                                    >
                                        {flexRender(
                                            header.column.columnDef.header,
                                            header.getContext(),
                                        )}
                                    </Th>
                                )
                            })}
                        </Tr>
                    ))}
                </THead>
                <TBody>
                    {table.getRowModel().rows.map((row) => {
                        return (
                            <Tr key={row.id}>
                                {row.getVisibleCells().map((cell) => {
                                    return (
                                        <Td key={cell.id}>
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext(),
                                            )}
                                        </Td>
                                    )
                                })}
                            </Tr>
                        )
                    })}
                </TBody>
            </Table>
        </Card>
    )
}

export default ConversationList
