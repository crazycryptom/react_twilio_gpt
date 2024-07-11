import {
    Alert,
    Button,
    FormContainer,
    FormItem,
    Input,
    Tooltip,
} from '@/components/ui'
import {
    Field,
    Form,
    Formik,
    FormikProps,
} from 'formik'
import { forwardRef, useEffect, useState, useRef, ChangeEvent } from 'react'
import { apiGetQAList } from '@/services/GptServices'
import { apiUpdateAgent, apiTrainAgent } from '@/services/AgentService'
import { Link, useNavigate } from 'react-router-dom'
import ApiService from '@/services/ApiService'
import {
    HiArrowNarrowLeft,
    HiOutlineTrash,
} from 'react-icons/hi'
import { BusinessInfo, SiteUrls } from '@/@types/gpt'
import toast from '@/components/ui/toast'
import Notification from '@/components/ui/Notification'
import { ConfirmDialog, Loading } from '@/components/shared'
import * as Yup from 'yup'
import { motion } from 'framer-motion'
import {
    AgentInformation,
} from '../AgentList/store'
import CommonSpinner from '@/components/ui/Spinner/CommonSpinner'
import Table from '@/components/ui/Table/Table'
import THead from '@/components/ui/Table/THead'
import Tr from '@/components/ui/Table/Tr'
import Th from '@/components/ui/Table/Th'
import TBody from '@/components/ui/Table/TBody'
import Td from '@/components/ui/Table/Td'
import { fstat } from 'fs'

// eslint-disable-next-line  @typescript-eslint/no-explicit-any
type FormikRef = FormikProps<any>

type QA = {
    id?: number
    question: string
    answer: string
}

export type UploadedFile = {
    _id?: string
    fileName?: string
    fileContent?: string
}
type InitialData = AgentInformation

export type RequestData = BusinessInfo | SiteUrls

export type FormModel = Omit<InitialData, 'tags'> & {
    tags: { label: string; value: string }[] | string[]
}

export type SetSubmitting = (isSubmitting: boolean) => void

export type TrainAgentForm = {
    initialData: InitialData
    uploadedFileData: UploadedFile[]
    type: 'edit' | 'new'
    onDiscard?: () => void
    onFormSubmit: (formData: FormModel, setSubmitting: SetSubmitting) => void
    setIsPageLoading: (isPageLoading: boolean) => void
}

const validationSchema = Yup.object().shape({
    // title: Yup.string().required('title Required'),
})

const TrainAgentForm = forwardRef<FormikRef, TrainAgentForm>((props, ref) => {
    const { initialData, setIsPageLoading, uploadedFileData } = props
    const submitBtnRef = useRef<HTMLButtonElement>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [qaList, setQaList] = useState<QA[]>(initialData.qaList)
    const [updatedData, setUpdatedData] =
        useState<AgentInformation>(initialData)
    const [isConfirmOpen, setIsConfirmOpen] = useState(false)
    const [isClickSaveButton, setIsClickSaveButton] = useState(false)
    const [uploadedFiles, setUploadedFiles] = useState<any[]>([
        ...uploadedFileData,
    ])
    const [files, setFiles] = useState<File[]>([])
    const [title, setTitle] = useState('')
    const [fields, setFields] = useState('')
    const [errorMessage, setErrorMessage] = useState('')
    const navigate = useNavigate()

    const handleChangeQuestion = (i: number, q: string) => {
        qaList[i].question = q
        setQaList(qaList.map((qa) => qa))
    }

    const handleChangeAnswer = (i: number, a: string) => {
        qaList[i].answer = a
        setQaList(qaList.map((qa) => qa))
    }

    // Get QAList based on the business information from GPT
    const getQAListFromBusinessInfo = async (businessInfo: string) => {
        if (!businessInfo || businessInfo === '') return
        await fetchQAList({ businessInfo }, 'info')
    }

    //Get QAList from the given siteUrls
    const getQAListFromUrl = async (siteUrls: string) => {
        if (!siteUrls || siteUrls === '') return
        await fetchQAList({ siteUrls }, 'url')
    }

    const fetchQAList = async (requestData: RequestData, flag: string) => {
        setIsLoading(true)
        try {
            const { data } = await apiGetQAList(requestData, flag)
            const _qaList = JSON.parse(data.qaList)
            console.log(_qaList)
            if (_qaList && _qaList.length > 0) {
                setQaList((prevQaList) => [...prevQaList, ..._qaList])
            } else {
                console.log('Invalid reply')
                toast.push(
                    <Notification
                        title={'Invalid GPT reply'}
                        type="danger"
                        duration={2500}
                    >
                        Can not generate Q/A pair list
                    </Notification>,
                    {
                        placement: 'top-center',
                    },
                )
            }
        } catch (error) {
            console.log(error)
        }
        setIsLoading(false)
    }

    const handleTrainStatus = () => {
        if (!isClickSaveButton) {
            toast.push(
                <Notification title={'Attention'} type="danger" duration={2500}>
                    You should save your train data before training agent.
                </Notification>,
                {
                    placement: 'top-center',
                },
            )
            return
        }
        setIsConfirmOpen(true)
    }

    const updateAgent = async (
        values: FormModel,
        setSubmitting: SetSubmitting,
    ) => {
        setSubmitting(true)
        try {
            const dataToUpdate = {
                ...values,
                qaList: [...qaList],
            }
            setUpdatedData(dataToUpdate)
            const res = await apiUpdateAgent(initialData?._id, dataToUpdate)
            toast.push(
                <Notification
                    title={'Update Success'}
                    type="success"
                    duration={2500}
                >
                    You have updated your agent data successfully.
                </Notification>,
                {
                    placement: 'top-center',
                },
            )

            setIsClickSaveButton(true)
        } catch (error) {
            console.log(error)
        }
        setSubmitting(false)
    }

    const onDiscard = () => {
        // redirect to agent list
        navigate('/home/project/agent-list')
    }

    const addQAField = () => {
        setQaList([...qaList, ...[{ question: '', answer: '' }]])
    }

    const deleteQAField = (index: number) => {
        setQaList(qaList.filter((q, i) => i !== index))
    }

    const hanldeConfirmClose = () => {
        setIsConfirmOpen(false)
    }

    const handleTrainAgent = async () => {
        try {
            const res = await apiTrainAgent(initialData?._id, updatedData)
            setIsConfirmOpen(false)
            setIsClickSaveButton(false)
        } catch (error) {
            console.log(error)
        }
    }

    const uploadFile = async (setSubmitting: SetSubmitting) => {
        setSubmitting(true)
        try {
            const formData: any = new FormData()
            if (files && files.length > 0) {
                console.log(files[0].type)
                if (
                    files[0].type === 'text/csv' ||
                    files[0].type === 'application/pdf'
                ) {
                    formData.append('file', files[0])
                    formData.append('title', title)
                    formData.append('idPrefix', `doc${uploadedFiles.length + 1}`)

                    if (title.trim() === '') {
                        setErrorMessage('Title is required')
                        setSubmitting(false)
                        return
                    } else {
                        setErrorMessage('')
                    }

                    const res = await ApiService.fetchData<any>({
                        url: `/upload/${initialData?._id}`,
                        method: 'post',
                        data: formData,
                    })
                    console.log(res.data.data)
                    setUploadedFiles((prev) => [...prev, res.data.data])
                    setFiles([])
                    setErrorMessage('')
                    setTitle('')

                    toast.push(
                        <Notification
                            title={'File uploaded successfully'}
                            type="success"
                            duration={2500}
                        >
                            Uploaded file successfully
                        </Notification>,
                        {
                            placement: 'top-center',
                        },
                    )
                    // }
                } else {
                    toast.push(
                        <Notification
                            title={'Invalid file type'}
                            type="danger"
                            duration={2500}
                        >
                            Please upload a csv or pdf file
                        </Notification>,
                        {
                            placement: 'top-center',
                        },
                    )
                }
            }
            setSubmitting(false)
        } catch (error) {
            console.log(error)
            toast.push(
                <Notification title={'Fail'} type="danger" duration={2500}>
                    File uploading failed
                </Notification>,
                {
                    placement: 'top-center',
                },
            )
            setSubmitting(false)
        }
    }

    const handleDelete = async (fileId: string, setSubmitting: SetSubmitting) => {
        setSubmitting(true)
        try {
            const res = await ApiService.fetchData<any>({
                url: `/upload/${fileId}`,
                method: 'delete',
            })
            setUploadedFiles(uploadedFiles.filter((f) => f._id !== fileId))
        } catch (error) {
            console.log(error)
        }
        setIsConfirmOpen(false)
        setSubmitting(false)
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            transition={{ duration: 0.5, type: 'tween' }}
            animate={{
                opacity: 1,
            }}
        >
            <Button
                size="sm"
                className="ltr:mr-3 rtl:ml-3"
                variant="solid"
                onClick={() => onDiscard?.()}
                color="gray-500"
            >
                <HiArrowNarrowLeft />
            </Button>
            <h3 className="mt-5 mb-5">Train Agent</h3>
            <Formik
                innerRef={ref}
                validationSchema={validationSchema}
                initialValues={{ ...initialData }}
                onSubmit={(values: FormModel, { setSubmitting }) => {
                    updateAgent?.(values, setSubmitting)
                }}
            >
                {({
                    values,
                    touched,
                    errors,
                    isSubmitting,
                    setSubmitting,
                    setFieldValue,
                }) => (
                    <Form>
                        <CommonSpinner isLoading={isSubmitting} />
                        <FormContainer>
                            <div className="grid grid-cols-1 lg:grid-cols-1 gap-4">
                                {/* <div>
                                    <div className="flex justify-between">
                                        <h6 className="mt-2 mb-3">
                                            1. Context of Conversation
                                        </h6>
                                        <Tooltip title="Give hints">
                                            <Button
                                                size="sm"
                                                variant="plain"
                                                type="button"
                                                onClick={() =>
                                                    setFieldValue(
                                                        'context',
                                                        'You are an assistant.\nYou will be provided with business information including basic information, an official website URLs, etc. You should answer the user questions based on the given business information. You should act as a company agent. The business information is as follows.',
                                                    )
                                                }
                                            >
                                                <HiLightBulb className="text-xl" />
                                            </Button>
                                        </Tooltip>
                                    </div>

                                    <FormItem
                                        invalid={
                                            (errors.context &&
                                                touched.context) as boolean
                                        }
                                    >
                                        <Field
                                            textArea={true}
                                            type="text"
                                            autoComplete="off"
                                            name="context"
                                            placeholder="For example, 'You are an assitant. You will be provided with customer service inquiries that require troubleshooting in a technical support context.'"
                                            component={Input}
                                        />
                                    </FormItem>
                                </div> */}
                                {/* <div>
                                    <div className="flex justify-between">
                                        <h5 className="mt-2 mb-3">
                                            1. Business information
                                        </h5>
                                        
                                    </div>
                                    <div className="">
                                        <FormItem
                                            invalid={
                                                (errors.businessInfo &&
                                                    touched.businessInfo) as boolean
                                            }
                                            errorMessage="Please enter business information"
                                        >
                                            <Field
                                                textArea={true}
                                                type="text"
                                                autoComplete="off"
                                                name="businessInfo"
                                                placeholder="Please input your business information"
                                                component={Input}
                                            />
                                        </FormItem>
                                    </div>
                                </div> */}
                            </div>
                            <div className="grid grid-cols-1 lg:grid-cols-1 gap-4">
                                <div>
                                    <div className="flex justify-between">
                                        <h5 className="mt-2 mb-2">
                                            1. Upload your files(PDF, CSV)
                                        </h5>
                                    </div>
                                    <div className="mb-4">
                                        <FormItem>
                                            <Field
                                                name="upload"
                                                type="file"
                                                onChange={(e: any) => {
                                                    setFiles([
                                                        e.target.files[0],
                                                    ])
                                                }}
                                                className="mb-2"
                                            />
                                        </FormItem>

                                        {files && files.length > 0 && (
                                            <>
                                                <div className="flex justify-between">
                                                    <label className="mt-2 mb-3">
                                                        Title of Document
                                                    </label>
                                                    {/* <Tooltip title="Give hints">
                                                        <Button
                                                            size="sm"
                                                            variant="plain"
                                                            type="button"
                                                            onClick={() =>
                                                                setErrorMessage('')
                                                            }
                                                        >
                                                            <HiLightBulb className="text-xl" />
                                                        </Button>
                                                    </Tooltip> */}
                                                </div>
                                                <FormItem
                                                    invalid={
                                                        (errors.index &&
                                                            touched.index) as boolean
                                                    }
                                                    errorMessage="Please enter a valid title"
                                                >
                                                    <Field
                                                        name="title"
                                                        type="text"
                                                        placeholder="Business Information, Transactions, Customers, SalesReport, etc."
                                                        value={title}
                                                        onChange={(e: any) => {
                                                            setTitle(
                                                                e.target.value,
                                                            )
                                                            if (
                                                                e.target.value.trim() ===
                                                                ''
                                                            ) {
                                                                setErrorMessage(
                                                                    'Title is required',
                                                                )
                                                            } else {
                                                                setErrorMessage(
                                                                    '',
                                                                )
                                                            }
                                                        }}
                                                        component={Input}
                                                    />
                                                </FormItem>
                                                {errorMessage && (
                                                    <Alert
                                                        showIcon
                                                        className="mb-4 p-1 !important"
                                                        type="danger"
                                                    >
                                                        {errorMessage}
                                                    </Alert>
                                                )}
                                                <div className="mb-4">
                                                    <Button
                                                        size="sm"
                                                        type="button"
                                                        onClick={() =>
                                                            uploadFile(
                                                                setSubmitting,
                                                            )
                                                        }
                                                    >
                                                        Upload file
                                                    </Button>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <h5 className="mb-4">2. Uploaded Files</h5>
                                    <div className="border-t-2 p-2">
                                        <Table>
                                            <THead>
                                                <Tr>
                                                    <Th>FileName</Th>
                                                    <Th>Title</Th>
                                                    <Th>Prefix</Th>
                                                    <Th>Action</Th>
                                                </Tr>
                                            </THead>
                                            <TBody>
                                                {uploadedFiles &&
                                                    uploadedFiles.length >
                                                        0 && (
                                                        <>
                                                            {uploadedFiles.map(
                                                                (file, i) => (
                                                                    <>
                                                                    <Tr key={i}>
                                                                        <Td>
                                                                            {
                                                                                file.fileOriginalName
                                                                            }
                                                                        </Td>
                                                                        <Td>
                                                                            {
                                                                                file.title
                                                                            }
                                                                        </Td>
                                                                        <Td>
                                                                            {
                                                                                file.idPrefix
                                                                            }
                                                                        </Td>
                                                                        <Td>
                                                                            <Tooltip title="Delete File">
                                                                                <span
                                                                                    className="cursor-pointer p-2 hover:text-red-500"
                                                                                    onClick={() =>
                                                                                        // handleDelete(
                                                                                        //     file._id,
                                                                                        // )
                                                                                        setIsConfirmOpen(true)
                                                                                    }
                                                                                >
                                                                                    <HiOutlineTrash />
                                                                                </span>
                                                                            </Tooltip>
                                                                        </Td>
                                                                    </Tr>
                                                                    <ConfirmDialog
                                                                    key={`#${i}`}
                                                                    isOpen={isConfirmOpen}
                                                                    type="danger"
                                                                    title="Delete CSV file"
                                                                    confirmButtonColor="red-600"
                                                                    onClose={hanldeConfirmClose}
                                                                    onRequestClose={hanldeConfirmClose}
                                                                    onCancel={hanldeConfirmClose}
                                                                    onConfirm={() => handleDelete(file._id, setSubmitting)}
                                                                >
                                                                    <p>Are you sure you want to delete this file?</p>
                                                                </ConfirmDialog>
                                                                </>
                                                                )
                                                            )}
                                                        </>
                                                    )}
                                            </TBody>
                                        </Table>
                                    </div>
                                </div>
                            </div>
                            {/* <div className="mt-8">
                                <h6 className="mb-3">Question/Answer list</h6>

                                <Card className="overflow-auto max-h-[500px]">
                                    {qaList.map((qa: QA, i: number) => (
                                        <div key={i} className="block lg:flex">
                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full lg:w-[90%]">
                                                <div>
                                                    <label className="text-white">
                                                        Human #{i + 1}
                                                    </label>
                                                    <Input
                                                        className={`min-h-12`}
                                                        textArea
                                                        value={qa.question}
                                                        onChange={(e) =>
                                                            handleChangeQuestion(
                                                                i,
                                                                e.target.value,
                                                            )
                                                        }
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-white">
                                                        Bot #{i + 1}
                                                    </label>
                                                    <Input
                                                        textArea
                                                        className={`min-h-12`}
                                                        value={qa.answer}
                                                        onChange={(e) =>
                                                            handleChangeAnswer(
                                                                i,
                                                                e.target.value,
                                                            )
                                                        }
                                                    />
                                                </div>
                                            </div>
                                            <div className="w-[5%] pl-0 py-4 lg:pl-4 lg:pt-10">
                                                <Button
                                                    size="sm"
                                                    className="ltr:mr-3 rtl:ml-3 bg-red"
                                                    type="button"
                                                    variant="solid"
                                                    color="red-500"
                                                    icon={<HiMinusCircle />}
                                                    onClick={() =>
                                                        deleteQAField(i)
                                                    } // Attach the deleteQAField function to the 'Delete' button
                                                >
                                                    Del #{i + 1}
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </Card>

                                <div className="flex justify-between items-center py-2 rounded mt-2">
                                    <div>
                                        <Button
                                            size="sm"
                                            className="ltr:mr-3 rtl:ml-3"
                                            type="button"
                                            variant="solid"
                                            color="emerald-500"
                                            onClick={addQAField} 
                                            icon={<HiPlusCircle />}
                                        >
                                            Add
                                        </Button>
                                    </div>

                                </div>
                            </div> */}
                            {/* <label className="items-center"></label>
                            <div className="flex justify-end">
                                <Button size="sm" variant="solid" type="submit">
                                    Save train data
                                </Button>
                                <Button ref={submitBtnRef} type="submit" hidden>
                                    Submit
                                </Button>
                            </div> */}
                        </FormContainer>
                        
                    </Form>
                )}
            </Formik>
        </motion.div>
    )
})

export default TrainAgentForm
